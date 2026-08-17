-- Scam Alert System Database Initialization Script
-- Usage: psql -U postgres -f db_init.sql

-- Create the database if it does not exist
SELECT 'CREATE DATABASE scam_system_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'scam_system_db')\gexec
