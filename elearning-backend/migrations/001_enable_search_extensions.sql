-- Migration: Enable PostgreSQL extensions for advanced search
-- Extensions: pg_trgm (Trigram Matching) and unaccent (Text Normalization)

-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent extension for Vietnamese text normalization
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create indexes for optimized search performance
-- Index for course name with trigram:
CREATE INDEX IF NOT EXISTS idx_courses_coursename_trgm 
ON courses USING gin (unaccent(lower(coursename)) gin_trgm_ops);

-- Index for course description with trigram: index cho tìm kiếm mô tả khóa học
CREATE INDEX IF NOT EXISTS idx_courses_description_trgm 
ON courses USING gin (unaccent(lower(description)) gin_trgm_ops);

-- Composite index for weighted search: index kết hợp của cả tên khóa học và mô tả
CREATE INDEX IF NOT EXISTS idx_courses_search_composite 
ON courses (coursename, description);

