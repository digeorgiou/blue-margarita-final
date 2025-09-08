-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user with correct BCrypt hash
INSERT INTO users (id, username, password, role, is_active, uuid, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN', true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
