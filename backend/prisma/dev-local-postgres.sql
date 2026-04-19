-- One-time local setup (run as a Postgres superuser, e.g. psql -U postgres).
-- If role or database already exists, drop them first or adjust names.

CREATE USER izum WITH PASSWORD 'izum_local_dev';
CREATE DATABASE izum OWNER izum;

-- backend/.env:
-- DATABASE_URL="postgresql://izum:izum_local_dev@localhost:5432/izum?schema=public"
