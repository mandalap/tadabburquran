INSERT INTO creators (name, slug, specialty, title, bio, rating, reviews, courses_count, students_count, is_featured, is_top_creator, sort_order) VALUES
('Ust. Abdullah Yusuf', 'abdullah-yusuf', 'Tahfidz', 'Lc.', 'Hafiz Al-Quran 30 juz, pengajar tahfidz selama 10 tahun', 4.9, 125, 3, 1500, true, true, 1),
('Ustadzah Fatimah Az-Zahra', 'fatimah-az-zahra', 'Tajwid', 'S.Pd.I', 'Lulusan Universitas Al-Azhar Kairo, spesialis ilmu tajwid', 4.8, 89, 2, 980, true, true, 2),
('Ust. Ahmad Hassan', 'ahmad-hassan', 'Fiqih Ibadah', 'M.A.', 'Masters Fiqih dari Universitas Madinah', 4.7, 67, 4, 750, true, false, 3),
('Ust. Muhammad Rizki', 'muhammad-rizki', 'Bahasa Arab', 'Lc.', 'Native speaker, lulusan Universitas King Saud', 4.9, 156, 2, 1200, true, true, 4),
('Ustadzah Aisyah Humaira', 'aisyah-humaira', 'Aqidah', 'S.Pd.I', 'Daiyah dan penulis buku aqidah pemula', 4.6, 45, 1, 450, true, false, 5)
ON CONFLICT (slug) DO NOTHING;
