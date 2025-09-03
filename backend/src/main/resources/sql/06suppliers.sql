INSERT INTO suppliers (id, name, address, tin, phone_number, email, is_active, created_at, uuid) VALUES
(1, 'Χρυσοχοϊκή Α.Ε.', 'Μητροπόλεως 45, Αθήνα 10563', '123456789', '2103214567', 'info@chrysochoiki.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(2, 'Μέταλλα & Πέτρες Ο.Ε.', 'Πλάκα 12, Θεσσαλονίκη 54624', '234567890', '2310456789', 'orders@metalstones.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(3, 'Διαμαντόκοσμος Μ. Παπαдόπουλος', 'Κολωνακίου 8, Αθήνα 10673', '345678901', '2107234561', 'mpapado@diamantokosmos.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(4, 'Ασημένια Όνειρα Ε.Ε.', 'Τσιμισκή 78, Θεσσαλονίκη 54622', '456789012', '2310567890', 'contact@silverdreams.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(5, 'Precious Metals Ltd', 'Βουκουρεστίου 23, Αθήνα 10671', '567890123', '2103456789', 'sales@preciousmetals.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(6, 'Γεωργίου Κοσμήματα Α.Е.', 'Μεγάλου Αλεξάνδρου 156, Πάτρα 26223', '678901234', '2610345678', 'georgiou@kosmimata.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(7, 'Crystals & Gems Hellas', 'Σταδίου 67, Αθήνα 10564', '789012345', '2102345678', 'info@crystalsgems.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(8, 'Μαργαριτάρι Θαλάσσης', 'Παραλίας 34, Γλυφάδα 16675', '890123456', '2108945678', 'pearl@thalassis.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(9, 'Tools & Findings Pro', 'Πειραιώς 145, Αθήνα 11853', '901234567', '2104567890', 'pro@toolsfindings.gr', 1, CURRENT_TIMESTAMP(), UUID()),
(10, 'Συσκευασίες Δώρων Μ.Ε.Π.Ε.', 'Ικάρου 89, Μαρούσι 15125', '012345678', '2108765432', 'gifts@packaging.gr', 1, CURRENT_TIMESTAMP(), UUID());

ALTER TABLE suppliers AUTO_INCREMENT = 11;