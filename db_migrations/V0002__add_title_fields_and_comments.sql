ALTER TABLE t_p45023208_star_map_exploration.titles
  ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS age_rating VARCHAR(10) DEFAULT '12+',
  ADD COLUMN IF NOT EXISTS genres TEXT;

CREATE TABLE IF NOT EXISTS t_p45023208_star_map_exploration.comments (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.chapters(id),
  user_id INTEGER NOT NULL REFERENCES t_p45023208_star_map_exploration.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
