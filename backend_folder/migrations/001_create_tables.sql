-- migrations/001_create_tables.sql
-- Creates the initial schema for Postgres (users + itineraries)

CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  google_sub TEXT UNIQUE,
  bio TEXT,
  display_name TEXT,
  saved_itineraries JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_itineraries JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS itineraries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration VARCHAR(100) NOT NULL,
  price VARCHAR(100) NOT NULL,
  authorid INTEGER REFERENCES users(id),
  authorname TEXT,
  rating NUMERIC,
  rating_count INTEGER,
  total_rating INTEGER,
  destinations JSONB NOT NULL DEFAULT '[]'::jsonb
);
