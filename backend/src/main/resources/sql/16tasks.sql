INSERT INTO to_do_task (id, description, task_date, status, date_completed) VALUES

-- Overdue Tasks
(1, 'Παραγγελία νέων υλικών από προμηθευτή Χρυσού', '2025-09-01', 'PENDING', NULL),
(2, 'Έλεγχος αποθήκευσης προϊόντων χαμηλού stock', '2025-09-02', 'PENDING', NULL),

-- Today's Tasks
(3, 'Να παραδόσω την εργασία μου', CURRENT_DATE(), 'PENDING', NULL),

-- Next Week's Tasks
(4, 'Προετοιμασία για έκθεση κοσμημάτων', DATE_ADD(CURRENT_DATE(), INTERVAL 8 DAY), 'PENDING', NULL),
(5, 'Ανάλυση πωλήσεων μήνα και δημιουργία αναφοράς', DATE_ADD(CURRENT_DATE(), INTERVAL 10 DAY), 'PENDING', NULL),
(6, 'Επιδιόρθωση κολιέ πελάτισσας Παπαδοπούλου', DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), 'PENDING', NULL),

-- This Week's Tasks
(7, 'Ετοιμασία προϊόντων για το Σαββατοκύριακο', DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'PENDING', NULL),
(8, 'Έλεγχος λογαριασμών προμηθευτών', DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY), 'PENDING', NULL),
(9, 'Συνάντηση με νέο προμηθευτή διαμαντιών', DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY), 'PENDING', NULL),
(10, 'Φωτογράφιση νέων προϊόντων για website', DATE_ADD(CURRENT_DATE(), INTERVAL 4 DAY), 'PENDING', NULL),
(11, 'Ενημέρωση αποθήκευσης μετά από πωλήσεις', DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY), 'PENDING', NULL),
(12, 'Έλεγχος ασφαλείας συστήματος και backup', DATE_ADD(CURRENT_DATE(), INTERVAL 6 DAY), 'PENDING', NULL),

-- Some Completed Tasks (for demonstration)
(13, 'Τακτοποίηση νομικών εγγράφων', '2025-08-25', 'COMPLETED', '2025-08-26'),
(14, 'Ανανέωση συμβολαίου με κουριέρ', '2025-08-28', 'COMPLETED', '2025-08-30'),
(15, 'Επισκευή συστήματος ασφαλείας', '2025-08-30', 'COMPLETED', '2025-09-02'),

-- Future Tasks (Next Month)
(16, 'Ετήσια απογραφή αποθήκευσης', DATE_ADD(CURRENT_DATE(), INTERVAL 20 DAY), 'PENDING', NULL),
(17, 'Ανανέωση ασφάλισης καταστήματος', DATE_ADD(CURRENT_DATE(), INTERVAL 25 DAY), 'PENDING', NULL),
(18, 'Εκπαίδευση προσωπικού σε νέα συστήματα', DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY), 'PENDING', NULL),
(19, 'Σχεδιασμός χριστουγεννιάτικης κολεξιόν', DATE_ADD(CURRENT_DATE(), INTERVAL 35 DAY), 'PENDING', NULL);

ALTER TABLE to_do_task AUTO_INCREMENT = 20;
