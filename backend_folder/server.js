require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser')
const express = require("express")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")
const cors = require("cors");
const multer = require("multer"); 

//multer handles form data


// Database setup here
const createTables = db.transaction(() => {
  db.prepare(`
        CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
        )
        `).run()

  db.prepare(`
        CREATE TABLE IF NOT EXISTS itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title STRING NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
        duration TEXT NOT NULL,
        price TEXT NOT NULL,
        authorid INTEGER,
        rating INTEGER,
        FOREIGN KEY (authorid) REFERENCES user (id)
        )
        `).run()
})

createTables();

try { db.prepare("ALTER TABLE user ADD COLUMN email TEXT").run(); } catch { }
try { db.prepare("ALTER TABLE user ADD COLUMN google_sub TEXT").run(); } catch { }

//for bio; find the code at line 305
try { db.prepare("ALTER TABLE user ADD COLUMN bio TEXT").run(); } catch { }

db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user(email)").run();
db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_google_sub ON user(google_sub)").run();
try {
  db.prepare("UPDATE user SET email = username WHERE instr(username,'@') > 0 AND email IS NULL").run();
} catch (error) {
  console.log("Skipping email migration due to duplicate emails");
}
// Database setup end
const app = express()

app.use(express.json());

//configure multer for handling multipart/form-data
const upload = multer();

//for display names
try { db.prepare("ALTER TABLE user ADD COLUMN display_name TEXT").run(); }
catch { }

app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3002"], // React dev server
  credentials: true
})); //added 3002 bc it kept putting me in that for now, will fix later
//TODO: Get rid of 3002 origin

//log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(cookieParser())

app.use(function (req, res, next) {
  res.locals.errors = []

  //try to decode incoming cookie
  try {
    const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET)
    req.user = decoded
  } catch (err) {
    req.user = false
  }

  res.locals.user = req.user
  console.log(req.user)

  next()
})

app.get("/", (req, res) => {
  if (req.user) {
    res.render("dashboard")
  } else {
    res.render("homepage")
  }
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/logout", (req, res) => {
  res.clearCookie("ourSimpleApp")
  res.redirect("/")
})

app.post("/login", (req, res) => {
  let errors = []

  if (typeof req.body.username != "string") req.body.username = ""
  if (typeof req.body.password != "string") req.body.password = ""

  if (req.body.username.trim() == "") errors = ["You must provide a username."]
  if (req.body.password == "") errors = ["You must provide a password."]

  if (errors.length) {
    return res.render("login", { errors })
  }

  // res.send("Thank you")

  const userInQuestionStatement = db.prepare("SELECT * FROM user WHERE USERNAME = ?")
  const userInQuestion = userInQuestionStatement.get(req.body.username)

  if (!userInQuestion) {
    errors = ["inavlid username or password."]
    return res.render("login", { errors })
  }

  const matchOrNot = bcrypt.compareSync(req.body.password, userInQuestion.password)
  if (!matchOrNot) {
    errors = ["inavlid username or password."]
    return res.render("login", { errors })
  }

  const ourTokenValue = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skyColor: "blue", userid: userInQuestion.id, username: userInQuestion.username },
    process.env.JWTSECRET)
  res.cookie("ourSimpleApp", ourTokenValue, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24
  })
  res.redirect("/")

})

app.post("/register", (req, res) => {
  const errors = []

  if (typeof req.body.username != "string") req.body.username = ""
  if (typeof req.body.password != "string") req.body.password = ""

  req.body.username = req.body.username.trim()

  if (!req.body.username) errors.push("You must provide a username.")
  if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 characters.")
  if (req.body.username && req.body.username.length > 10) errors.push("Username cannot exceed 10 characters.")
  if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.")

  //check if username is already taken
  const usernameStatement = db.prepare("SELECT * FROM user WHERE USERNAME = ?")
  const usernameCheck = usernameStatement.get(req.body.username)

  if (usernameCheck) errors.push("That username is already taken.")

  if (!req.body.password) errors.push("You must provide a password.")
  if (req.body.password && req.body.password.length < 8) errors.push("Password must be at least 8 characters.")
  if (req.body.password && req.body.password.length > 70) errors.push("password cannot exceed 70 characters.")

  if (errors.length) {
    return res.render("homepage", { errors })
  }
  // save the new user
  const salt = bcrypt.genSaltSync(10)
  req.body.password = bcrypt.hashSync(req.body.password, salt)
  const ourStatement = db.prepare("INSERT INTO user (username, password) VALUES (?, ?)")
  const result = ourStatement.run(req.body.username, req.body.password)

  const lookupStatement = db.prepare("SELECT * FROM user WHERE ROWID = ?")
  const ourUser = lookupStatement.get(result.lastInsertRowid)
  // log the user in by giving them a cookie
  const ourTokenValue = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skyColor: "blue", userid: ourUser.id, username: ourUser.username }, process.env.JWTSECRET)
  res.cookie("ourSimpleApp", ourTokenValue, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24
  })
  res.redirect("/")
})

app.post("/api/login", (req, res) => {
  let errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";

  if (!req.body.username.trim()) errors.push("You must provide a username.");
  if (!req.body.password) errors.push("You must provide a password.");

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const user = db.prepare("SELECT * FROM user WHERE username = ?").get(req.body.username);
  if (!user) return res.status(401).json({ ok: false, errors: ["Invalid username or password."] });

  const match = bcrypt.compareSync(req.body.password, user.password);
  if (!match) return res.status(401).json({ ok: false, errors: ["Invalid username or password."] });

  const token = jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, userid: user.id, username: user.username },
    process.env.JWTSECRET
  );

  res.cookie("ourSimpleApp", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24
  });

  res.json({ ok: true, user: { id: user.id, username: user.username } });
});


// Register route for React frontend
app.post("/api/register", (req, res) => {
  let errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";
  req.body.username = req.body.username.trim();

  if (!req.body.username) errors.push("You must provide a username.");
  if (req.body.username.length < 3) errors.push("Username must be at least 3 characters.");



  const usernameCheck = db.prepare("SELECT * FROM user WHERE username = ?").get(req.body.username);
  if (usernameCheck) errors.push("That username is already taken.");

  if (!req.body.password) errors.push("You must provide a password.");
  if (req.body.password.length < 8) errors.push("Password must be at least 8 characters.");
  if (req.body.password.length > 70) errors.push("Password cannot exceed 70 characters.");

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const result = db.prepare("INSERT INTO user (username, password) VALUES (?, ?)").run(req.body.username, req.body.password);
  const newUser = db.prepare("SELECT * FROM user WHERE rowid = ?").get(result.lastInsertRowid);

  const token = jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, userid: newUser.id, username: newUser.username },
    process.env.JWTSECRET
  );

  res.cookie("ourSimpleApp", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24
  });

  res.json({ ok: true, user: { id: newUser.id, username: newUser.username } });
});

app.post("/api/oauth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ ok: false, errors: ["Missing access_token"] });

    const g = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!g.ok) return res.status(401).json({ ok: false, errors: ["Invalid Google token"] });

    const profile = await g.json();
    if (!profile.email || profile.email_verified === false) {
      return res.status(400).json({ ok: false, errors: ["Google email not verified"] });
    }

    let user =
      db.prepare("SELECT * FROM user WHERE google_sub = ?").get(profile.sub) ||
      db.prepare("SELECT * FROM user WHERE email = ?").get(profile.email) ||
      db.prepare("SELECT * FROM user WHERE username = ?").get(profile.email);

    if (user) {
      if (!user.email) db.prepare("UPDATE user SET email = ? WHERE id = ?").run(profile.email, user.id);
      if (!user.google_sub) db.prepare("UPDATE user SET google_sub = ? WHERE id = ?").run(profile.sub, user.id);
    } else {
      const base = profile.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
      let username = base.slice(0, 10);
      while (db.prepare("SELECT 1 FROM user WHERE username = ?").get(username)) {
        username = base.slice(0, 9) + Math.floor(Math.random() * 10);
      }
      const salt = bcrypt.genSaltSync(10);
      const randomPass = bcrypt.hashSync(Math.random().toString(36), salt);

      const ins = db.prepare(
        "INSERT INTO user (username, password, email, google_sub) VALUES (?, ?, ?, ?)"
      ).run(username, randomPass, profile.email, profile.sub);

      user = db.prepare("SELECT * FROM user WHERE rowid = ?").get(ins.lastInsertRowid);
    }

    const token = jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, userid: user.id, username: user.username },
      process.env.JWTSECRET
    );
    res.cookie("ourSimpleApp", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

//profile route to update bio
//frontend used user/setup so had to change from profile

app.post("/api/user/setup", upload.fields([{ name: 'profilePicture' }]), (req, res) => {
  console.log("=== USER SETUP ATTEMPT ===");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  console.log("User auth status:", req.user);

  //check if user is authenticated
  if (!req.user) {
    console.log("❌ User not authenticated");
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  let errors = [];

  // Handle both JSON and form data - map username to display_name
  const bio = req.body.bio || "";

  //frontend and backend uses either/or, so this takes whichever is provided
  const display_name = req.body.username || req.body.display_name || "";

  console.log("Received bio:", bio);
  console.log("Received display_name:", display_name);

  //validate length
  if (bio.length > 500) errors.push("Bio must be 500 characters or less");
  if (display_name.length > 50) errors.push("Display name must be 50 characters or less");

  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    // Update the user's bio and display name in the database
    console.log("Updating user ID:", req.user.userid, "with bio:", bio, "display_name:", display_name);
    const updateStatement = db.prepare("UPDATE user SET bio = ?, display_name = ? WHERE id = ?");
    updateStatement.run(bio, display_name, req.user.userid);

    // Get the updated user info
    const userStatement = db.prepare("SELECT id, username, email, bio, display_name FROM user WHERE id = ?");
    const updatedUser = userStatement.get(req.user.userid);

    res.json({
      ok: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});



// Get current user info
//frontend kept asking for this
app.get("/api/user/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }
  
  const userStatement = db.prepare("SELECT id, username, email, bio, display_name FROM user WHERE id = ?");
  const userData = userStatement.get(req.user.userid);
  
  if (!userData) {
    return res.status(404).json({ ok: false, errors: ["User not found"] });
  }
  
  res.json({ ok: true, user: userData });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("ourSimpleApp");
  res.json({ ok: true, message: "Logged out" });
});

app.get("/api/itineraries", (req, res) => {
  const statement = db.prepare("SELECT * FROM itineraries")
  const itineraries = statement.all()

  res.json({ ok: true, itineraries });
}) 

app.post("/api/create-itinerary", (req, res) => {
  console.log("Create itinerary request received");
  console.log("User from session:", req.user);
  console.log("Request body:", req.body);

  if (!req.user) {
    console.log("No user in session - unauthorized");
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  const { title, description, tags, duration, rating, rating_count, total_rating, price } = req.body;

  // Validate required fields
  if (!title || !description || !duration || !price) {
    return res.status(400).json({ ok: false, errors: ["Missing required fields"] });
  }

  try {
    const ourStatement = db.prepare("INSERT INTO itineraries (title, description, tags, duration, price, rating, rating_count, total_rating, authorid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const result = ourStatement.run(title, description, tags || '[]', duration, price, rating, rating_count, total_rating, req.user.userid);

    console.log("Itinerary created with ID:", result.lastInsertRowid, "for user:", req.user.userid);

    res.json({
      ok: true,
      message: "Itinerary created successfully",
      itineraryId: result.lastInsertRowid
    });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

app.post("/api/give-rating", (req, res) => {
  try {
    const { id, rating, rating_count, total_rating} = req.body || {};
    const itineraryId = Number(id);
    const ratingTemp = Number(rating);
    const statement = db.prepare("SELECT rating_count, total_rating from itineraries WHERE id = ?")
    const ratingTally = statement.get(req.body.id)
    console.log(ratingTally.rating_count)
    const ratingCount = ratingTally.rating_count + 1
    const totalTemp = ratingTally.total_rating
    const totalRating = totalTemp + ratingTemp
    const ratingNum = Number((totalRating/ratingCount).toFixed(2))
    if (!Number.isFinite(itineraryId)) {
      return res.status(400).json({ ok: false, errors: ["Missing or invalid itinerary id"] });
    }
    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ ok: false, errors: ["Rating must be a number between 0 and 5"] });
    }

    const stmt = db.prepare("UPDATE itineraries SET rating = ? WHERE id = ?");
    const result = stmt.run(ratingNum, itineraryId);
    const stmt2 = db.prepare("UPDATE itineraries SET total_rating = ? WHERE id = ?");
    const result2 = stmt2.run(totalRating, itineraryId)
    const stmt3 = db.prepare("UPDATE itineraries SET rating_count = ? WHERE id = ?");
    const result3 = stmt3.run(ratingCount, itineraryId)
    if (result.changes === 0) {
      return res.status(404).json({ ok: false, errors: ["Itinerary not found"] });
    }

    console.log("Itinerary rated:", { itineraryId, rating: ratingNum, byUser: req.user?.userid });
    return res.json({ ok: true, message: "Itinerary rated successfully" });
  } catch (err) {
    console.error("Error rating itinerary:", err);
    return res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});


// Get itineraries for the logged-in user
app.get("/api/my-itineraries", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, errors: ["Not logged in"] });
  }

  try {
    const statement = db.prepare("SELECT * FROM itineraries WHERE authorid = ? ORDER BY id DESC");
    const itineraries = statement.all(req.user.userid);

    // Return in the format your frontend expects
    res.json({
      ok: true,
      itineraries: itineraries.map(itinerary => ({
        ...itinerary,
        createdBy: itinerary.authorid,
        rating: 0, // Add default rating since your DB doesn't have this column
        destinations: [] // Add empty destinations array
      }))
    });
  } catch (error) {
    console.error("Error fetching user itineraries:", error);
    res.status(500).json({ ok: false, errors: ["Server error"] });
  }
});

// Add debug endpoint
app.get("/api/debug/my-itineraries", (req, res) => {
  if (!req.user) {
    return res.json({ user: null, message: "No user logged in" });
  }

  try {
    console.log("Debug: User ID:", req.user.userid);

    const statement = db.prepare("SELECT * FROM itineraries WHERE authorid = ?");
    const itineraries = statement.all(req.user.userid);

    console.log("Debug: Found itineraries:", itineraries);

    res.json({
      user: req.user,
      itineraries: itineraries,
      count: itineraries.length
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.json({ error: error.message });
  }
});

// Add test itineraries (run this once)
app.get("/api/create-test-itineraries", (req, res) => {
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
        authorid: req.user.userid
      },
      {
        title: "Food Tour",
        description: "Tasting the best local cuisine",
        tags: JSON.stringify(["food", "cultural"]),
        duration: "4 hours",
        price: "$$$",
        authorid: req.user.userid
      }
    ];

    const statement = db.prepare("INSERT INTO itineraries (title, description, tags, duration, price, authorid) VALUES (?, ?, ?, ?, ?, ?)");

    testItineraries.forEach(itinerary => {
      statement.run(itinerary.title, itinerary.description, itinerary.tags, itinerary.duration, itinerary.price, itinerary.authorid);
    });

    res.json({ message: "Test itineraries created", count: testItineraries.length });
  } catch (error) {
    console.error("Error creating test itineraries:", error);
    res.status(500).json({ error: "Failed to create test data" });
  }
});




app.listen(3000, () => console.log("Backend running on http://localhost:3000"));