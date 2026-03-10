-- ============================================
-- CREATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    specialty VARCHAR(255), -- Keahlian: 'Tahfidz', 'Tajwid', dll
    title VARCHAR(100), -- Gelar: 'Ust', 'Ustadzah', 'Lc', dll
    bio TEXT, -- Bio singkat
    avatar TEXT, -- URL foto profil
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    courses_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE, -- Tampil di dashboard (max 5)
    is_top_creator BOOLEAN DEFAULT FALSE, -- Bintang emas/top creator
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    social_youtube TEXT,
    social_instagram TEXT,
    social_telegram TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for creators
CREATE INDEX idx_creators_active ON creators(is_active);
CREATE INDEX idx_creators_featured ON creators(is_featured);
CREATE INDEX idx_creators_top ON creators(is_top_creator);
CREATE INDEX idx_creators_sort ON creators(sort_order);

-- ============================================
-- INSERT SAMPLE CREATORS
-- ============================================
INSERT INTO creators (name, slug, specialty, title, bio, rating, reviews, courses_count, students_count, is_featured, is_top_creator, sort_order) VALUES
('Ust. Abdullah Yusuf', 'abdullah-yusuf', 'Tahfidz', 'Lc.', 'Hafiz Al-Quran 30 juz, pengajar tahfidz selama 10 tahun', 4.9, 125, 3, 1500, true, true, 1),
('Ustadzah Fatimah Az-Zahra', 'fatimah-az-zahra', 'Tajwid', 'S.Pd.I', 'Lulusan Universitas Al-Azhar Kairo, spesialis ilmu tajwid', 4.8, 89, 2, 980, true, true, 2),
('Ust. Ahmad Hassan', 'ahmad-hassan', 'Fiqih Ibadah', 'M.A.', 'Masters Fiqih dari Universitas Madinah', 4.7, 67, 4, 750, true, false, 3),
('Ust. Muhammad Rizki', 'muhammad-rizki', 'Bahasa Arab', 'Lc.', 'Native speaker, lulusan Universitas King Saud', 4.9, 156, 2, 1200, true, true, 4),
('Ustadzah Aisyah Humaira', 'aisyah-humaira', 'Aqidah', 'S.Pd.I', 'Da''iyah dan penulis buku aqidah pemula', 4.6, 45, 1, 450, true, false, 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW FOR FEATURED CREATORS (dashboard)
-- ============================================
CREATE OR REPLACE VIEW featured_creators AS
SELECT
    id, name, slug, specialty, title, bio, avatar,
    rating, reviews, courses_count, students_count,
    is_top_creator, sort_order
FROM creators
WHERE is_active = true AND is_featured = true
ORDER BY is_top_creator DESC, sort_order ASC
LIMIT 5;
