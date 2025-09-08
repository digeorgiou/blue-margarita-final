INSERT INTO users (id, username, password, role, is_active, uuid, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$Jzs7l3KzHbahyTwfO6L5oeUGx/jUH7khBq5jWTUuCGQbKRzV/8PVa', 'ADMIN', true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
