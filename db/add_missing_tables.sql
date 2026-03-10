-- Add missing tables and columns for the courses API

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
('Ecourse', 'ecourse', '📚', '#10b981', 1),
('Webinar', 'webinar', '🎬', '#8b5cf6', 2),
('Ebook', 'ebook', '📖', '#f59e0b', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CREATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    bio TEXT,
    avatar TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    students INTEGER DEFAULT 0,
    courses_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for creators
CREATE INDEX IF NOT EXISTS idx_creators_slug ON creators(slug);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);

-- ============================================
-- ADD INSTRUCTORS COLUMN TO COURSES
-- ============================================
-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'courses' AND column_name = 'instructors'
    ) THEN
        ALTER TABLE courses ADD COLUMN instructors JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ============================================
-- TRIGGER FOR CREATORS UPDATED_AT
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
