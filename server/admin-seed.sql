-- Run this SQL after you've created the initial schema
-- This will seed the admin user with the correct bcrypt hash

-- First, check if the admin user exists
SELECT * FROM users WHERE username = 'admin';

-- If it doesn't exist, run this to create it
-- Note: Replace the hash with the actual bcrypt hash of 'admin123' from your server
-- For now, insert the user and we'll update the password

INSERT INTO users (email, username, password, role) 
VALUES ('admin@halalbites.com', 'admin', '$2a$10$1SHZ.TJIxI5B7WQw8Q7s0e2qvL5zyKHZvNwWzG8hN7c5D9Q0QU7iO', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Verify the admin user was created
SELECT id, email, username, role FROM users WHERE username = 'admin';
