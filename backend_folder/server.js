require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const SERVER_INSTANCE_ID =
  process.env.SERVER_INSTANCE_ID || crypto.randomBytes(8).toString("hex");
const express = require("express");
// Removed legacy better-sqlite3 import (migrated to Postgres pool)
// const db = require("better-sqlite3")("ourApp.db");
// db.pragma("journal_mode = WAL");
const { Pool } = require('pg');
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whattodo';
const pool = new Pool({ connectionString: DATABASE_URL });
const cors = require("cors");
const multer = require("multer");
const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Allow the frontend dev server to send cookies. Do NOT use a wildcard origin
// when `credentials` is true — set the exact origin your frontend uses.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
const upload = multer();

// Authentication middleware: read JWT from cookie and populate req.user
app.use((req, res, next) => {
  try {
    const token = req.cookies && req.cookies.ourSimpleApp;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWTSECRET);
    // If serverInstance was embedded in token, ensure it matches current server
    if (payload && payload.serverInstance && payload.serverInstance !== SERVER_INSTANCE_ID) {
      // token was issued for a different server instance - treat as not authenticated
      return next();
    }
    req.user = {
      userid: payload.userid,
      username: payload.username,
      display_name: payload.display_name,
    };
  } catch (e) {
    // ignore errors and treat as anonymous
  }
  return next();
});

//multer handles form data

// Database setup here
app.post("/register", async (req, res) => {
  let errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";
  const raw = req.body.username.trim();
  const isEmail = raw.includes("@");
  let usernameCandidate = raw;
  let emailValue = null;

  if (isEmail) {
    emailValue = raw.toLowerCase();
    const base =
      emailValue.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
    usernameCandidate = base.slice(0, 10);
    while (true) {
      const { rows: existsRows } = await pool.query('SELECT 1 FROM "user" WHERE username = $1', [usernameCandidate]);
      if (!existsRows || existsRows.length === 0) break;
      usernameCandidate = (
        base.slice(0, 9) + Math.floor(Math.random() * 10)
      ).slice(0, 10);
    }
  } else {
    usernameCandidate = raw;
  }

  if (!usernameCandidate) errors.push("You must provide a username or email.");
  if (!isEmail && usernameCandidate.length < 3)
    errors.push("Username must be at least 3 characters.");
  if (!isEmail && usernameCandidate.length > 10)
    errors.push("Username cannot exceed 10 characters.");
  if (!isEmail && !usernameCandidate.match(/^[a-zA-Z0-9]+$/))
    errors.push("Username can only contain letters and numbers.");

  {
    const { rows: usernameRows } = await pool.query('SELECT * FROM "user" WHERE username = $1', [usernameCandidate]);
    if (usernameRows && usernameRows.length) errors.push("That username is already taken.");
  }
  if (req.body.password.length < 8)
    errors.push("Password must be at least 8 characters.");
  if (req.body.password.length > 70)
    errors.push("Password cannot exceed 70 characters.");

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(req.body.password, salt);
  let newUser;
  try {
    if (emailValue) {
      const { rows } = await pool.query(
        `INSERT INTO "user" (username, password, email, display_name, saved_itineraries, completed_itineraries) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [usernameCandidate, hashed, emailValue, usernameCandidate, JSON.stringify([]), JSON.stringify([])]
      );
      newUser = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO "user" (username, password, display_name, saved_itineraries, completed_itineraries) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [usernameCandidate, hashed, usernameCandidate, JSON.stringify([]), JSON.stringify([])]
      );
      newUser = rows[0];
    }
  } catch (err) {
    console.error("/api/register insert error:", err && err.message ? err.message : err);
    const errors = [];
    if (err && (err.code === "23505" || err.code === "SQLITE_CONSTRAINT" || (err.message && err.message.includes("UNIQUE constraint")))) {
      errors.push("That email or username is already taken.");
      return res.status(400).json({ ok: false, errors });
    }
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }

  // Defensive: ensure display_name is the full usernameCandidate (avoid truncation)
  try {
    if (!newUser.display_name || newUser.display_name !== usernameCandidate) {
      await pool.query('UPDATE "user" SET display_name = $1 WHERE id = $2', [usernameCandidate, newUser.id]);
      const { rows: refreshedRows } = await pool.query('SELECT * FROM "user" WHERE id = $1', [newUser.id]);
      const refreshed = refreshedRows[0];
      console.log("[DEBUG register] refreshed user:", refreshed);
      newUser.display_name = refreshed.display_name;
    }
  } catch (e) {
    console.error("[DEBUG register] display_name enforcement failed:", e);
  }

  // Ensure a deterministic display name value to return and embed in the JWT
  const displayName = newUser.display_name || usernameCandidate || newUser.username;

  const tokenPayload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    userid: newUser.id,
    username: newUser.username,
    display_name: displayName,
    serverInstance: SERVER_INSTANCE_ID,
  };

  const token = jwt.sign(tokenPayload, process.env.JWTSECRET);

  // Use `lax` so the cookie is set when called from the React dev server on another port
  res.cookie("ourSimpleApp", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.json({
    ok: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email || null,
      bio: newUser.bio || "",
      display_name: displayName,
      saved_itineraries: newUser.saved_itineraries || "[]",
      completed_itineraries: newUser.completed_itineraries || "[]",
    },
  });
});
// stray code removed (was an accidental duplicate block)

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.clearCookie("ourSimpleApp");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  let errors = [];

  if (typeof req.body.username != "string") req.body.username = "";
  if (typeof req.body.password != "string") req.body.password = "";

  if (req.body.username.trim() == "") errors = ["You must provide a username."];
  if (req.body.password == "") errors = ["You must provide a password."];

  if (errors.length) {
    return res.render("login", { errors });
  }

  // res.send("Thank you")

  const { rows: loginRows } = await pool.query('SELECT * FROM "user" WHERE username = $1', [req.body.username]);
  const userInQuestion = loginRows[0];

  if (!userInQuestion) {
    errors = ["inavlid username or password."];
    return res.render("login", { errors });
  }

  const matchOrNot = bcrypt.compareSync(
    req.body.password,
    userInQuestion.password
  );
  if (!matchOrNot) {
    errors = ["inavlid username or password."];
    return res.render("login", { errors });
  }

  const ourTokenValue = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      skyColor: "blue",
      userid: userInQuestion.id,
      username: userInQuestion.username,
      serverInstance: SERVER_INSTANCE_ID,
    },
    process.env.JWTSECRET
  );
  res.cookie("ourSimpleApp", ourTokenValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.redirect("/");
});

// old SQLite /register handler removed (replaced by Postgres async handler above)

app.post("/api/login", async (req, res) => {
  let errors = [];
  if (typeof req.body.email !== "string") req.body.email = "";
  if (typeof req.body.password !== "string") req.body.password = "";

  if (!req.body.email.trim()) errors.push("You must provide a username.");
  if (!req.body.password) errors.push("You must provide a password.");

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const { rows: userRows } = await pool.query('SELECT * FROM "user" WHERE email = $1', [req.body.email]);
  const user = userRows[0];

  if (!user)
    return res
      .status(401)
      .json({ ok: false, errors: ["Invalid username or password."] });

  const match = bcrypt.compareSync(req.body.password, user.password);

  if (!match)
    return res
      .status(401)
      .json({ ok: false, errors: ["Invalid username or password."] });

  const tokenPayload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    userid: user.id,
    username: user.username,
    display_name: user.display_name,
    serverInstance: SERVER_INSTANCE_ID,
  };

  const token = jwt.sign(tokenPayload, process.env.JWTSECRET);

  res.cookie("ourSimpleApp", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email || null,
      bio: user.bio || "",
      display_name: user.display_name || user.username,
      saved_itineraries: user.saved_itineraries || "[]",
      completed_itineraries: user.completed_itineraries || "[]",
    },
  });
});

// Register route for React frontend
app.post("/api/register", async (req, res) => {
  let errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";
  const raw = req.body.username.trim();
  const isEmail = raw.includes("@");
  let usernameCandidate = raw;
  let emailValue = null;

  if (isEmail) {
    emailValue = raw.toLowerCase();
    const base =
      emailValue.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
    usernameCandidate = base.slice(0, 10);
    while (true) {
      const { rows: existsRows } = await pool.query('SELECT 1 FROM "user" WHERE username = $1', [usernameCandidate]);
      if (!existsRows || existsRows.length === 0) break;
      usernameCandidate = (
        base.slice(0, 9) + Math.floor(Math.random() * 10)
      ).slice(0, 10);
    }
  } else {
    usernameCandidate = raw;
  }

  if (!usernameCandidate) errors.push("You must provide a username or email.");
  if (!isEmail && usernameCandidate.length < 3)
    errors.push("Username must be at least 3 characters.");
  if (!isEmail && usernameCandidate.length > 10)
    errors.push("Username cannot exceed 10 characters.");
  if (!isEmail && !usernameCandidate.match(/^[a-zA-Z0-9]+$/))
    errors.push("Username can only contain letters and numbers.");

  const { rows: usernameRows } = await pool.query('SELECT * FROM "user" WHERE username = $1', [usernameCandidate]);
  if (usernameRows && usernameRows.length) errors.push("That username is already taken.");

  if (!req.body.password) errors.push("You must provide a password.");
  if (req.body.password.length < 8)
    errors.push("Password must be at least 8 characters.");
  if (req.body.password.length > 70)
    errors.push("Password cannot exceed 70 characters.");

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(req.body.password, salt);
  const savedItineraries = JSON.stringify([]);
  const completedItineraries = JSON.stringify([]);
  let newUser;
  // Persist display_name on API registration as well so the frontend doesn't
  // need to perform an extra update to set it.
  try {
    if (emailValue) {
      const { rows } = await pool.query(
        `INSERT INTO "user" (username, password, email, display_name, saved_itineraries, completed_itineraries) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [usernameCandidate, hashed, emailValue, usernameCandidate, savedItineraries, completedItineraries]
      );
      newUser = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO "user" (username, password, display_name, saved_itineraries, completed_itineraries) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [usernameCandidate, hashed, usernameCandidate, savedItineraries, completedItineraries]
      );
      newUser = rows[0];
    }
  } catch (err) {
    console.error("/api/register insert error:", err && err.message ? err.message : err);
    const errors = [];
    if (err && (err.code === "23505" || err.code === "SQLITE_CONSTRAINT" || (err.message && err.message.includes("UNIQUE constraint")))) {
      errors.push("That email or username is already taken.");
      return res.status(400).json({ ok: false, errors });
    }
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }


  // Debug logging to diagnose username/display_name anomalies
  try {
    console.log("[DEBUG register] inserted values:", {
      usernameCandidate,
      emailValue,
      userId: newUser && newUser.id,
    });
    console.log("[DEBUG register] newUser from DB:", newUser);
  } catch (e) {
    console.error("[DEBUG register] logging failed:", e);
  }

  // Defensive: ensure display_name is the full usernameCandidate (avoid truncation)
  try {
    if (!newUser.display_name || newUser.display_name !== usernameCandidate) {
      await pool.query('UPDATE "user" SET display_name = $1 WHERE id = $2', [usernameCandidate, newUser.id]);
      // re-read the user row after the enforced update
      const { rows: refreshedRows } = await pool.query('SELECT * FROM "user" WHERE id = $1', [newUser.id]);
      const refreshed = refreshedRows[0];
      console.log("[DEBUG register] refreshed user:", refreshed);
      // replace newUser reference so downstream token/response use the corrected value
      newUser.display_name = refreshed.display_name;
    }
  } catch (e) {
    console.error("[DEBUG register] display_name enforcement failed:", e);
  }

  // Ensure a deterministic display name value to return and embed in the JWT
  const displayName = newUser.display_name || usernameCandidate || newUser.username;

  const tokenPayload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    userid: newUser.id,
    username: newUser.username,
    display_name: displayName,
    serverInstance: SERVER_INSTANCE_ID,
  };

  const token = jwt.sign(tokenPayload, process.env.JWTSECRET);

  // Use `lax` so the cookie is set when called from the React dev server on another port
  res.cookie("ourSimpleApp", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.json({
    ok: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email || null,
      bio: newUser.bio || "",
      display_name: displayName,
      saved_itineraries: newUser.saved_itineraries || "[]",
      completed_itineraries: newUser.completed_itineraries || "[]",
    },
  });
});

app.post("/api/oauth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res
        .status(400)
        .json({ ok: false, errors: ["Missing access_token"] });
    }

    const g = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!g.ok) {
      return res
        .status(401)
        .json({ ok: false, errors: ["Invalid Google token"] });
    }

    const profile = await g.json();
    if (!profile.email || profile.email_verified === false) {
      return res
        .status(400)
        .json({ ok: false, errors: ["Google email not verified"] });
    }

    let user = null;
    const { rows: byGoogle } = await pool.query('SELECT * FROM "user" WHERE google_sub = $1', [profile.sub]);
    if (byGoogle && byGoogle.length) user = byGoogle[0];
    if (!user) {
      const { rows: byEmail } = await pool.query('SELECT * FROM "user" WHERE email = $1', [profile.email]);
      if (byEmail && byEmail.length) user = byEmail[0];
    }
    if (!user) {
      const { rows: byUsername } = await pool.query('SELECT * FROM "user" WHERE username = $1', [profile.email]);
      if (byUsername && byUsername.length) user = byUsername[0];
    }

    if (user) {
      if (!user.email) {
        await pool.query('UPDATE "user" SET email = $1 WHERE id = $2', [profile.email, user.id]);
        user.email = profile.email;
      }
      if (!user.google_sub) {
        await pool.query('UPDATE "user" SET google_sub = $1 WHERE id = $2', [profile.sub, user.id]);
        user.google_sub = profile.sub;
      }
    } else {
      const base =
        profile.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
      let username = base.slice(0, 10);
      while (true) {
        const { rows: exists } = await pool.query('SELECT 1 FROM "user" WHERE username = $1', [username]);
        if (!exists || exists.length === 0) break;
        username = base.slice(0, 9) + Math.floor(Math.random() * 10);
      }

      const salt = bcrypt.genSaltSync(10);
      const randomPass = bcrypt.hashSync(Math.random().toString(36), salt);
      const savedItineraries = JSON.stringify([]);
      const completedItineraries = JSON.stringify([]);
      const { rows: inserted } = await pool.query(
        `INSERT INTO "user" (username, password, email, google_sub, display_name, saved_itineraries, completed_itineraries) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [username, randomPass, profile.email, profile.sub, profile.name || username, JSON.stringify([]), JSON.stringify([])]
      );
      user = inserted[0];
    }

    // Make sure display_name is set for existing users too
    if (!user.display_name) {
      const display = profile.name || user.username;
      await pool.query('UPDATE "user" SET display_name = $1 WHERE id = $2', [display, user.id]);
      user.display_name = display;
    }

    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        userid: user.id,
        username: user.username,
        display_name: user.display_name,
        serverInstance: SERVER_INSTANCE_ID,
      },
      process.env.JWTSECRET
    );
    res.cookie("ourSimpleApp", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || null,
        bio: user.bio || "",
        display_name: user.display_name || user.username,
        saved_itineraries: user.saved_itineraries || "[]",
        completed_itineraries: user.completed_itineraries || "[]",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post("/api/auth/logout", (req, res) => {
  // Safe logout endpoint: this app doesn't use express-session.
  // Clear the auth cookie set by the app and respond with JSON.
  try {
    res.clearCookie("ourSimpleApp");
    return res.status(200).json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ ok: false, errors: ["Logout failed"] });
  }
});

//profile route to update bio
//frontend used user/setup so had to change from profile

app.post(
  "/api/user/setup",
  upload.fields([{ name: "profilePicture" }]),
  async (req, res) => {
    console.log("=== USER SETUP ATTEMPT ===");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User auth status:", req.user);

    // Auth check
    if (!req.user) {
      console.log("❌ User not authenticated");
      return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    }

    const errors = [];

    // Normalize incoming values. Use `undefined` when the field was not provided
    // so we don't accidentally overwrite existing DB values with empty strings.
    // Treat empty/whitespace-only strings as "not provided" so we don't
    // accidentally overwrite existing values with empty strings.
    const bio_trim =
      typeof req.body.bio === "string" ? req.body.bio.trim() : undefined;
    const bio_raw = bio_trim && bio_trim.length > 0 ? bio_trim : undefined;

    const username_trim =
      typeof req.body.username === "string"
        ? req.body.username.trim()
        : undefined;
    const newUsername =
      username_trim && username_trim.length > 0 ? username_trim : undefined;

    const display_trim =
      typeof req.body.display_name === "string"
        ? req.body.display_name.trim()
        : undefined;
    const display_name_raw =
      display_trim && display_trim.length > 0 ? display_trim : undefined;

    // Validate lengths only for provided fields
    if (bio_raw !== undefined && bio_raw.length > 500)
      errors.push("Bio must be 500 characters or less");
    if (display_name_raw !== undefined && display_name_raw.length > 50)
      errors.push("Display name must be 50 characters or less");
    if (newUsername && newUsername.length > 70)
      errors.push("Username cannot exceed 70 characters.");

    // Determine whether the submitted username looks like an email
    const isEmail =
      typeof newUsername === "string" && newUsername.includes("@");

    // Only check uniqueness if a new value was provided and it differs from the
    // current canonical value (email or username).
    if (
      newUsername &&
      ((isEmail && newUsername !== req.user.email) ||
        (!isEmail && newUsername !== req.user.username))
    ) {
      try {
        if (isEmail) {
          const { rows: existingEmail } = await pool.query('SELECT id FROM "user" WHERE email = $1', [newUsername.toLowerCase()]);
          if (existingEmail && existingEmail[0] && existingEmail[0].id !== req.user.userid) {
            errors.push("That email is already taken.");
          }
        } else {
          const { rows: existing } = await pool.query('SELECT id FROM "user" WHERE username = $1', [newUsername]);
          if (existing && existing[0] && existing[0].id !== req.user.userid) {
            errors.push("That username is already taken.");
          }
        }
      } catch (err) {
        console.error("Error checking uniqueness:", err);
        errors.push("Server error while checking availability.");
      }
    }

    if (errors.length) {
      return res.status(400).json({ ok: false, errors });
    }

    try {
      // Build UPDATE statement dynamically (only change fields that were provided)
      const updates = [];
      const params = [];

      if (bio_raw !== undefined) {
        updates.push("bio = ?");
        params.push(bio_raw);
      }

      // If the client provided a display_name explicitly, use it.
      // Otherwise, if the client is changing their username, keep display_name
      // in sync by default (use local-part for emails).
      let displayForUpdate = undefined;
      if (display_name_raw !== undefined) {
        displayForUpdate = display_name_raw;
      } else if (newUsername) {
        displayForUpdate = isEmail
          ? newUsername.split("@")[0].replace(/[^a-zA-Z0-9 ]/g, "")
          : newUsername;
      }

      if (displayForUpdate !== undefined) {
        updates.push("display_name = ?");
        params.push(displayForUpdate);
      }

      if (newUsername) {
        if (isEmail) {
          updates.push("email = ?");
          params.push(newUsername.toLowerCase());
        } else {
          updates.push("username = ?");
          params.push(newUsername);
        }
      }

      if (updates.length > 0) {
        const sql = `UPDATE "user" SET ${updates.join(",")} WHERE id = ?`;
        params.push(req.user.userid);
        // convert ? placeholders to $1..$n
        let idx = 1;
        const dollarSql = sql.replace(/\?/g, () => "$" + (idx++));
        await pool.query(dollarSql, params);
      }

      // Read back canonical user data
      const { rows: updatedRows } = await pool.query('SELECT id, username, email, bio, display_name FROM "user" WHERE id = $1', [req.user.userid]);
      const updatedUser = updatedRows[0];

      // Reissue JWT so the cookie and req.user reflect the change immediately.
      // Include display_name in the token so downstream code can access it.
      const token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
          userid: updatedUser.id,
          username: updatedUser.username,
          display_name: updatedUser.display_name,
          serverInstance: SERVER_INSTANCE_ID,
        },
        process.env.JWTSECRET
      );

      res.cookie("ourSimpleApp", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24,
      });

      return res.json({
        ok: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ ok: false, errors: ["Server error"] });
    }
  }
);

//get current user info
//frontend kept asking for this
app.get("/api/user/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  const { rows: userRows } = await pool.query('SELECT id, username, email, bio, display_name, saved_itineraries, completed_itineraries FROM "user" WHERE id = $1', [req.user.userid]);
  const userData = userRows[0];

  if (!userData) {
    return res.status(404).json({ ok: false, errors: ["User not found"] });
  }

  res.json({ ok: true, user: userData });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("ourSimpleApp");
  res.json({ ok: true, message: "Logged out" });
});

app.get("/api/itineraries", async (req, res) => {
  const { rows: itineraries } = await pool.query('SELECT * FROM itineraries');

  res.json({ ok: true, itineraries });
});
app.post("/api/create-itinerary", async (req, res) => {
  console.log("Create itinerary request received");
  console.log("User from session:", req.user);
  console.log("Request body:", req.body);

  if (!req.user) {
    console.log("No user in session - unauthorized");
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  const {
    title,
    description,
    tags,
    duration,
    rating,
    rating_count,
    total_rating,
    destinations,
    price,
  } = req.body;

  if (!title || !description || !duration || !price) {
    return res
      .status(400)
      .json({ ok: false, errors: ["Missing required fields"] });
  }

  try {
    const { rows: userRows } = await pool.query('SELECT display_name, username FROM "user" WHERE id = $1', [req.user.userid]);
    const userRow = userRows[0];
    const authorname = (userRow && (userRow.display_name || userRow.username)) || null;
    // Ensure JSONB columns receive valid JSON text. If the client sent
    // arrays/objects, stringify them; if they sent JSON text, use as-is.
    const tagsParam =
      typeof tags === "string" ? tags : JSON.stringify(tags || []);
    const destinationsParam =
      typeof destinations === "string"
        ? destinations
        : JSON.stringify(destinations || []);

    // tagsParam and destinationsParam prepared (stringified where needed)

    const { rows: inserted } = await pool.query(
      `INSERT INTO itineraries
        (title, description, tags, duration, price,
         rating, rating_count, total_rating,
         destinations, authorid, authorname)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        title,
        description,
        tagsParam,
        duration,
        price,
        rating,
        rating_count,
        total_rating,
        destinationsParam,
        req.user.userid,
        authorname,
      ]
    );

    const insertedId = inserted[0] && inserted[0].id;

    console.log("Itinerary created with ID:", insertedId, "for user:", req.user.userid, "authorname:", authorname);

    res.json({ ok: true, message: "Itinerary created successfully", itineraryId: insertedId });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post("/api/give-rating", async (req, res) => {
  try {
    const { id, rating, rating_count, total_rating } = req.body || {};
    const itineraryId = Number(id);
    const ratingTemp = Number(rating);
    const { rows: ratingRows } = await pool.query('SELECT rating_count, total_rating from itineraries WHERE id = $1', [req.body.id]);
    const ratingTally = ratingRows[0];
    console.log(ratingTally.rating_count);
    const ratingCount = ratingTally.rating_count + 1;
    const totalTemp = ratingTally.total_rating;
    const totalRating = totalTemp + ratingTemp;
    const ratingNum = Number((totalRating / ratingCount).toFixed(2));
    if (!Number.isFinite(itineraryId)) {
      return res
        .status(400)
        .json({ ok: false, errors: ["Missing or invalid itinerary id"] });
    }
    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({
        ok: false,
        errors: ["Rating must be a number between 0 and 5"],
      });
    }

    const update1 = await pool.query('UPDATE itineraries SET rating = $1 WHERE id = $2', [ratingNum, itineraryId]);
    const update2 = await pool.query('UPDATE itineraries SET total_rating = $1 WHERE id = $2', [totalRating, itineraryId]);
    const update3 = await pool.query('UPDATE itineraries SET rating_count = $1 WHERE id = $2', [ratingCount, itineraryId]);
    if (update1.rowCount === 0) {
      return res.status(404).json({ ok: false, errors: ["Itinerary not found"] });
    }

    console.log("Itinerary rated:", {
      itineraryId,
      rating: ratingNum,
      ratingCount,
      totalRating,
      byUser: req.user?.userid,
    });
    return res.json({
      ok: true,
      message: "Itinerary rated successfully",
      rating: ratingNum,
      rating_count: ratingCount,
      total_rating: totalRating,
    });
  } catch (err) {
    console.error("Error rating itinerary:", err);
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

// Get itineraries for the logged-in user
app.get("/api/my-itineraries", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  try {
    const { rows: itineraries } = await pool.query('SELECT * FROM itineraries WHERE authorid = $1 ORDER BY id DESC', [req.user.userid]);

    // Return in the format your frontend expects
    res.json({
      ok: true,
      itineraries: itineraries.map((itinerary) => ({
        ...itinerary,
        createdBy: itinerary.authorid,
        rating: 0, // Add default rating since your DB doesn't have this column
        destinations: [], // Add empty destinations array
      })),
    });
  } catch (error) {
    console.error("Error fetching user itineraries:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] }); 
  }
});

app.get("/api/my-saved-itineraries", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  try {
    const user_id = req.user.userid;

    const { rows: rowRows } = await pool.query('SELECT saved_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0];

    let arr;
    try {
      arr = JSON.parse(row?.saved_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    if (arr.length === 0) {
      return res.json({ ok: true, itineraries: [] });
    }

    const placeholders = arr.map((_, i) => `$${i+1}`).join(",");
    const { rows: itineraries } = await pool.query(
      `SELECT * FROM itineraries WHERE id IN (${placeholders})`,
      arr
    );

    res.json({
      ok: true,
      itineraries: itineraries.map((itinerary) => ({
        ...itinerary,
        createdBy: itinerary.authorid,
        rating: 0,       
        destinations: [], 
      })),
    });
  } catch (error) {
    console.error("Error fetching user itineraries:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.get("/api/my-completed-itineraries", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  try {
    const user_id = req.user.userid;

    const { rows: rowRows } = await pool.query('SELECT completed_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0];

    let arr;
    try {
      arr = JSON.parse(row?.completed_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    if (arr.length === 0) {
      return res.json({ ok: true, itineraries: [] });
    }

    const placeholders = arr.map((_, i) => `$${i+1}`).join(",");
    const { rows: itineraries } = await pool.query(
      `SELECT * FROM itineraries WHERE id IN (${placeholders})`,
      arr
    );

    res.json({
      ok: true,
      itineraries: itineraries.map((itinerary) => ({
        ...itinerary,
        createdBy: itinerary.authorid,
        rating: 0,       
        destinations: [], 
      })),
    });
  } catch (error) {
    console.error("Error fetching user itineraries:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

// Add debug endpoint
app.get("/api/debug/my-itineraries", async (req, res) => {
  if (!req.user) {
    return res.json({ user: null, message: "No user logged in" });
  }

  try {
    console.log("Debug: User ID:", req.user.userid);

    const { rows: itineraries } = await pool.query('SELECT * FROM itineraries WHERE authorid = $1', [req.user.userid]);

    console.log("Debug: Found itineraries:", itineraries);

    res.json({
      user: req.user,
      itineraries: itineraries,
      count: itineraries.length,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.json({ error: error.message });
  }
});

// Add test itineraries (run this once)
app.get("/api/create-test-itineraries", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const testItineraries = [
      {
        title: "My First Adventure",
        description: "A wonderful day exploring the city",
        tags: JSON.stringify(["park", "walking"]),
        duration: "1 day",
        price: "$$",
        authorid: req.user.userid,
      },
      {
        title: "Food Tour",
        description: "Tasting the best local cuisine",
        tags: JSON.stringify(["food", "cultural"]),
        duration: "4 hours",
        price: "$$$",
        authorid: req.user.userid,
      },
    ];

    for (const itinerary of testItineraries) {
      await pool.query(
        "INSERT INTO itineraries (title, description, tags, duration, price, destinations, authorid) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [itinerary.title, itinerary.description, itinerary.tags, itinerary.duration, itinerary.price, itinerary.destinations, itinerary.authorid]
      );
    }

    res.json({
      message: "Test itineraries created",
      count: testItineraries.length,
    });
  } catch (error) {
    console.error("Error creating test itineraries:", error);
    res.status(500).json({ error: "Failed to create test data" });
  }
});

app.post("/api/delete-itinerary", async (req, res) => {
  try {
    const { id } = req.body;

    const deletion = await pool.query('DELETE FROM itineraries WHERE id = $1', [id]);

    if (deletion.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Itinerary not found" });
    }
    // Cleanup deleted itinerary id from users' saved and completed arrays
    try {
      const { rows: users } = await pool.query('SELECT id, saved_itineraries, completed_itineraries FROM "user"');
      for (const u of users) {
        let saved = [];
        let completed = [];
        try {
          saved = JSON.parse(u.saved_itineraries || '[]') || [];
        } catch {
          saved = [];
        }
        try {
          completed = JSON.parse(u.completed_itineraries || '[]') || [];
        } catch {
          completed = [];
        }
        const newSaved = saved.filter((sid) => Number(sid) !== Number(id));
        const newCompleted = completed.filter((cid) => Number(cid) !== Number(id));
        if (newSaved.length !== saved.length || newCompleted.length !== completed.length) {
          await pool.query('UPDATE "user" SET saved_itineraries = $1, completed_itineraries = $2 WHERE id = $3', [JSON.stringify(newSaved), JSON.stringify(newCompleted), u.id]);
        }
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up user references after delete:', cleanupErr);
    }

    res.json({ ok: true, deleted: deletion.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Delete failed" });
  }
});

app.post("/api/save-itinerary", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    const { saved_itinerary } = req.body || {};
    const user_id = req.user.userid;
    const itineraryId = Number(saved_itinerary);
    if (!Number.isFinite(itineraryId))
      return res.status(400).json({ ok: false, errors: ["Invalid itinerary id"] });

    // ensure itinerary exists
    const { rows: existsRows } = await pool.query('SELECT 1 FROM itineraries WHERE id = $1', [itineraryId]);
    if (!existsRows || existsRows.length === 0) return res.status(404).json({ ok: false, errors: ["Itinerary not found"] });

    const { rows: rowRows } = await pool.query('SELECT saved_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0] || {};
    let arr;
    try {
      arr = JSON.parse(row.saved_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    if (!arr.includes(itineraryId)) {
      arr.push(itineraryId);
      await pool.query('UPDATE "user" SET saved_itineraries = $1 WHERE id = $2', [JSON.stringify(arr), user_id]);
    }

    return res.json({ ok: true, saved_itineraries: arr });
  } catch (err) {
    console.error("Error saving itinerary:", err);
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post("/api/complete-itinerary", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    const { completed_itinerary } = req.body || {};
    const user_id = req.user.userid;
    const itineraryId = Number(completed_itinerary);
    if (!Number.isFinite(itineraryId))
      return res.status(400).json({ ok: false, errors: ["Invalid itinerary id"] });

    // ensure itinerary exists
    const { rows: existsRows } = await pool.query('SELECT 1 FROM itineraries WHERE id = $1', [itineraryId]);
    if (!existsRows || existsRows.length === 0) return res.status(404).json({ ok: false, errors: ["Itinerary not found"] });

    const { rows: rowRows } = await pool.query('SELECT completed_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0] || {};
    let arr;
    try {
      arr = JSON.parse(row.completed_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    if (!arr.includes(itineraryId)) {
      arr.push(itineraryId);
      await pool.query('UPDATE "user" SET completed_itineraries = $1 WHERE id = $2', [JSON.stringify(arr), user_id]);
    }

    return res.json({ ok: true, completed_itineraries: arr });
  } catch (err) {
    console.error("Error completing itinerary:", err);
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

// Unmark a completed itinerary
app.post('/api/uncomplete-itinerary', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    const { completed_itinerary } = req.body || {};
    const user_id = req.user.userid;
    const itineraryId = Number(completed_itinerary);
    if (!Number.isFinite(itineraryId))
      return res.status(400).json({ ok: false, errors: ["Invalid itinerary id"] });

    const { rows: rowRows } = await pool.query('SELECT completed_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0] || {};
    let arr;
    try {
      arr = JSON.parse(row.completed_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    const newArr = arr.filter((id) => Number(id) !== itineraryId);
    if (newArr.length !== arr.length) {
      await pool.query('UPDATE "user" SET completed_itineraries = $1 WHERE id = $2', [JSON.stringify(newArr), user_id]);
    }

    return res.json({ ok: true, completed_itineraries: newArr });
  } catch (err) {
    console.error('Error uncompleting itinerary:', err);
    return res.status(500).json({ ok: false, errors: ['Server error'] });
  }
});

app.post("/api/update-itinerary", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    const { itinerary_id } = req.body.id || {};
    const { id, itinerary } = req.body || {};
    const itineraryId = Number(id);
    console.log(req.body.id);
    if (!Number.isFinite(itineraryId))
      return res.status(400).json({ ok: false, errors: ["Invalid itinerary id"] });
    await pool.query(`
      UPDATE itineraries 
      SET title = $1,
        description = $2,
        tags = $3,
        duration = $4,
        price = $5,
        rating = $6,
        rating_count = $7,
        total_rating = $8,
        destinations = $9
      WHERE id = $10
    `, [
      req.body.title,
      req.body.description,
      req.body.tags,
      req.body.duration,
      req.body.price,
      req.body.rating,
      req.body.rating_count,
      req.body.total_rating,
      req.body.destinations,
      req.body.id,
    ]);

    return res.json({
      ok: true,
      message: "Itinerary updated successfully",
      itineraryId,
    });
  } catch (err) {
    console.error("Error editing itinerary:", err);
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post('/api/unsave-itinerary', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, errors: ["Not logged in"] });
    const { saved_itinerary } = req.body || {};
    const user_id = req.user.userid;
    const itineraryId = Number(saved_itinerary);
    if (!Number.isFinite(itineraryId))
      return res.status(400).json({ ok: false, errors: ["Invalid itinerary id"] });

    const { rows: rowRows } = await pool.query('SELECT saved_itineraries FROM "user" WHERE id = $1', [user_id]);
    const row = rowRows[0] || {};
    let arr;
    try {
      arr = JSON.parse(row.saved_itineraries || "[]");
      if (!Array.isArray(arr)) arr = [];
    } catch {
      arr = [];
    }

    const newArr = arr.filter((id) => Number(id) !== itineraryId);
    if (newArr.length !== arr.length) {
      await pool.query('UPDATE "user" SET saved_itineraries = $1 WHERE id = $2', [JSON.stringify(newArr), user_id]);
    }

    return res.json({ ok: true, saved_itineraries: newArr });
  } catch (err) {
    console.error('Error uncompleting itinerary:', err);
    return res.status(500).json({ ok: false, errors: ['Server error'] });
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));