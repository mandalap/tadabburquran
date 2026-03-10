-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Icon name from lucide-react or emoji
    color VARCHAR(20), -- Hex color or Tailwind color class
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for categories
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Tahfidz', 'tahfidz', 'Kelas menghafal Al-Quran', 'book-open', 'text-green-600', 1),
('Tajwid', 'tajwid', 'Kelas ilmu tajwid Al-Quran', 'scroll-text', 'text-blue-600', 2),
('Fiqih', 'fiqih', 'Kelas fiqih ibadah dan muamalah', 'scale', 'text-purple-600', 3),
('Aqidah', 'aqidah', 'Kelas aqidah dan keimanan', 'heart', 'text-red-600', 4),
('Bahasa Arab', 'bahasa-arab', 'Kelas bahasa Arab', 'languages', 'text-amber-600', 5),
('Sirah', 'sirah', 'Kelas sejarah Nabi dan sahabat', 'history', 'text-teal-600', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- UPDATE COURSES TABLE (add foreign key to categories - optional)
-- Note: We'll keep category as VARCHAR for backward compatibility
-- But you can add a foreign key if you want strict referential integrity
-- ALTER TABLE courses ADD COLUMN category_id UUID REFERENCES categories(id);
