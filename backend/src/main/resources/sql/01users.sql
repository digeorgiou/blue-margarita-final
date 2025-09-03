INSERT INTO users (id, username, password, role, is_active, created_at, updated_at, created_by_id, last_updated_by, uuid) VALUES
-- Admin user
(1, 'admin', '$2a$11$fP8pczMMVsi/zGbJ2ZKDB.4hMaBl9pYSHdFFuTjQfLxE8/pcNfKa2', 'ADMIN', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL, NULL, UUID()),

-- Regular users
(2, 'maria', '$2a$11$fP8pczMMVsi/zGbJ2ZKDB.4hMaBl9pYSHdFFuTjQfLxE8/pcNfKa2', 'USER', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL, NULL, UUID()),
(3, 'john', '$2a$11$fP8pczMMVsi/zGbJ2ZKDB.4hMaBl9pYSHdFFuTjQfLxE8/pcNfKa2', 'USER', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL, NULL, UUID()),
(4, 'anna', '$2a$11$fP8pczMMVsi/zGbJ2ZKDB.4hMaBl9pYSHdFFuTjQfLxE8/pcNfKa2', 'USER', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL, NULL, UUID());

ALTER TABLE users AUTO_INCREMENT = 5;