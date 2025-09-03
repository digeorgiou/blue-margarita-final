INSERT INTO locations (id, name, is_active, created_at, uuid) VALUES
(1, 'Κέντρο Αθήνας', 1, CURRENT_TIMESTAMP, UUID()),
(2, 'Πλάκα', 1, CURRENT_TIMESTAMP, UUID()),
(3, 'Κολωνάκι', 1, CURRENT_TIMESTAMP, UUID()),
(4, 'Γλυφάδα', 1, CURRENT_TIMESTAMP, UUID()),
(5, 'Κηφισιά', 1, CURRENT_TIMESTAMP, UUID()),
(6, 'Περιστέρι', 1, CURRENT_TIMESTAMP, UUID()),
(7, 'Πειραιάς', 1, CURRENT_TIMESTAMP, UUID()),
(8, 'Μαρούσι', 1, CURRENT_TIMESTAMP, UUID()),
(9, 'Χαλάνδρι', 1, CURRENT_TIMESTAMP, UUID()),
(10, 'Νέα Σμύρνη', 1, CURRENT_TIMESTAMP, UUID()),
(11, 'Πάτρα', 1, CURRENT_TIMESTAMP, UUID()),
(12, 'Θεσσαλονίκη', 1, CURRENT_TIMESTAMP, UUID()),
(13, 'Λάρισα', 1, CURRENT_TIMESTAMP, UUID()),
(14, 'Ηράκλειο', 1, CURRENT_TIMESTAMP, UUID()),
(15, 'Online Store', 1, CURRENT_TIMESTAMP, UUID()),
(16, 'Παλιό Κατάστημα Εξάρχεια', 0, CURRENT_TIMESTAMP, UUID()),
(17, 'Πρώην Συνεργείο Βύρωνας', 0, CURRENT_TIMESTAMP, UUID());
ALTER TABLE locations AUTO_INCREMENT = 18;