INSERT INTO procedures (id, name, is_active, created_by_id, last_updated_by, created_at, updated_at, uuid) VALUES
(1, 'Επιχρύσωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(2, 'Επιασημίωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(3, 'Τρίψιμο', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(4, 'Γυάλισμα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(5, 'Στίλβωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(6, 'Καθάρισμα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(7, 'Πατίνα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(8, 'Χάραξη', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(9, 'Σφυρηλάτηση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(10, 'Κολλητήρι', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(11, 'Λειάνση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(12, 'Σκάλισμα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(13, 'Διάτρηση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(14, 'Σφραγίδωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(15, 'Παλαίωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(16, 'Συναρμολόγηση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(17, 'Επιδιόρθωση', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(18, 'Αλλαγή Νούμερου', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(19, 'Καστόνωμα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(20, 'Φινίρισμα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID());

ALTER TABLE procedures AUTO_INCREMENT = 21;