-- Initial database setup
-- Schema will be managed by Flyway migrations in the Backend Unit
-- This file is executed only on first container startup

-- Create cashlog database
CREATE DATABASE IF NOT EXISTS cashlog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to cashlog user
GRANT ALL PRIVILEGES ON cashlog.* TO 'cashlog'@'%';
FLUSH PRIVILEGES;
