INSERT INTO customers (id, firstname, lastname, gender, phone_number, address, email, tin, is_active, created_at, uuid) VALUES
-- Regular customers
(1, 'Μαρία', 'Παπαδοπούλου', 'FEMALE', '6944123456', 'Σόλωνος 45, Αθήνα', 'maria.papa@gmail.com', '123456789', 1, CURRENT_TIMESTAMP(), UUID()),
(2, 'Γιάννης', 'Κωνσταντινίδης', 'MALE', '6955234567', 'Τσιμισκή 67, Θεσσαλονίκη', 'giannis.konst@yahoo.gr', '234567890', 1, CURRENT_TIMESTAMP(), UUID()),
(3, 'Ελένη', 'Δημητρίου', 'FEMALE', '6966345678', 'Πατησίων 123, Αθήνα', 'eleni.dim@hotmail.com', '345678901', 1, CURRENT_TIMESTAMP(), UUID()),
(4, 'Νίκος', 'Γεωργίου', 'MALE', '6977456789', 'Βενιζέλου 89, Πάτρα', 'nikos.georg@gmail.com', '456789012', 1, CURRENT_TIMESTAMP(), UUID()),
(5, 'Άννα', 'Αντωνίου', 'FEMALE', '6988567890', 'Κηφισίας 234, Κηφισιά', 'anna.ant@yahoo.com', '567890123', 1, CURRENT_TIMESTAMP(), UUID()),
(6, 'Κώστας', 'Μιχαηλίδης', 'MALE', '6999678901', 'Γλαδστώνος 12, Θεσσαλονίκη', 'kostas.mich@gmail.com', '678901234', 1, CURRENT_TIMESTAMP(), UUID()),
(7, 'Σοφία', 'Βασιλείου', 'FEMALE', '6912789012', 'Ακαδημίας 56, Αθήνα', 'sofia.vas@outlook.com', '789012345', 1, CURRENT_TIMESTAMP(), UUID()),
(8, 'Δημήτρης', 'Στεφανίδης', 'MALE', '6923890123', 'Μεταξά 78, Πειραιάς', 'dimitris.stef@gmail.com', '890123456', 1, CURRENT_TIMESTAMP(), UUID()),
(9, 'Κατερίνα', 'Ιωάννου', 'FEMALE', '6934901234', 'Λεωφόρος Βουλιαγμένης 145, Γλυφάδα', 'katerina.io@yahoo.gr', '901234567', 1, CURRENT_TIMESTAMP(), UUID()),
(10, 'Πέτρος', 'Νικολάου', 'MALE', '6945012345', 'Εθνικής Αντίστασης 23, Καλαμάτα', 'petros.nik@gmail.com', '012345678', 1, CURRENT_TIMESTAMP(), UUID()),

-- VIP/Frequent customers
(11, 'Αικατερίνη', 'Τσάκου', 'FEMALE', '6956123456', 'Κολωνακίου 45, Κολωνάκι', 'aikaterini.tsak@gmail.com', '111234567', 1, CURRENT_TIMESTAMP(), UUID()),
(12, 'Αλέξανδρος', 'Καραγιάννης', 'MALE', '6967234567', 'Φιλελλήνων 67, Αθήνα', 'alex.karag@hotmail.com', '222345678', 1, CURRENT_TIMESTAMP(), UUID()),
(13, 'Βασιλική', 'Μαρκοπούλου', 'FEMALE', '6978345678', 'Προξένου Κορομηλά 89, Θεσσαλονίκη', 'vasia.mark@yahoo.com', '333456789', 1, CURRENT_TIMESTAMP(), UUID()),
(14, 'Θάνος', 'Λεβέντης', 'MALE', '6989456789', 'Ρίτσου 12, Ηράκλειο', 'thanos.lev@gmail.com', '444567890', 1, CURRENT_TIMESTAMP(), UUID()),
(15, 'Χρυσούла', 'Παναγιώτου', 'FEMALE', '6990567890', 'Μαυρομιχάλη 34, Αθήνα', 'chrysoula.pan@outlook.gr', '555678901', 1, CURRENT_TIMESTAMP(), UUID()),

-- Younger customers
(16, 'Αλεξία', 'Μανώλη', 'FEMALE', '6911678901', 'Στουρνάρα 56, Εξάρχεια', 'alexia.man@gmail.com', '666789012', 1, CURRENT_TIMESTAMP(), UUID()),
(17, 'Γιώργος', 'Ζαχαρίας', 'MALE', '6922789012', 'Ιπποκράτους 78, Αθήνα', 'giorgos.zach@yahoo.gr', '777890123', 1, CURRENT_TIMESTAMP(), UUID()),
(18, 'Δέσποινα', 'Ρούσσου', 'FEMALE', '6933890123', 'Ναυάρχου Κουντουριώτη 90, Πειραιάς', 'despoina.rous@hotmail.com', '888901234', 1, CURRENT_TIMESTAMP(), UUID()),
(19, 'Στέλιος', 'Κρητικός', 'MALE', '6944901234', 'Δεδαλου 23, Ηράκλειο', 'stelios.krit@gmail.com', '999012345', 1, CURRENT_TIMESTAMP(), UUID()),
(20, 'Φωτεινή', 'Σπανού', 'FEMALE', '6955012345', 'Αριστοτέλους 45, Θεσσαλονίκη', 'foteini.span@yahoo.com', '000123456', 1, CURRENT_TIMESTAMP(), UUID()),

-- Business/Corporate customers
(21, 'Κωνσταντίνος', 'Μπλέτσας', 'MALE', '6966123456', 'Βασιλίσσης Σοφίας 123, Αθήνα', 'konstantinos.blet@company.gr', '111223344', 1, CURRENT_TIMESTAMP(), UUID()),
(22, 'Ιωάννα', 'Βλάχου', 'FEMALE', '6977234567', 'Εγνατία 234, Θεσσαλονίκη', 'ioanna.vlach@business.com', '222334455', 1, CURRENT_TIMESTAMP(), UUID()),
(23, 'Μιχάλης', 'Τζανής', 'MALE', '6988345678', 'Ρήγα Φεραίου 67, Λάρισα', 'michalis.tzan@enterprise.gr', '333445566', 1, CURRENT_TIMESTAMP(), UUID()),

-- Elderly customers
(24, 'Γεωργία', 'Κολοκοτρώνη', 'FEMALE', '6999456789', 'Πλατεία Βάθης 12, Αθήνα', 'georgia.kol@gmail.com', '444556677', 1, CURRENT_TIMESTAMP(), UUID()),
(25, 'Βασίλειος', 'Διαμαντίδης', 'MALE', '6910567890', 'Μητροπόλεως 34, Θεσσαλονίκη', 'vasilis.diam@yahoo.gr', '555667788', 1, CURRENT_TIMESTAMP(), UUID()),
(26, 'Ευαγγελία', 'Χρυσοστόμου', 'FEMALE', '6921678901', 'Παναγίας 56, Πάτρα', 'evangelia.chrys@hotmail.com', '666778899', 1, CURRENT_TIMESTAMP(), UUID()),

-- Tourist/International customers
(27, 'Elena', 'Rossi', 'FEMALE', '6932789012', 'Hotel Grande Bretagne, Αθήνα', 'elena.rossi@italy.com', NULL, 1, CURRENT_TIMESTAMP(), UUID()),
(28, 'John', 'Smith', 'MALE', '6943890123', 'Mykonos Palace Hotel, Μύκονος', 'john.smith@usa.com', NULL, 1, CURRENT_TIMESTAMP(), UUID()),
(29, 'Marie', 'Dubois', 'FEMALE', '6954901234', 'Santorini Resort, Σαντορίνη', 'marie.dubois@france.fr', NULL, 1, CURRENT_TIMESTAMP(), UUID()),

-- Inactive customer for testing
(30, 'Αντώνης', 'Παπαγεωργίου', 'MALE', '6965012345', 'Ακροπόλεως 78, Αθήνα', 'antonis.papag@gmail.com', '777888999', 0, CURRENT_TIMESTAMP(), UUID());

ALTER TABLE customers AUTO_INCREMENT = 31;