-- Menambahkan kolom type di tabel categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'ecourse';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT true;

-- Update nilai type berdasarkan kategori yang ada
UPDATE categories SET type = 'ecourse' WHERE type IS NULL OR type = '';
UPDATE categories SET show_on_homepage = true WHERE show_on_homepage IS NULL;

-- Komentar: type bisa berisi 'ecourse', 'webinar', 'produk_digital'
