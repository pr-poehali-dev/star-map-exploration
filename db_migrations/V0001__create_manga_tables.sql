
CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'author',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.titles (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  cover_url TEXT,
  status VARCHAR(20) DEFAULT 'ongoing',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.chapters (
  id SERIAL PRIMARY KEY,
  title_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.titles(id),
  chapter_number INTEGER NOT NULL,
  chapter_title VARCHAR(255),
  moderation_status VARCHAR(20) DEFAULT 'pending',
  moderation_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.pages (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.chapters(id),
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
