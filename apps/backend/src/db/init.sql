-- Enable PostGIS extension (required for geography type)
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual tables are created by Drizzle migrations
-- This file only enables extensions that must exist before migrations run
