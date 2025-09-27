-- ========================================
-- PER-COURSE SUPABASE DATABASE SETUP SCRIPT
-- Run this on each course-specific Supabase database
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create posts table (assignments, announcements, information)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('assignment', 'post', 'announcement')),
    author_id UUID NOT NULL, -- References users.id from main database
    deadline TIMESTAMP WITH TIME ZONE, -- For assignments
    media_urls TEXT[], -- Array of media file URLs
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID NOT NULL, -- References users.id from main database
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id), -- For nested comments
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL, -- post_id or comment_id
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    user_id UUID NOT NULL, -- References users.id from main database
    reaction_type TEXT NOT NULL, -- like, love, laugh, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one reaction per user per target
    UNIQUE(target_id, user_id, reaction_type)
);

-- Create assignment status tracking table
CREATE TABLE assignment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL, -- References users.id from main database
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    submission_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one status per user per assignment
    UNIQUE(post_id, user_id)
);

-- Create user stats table for course leaderboard
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE, -- References users.id from main database
    posts_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    reactions_received INTEGER DEFAULT 0 NOT NULL,
    assignments_completed INTEGER DEFAULT 0 NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Posts indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_deadline ON posts(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_posts_active ON posts(is_deleted) WHERE is_deleted = FALSE;

-- Comments indexes
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Reactions indexes
CREATE INDEX idx_reactions_target ON reactions(target_id, target_type);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Assignment status indexes
CREATE INDEX idx_assignment_status_post ON assignment_status(post_id);
CREATE INDEX idx_assignment_status_user ON assignment_status(user_id);
CREATE INDEX idx_assignment_status_completed ON assignment_status(is_completed);

-- User stats indexes
CREATE INDEX idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX idx_user_stats_active ON user_stats(last_active DESC);

-- ========================================
-- FUNCTIONS FOR UPDATING STATS
-- ========================================

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_stats (user_id, posts_count, comments_count, reactions_received, assignments_completed, points, last_active)
    VALUES (
        user_uuid,
        (SELECT COUNT(*) FROM posts WHERE author_id = user_uuid AND is_deleted = FALSE),
        (SELECT COUNT(*) FROM comments WHERE author_id = user_uuid AND is_deleted = FALSE),
        (SELECT COUNT(*) FROM reactions r 
         JOIN posts p ON r.target_id = p.id 
         WHERE p.author_id = user_uuid AND r.target_type = 'post'),
        (SELECT COUNT(*) FROM assignment_status WHERE user_id = user_uuid AND is_completed = TRUE),
        -- Point calculation: 5 points per post, 2 per comment, 1 per reaction received, 10 per assignment completed
        (SELECT 
            COALESCE((SELECT COUNT(*) * 5 FROM posts WHERE author_id = user_uuid AND is_deleted = FALSE), 0) +
            COALESCE((SELECT COUNT(*) * 2 FROM comments WHERE author_id = user_uuid AND is_deleted = FALSE), 0) +
            COALESCE((SELECT COUNT(*) FROM reactions r JOIN posts p ON r.target_id = p.id WHERE p.author_id = user_uuid AND r.target_type = 'post'), 0) +
            COALESCE((SELECT COUNT(*) * 10 FROM assignment_status WHERE user_id = user_uuid AND is_completed = TRUE), 0)
        ),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        posts_count = EXCLUDED.posts_count,
        comments_count = EXCLUDED.comments_count,
        reactions_received = EXCLUDED.reactions_received,
        assignments_completed = EXCLUDED.assignments_completed,
        points = EXCLUDED.points,
        last_active = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to trigger stats update
CREATE OR REPLACE FUNCTION trigger_stats_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_user_stats(NEW.author_id);
        IF TG_TABLE_NAME = 'reactions' THEN
            PERFORM update_user_stats(NEW.user_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM update_user_stats(NEW.author_id);
        IF OLD.author_id != NEW.author_id THEN
            PERFORM update_user_stats(OLD.author_id);
        END IF;
        IF TG_TABLE_NAME = 'reactions' THEN
            PERFORM update_user_stats(NEW.user_id);
            IF OLD.user_id != NEW.user_id THEN
                PERFORM update_user_stats(OLD.user_id);
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_stats(OLD.author_id);
        IF TG_TABLE_NAME = 'reactions' THEN
            PERFORM update_user_stats(OLD.user_id);
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for assignment status updates
CREATE OR REPLACE FUNCTION trigger_assignment_stats_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_stats(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS FOR AUTOMATIC STATS UPDATES
-- ========================================

-- Apply update triggers
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_status_updated_at BEFORE UPDATE ON assignment_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stats update triggers
CREATE TRIGGER posts_stats_trigger AFTER INSERT OR UPDATE OR DELETE ON posts FOR EACH ROW EXECUTE FUNCTION trigger_stats_update();
CREATE TRIGGER comments_stats_trigger AFTER INSERT OR UPDATE OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION trigger_stats_update();
CREATE TRIGGER reactions_stats_trigger AFTER INSERT OR UPDATE OR DELETE ON reactions FOR EACH ROW EXECUTE FUNCTION trigger_stats_update();
CREATE TRIGGER assignment_status_stats_trigger AFTER INSERT OR UPDATE OR DELETE ON assignment_status FOR EACH ROW EXECUTE FUNCTION trigger_assignment_stats_update();

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for posts with reaction counts
CREATE VIEW posts_with_stats AS
SELECT 
    p.*,
    COALESCE(r.reaction_count, 0) as reaction_count,
    COALESCE(c.comment_count, 0) as comment_count,
    CASE 
        WHEN p.type = 'assignment' THEN COALESCE(a.completion_count, 0)
        ELSE 0 
    END as completion_count
FROM posts p
LEFT JOIN (
    SELECT target_id, COUNT(*) as reaction_count
    FROM reactions 
    WHERE target_type = 'post'
    GROUP BY target_id
) r ON p.id = r.target_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM comments 
    WHERE is_deleted = FALSE
    GROUP BY post_id
) c ON p.id = c.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as completion_count
    FROM assignment_status 
    WHERE is_completed = TRUE
    GROUP BY post_id
) a ON p.id = a.post_id
WHERE p.is_deleted = FALSE;

-- View for leaderboard
CREATE VIEW leaderboard AS
SELECT 
    user_id,
    posts_count,
    comments_count,
    reactions_received,
    assignments_completed,
    points,
    RANK() OVER (ORDER BY points DESC, assignments_completed DESC, posts_count DESC) as rank,
    last_active
FROM user_stats
ORDER BY points DESC, assignments_completed DESC, posts_count DESC
LIMIT 10;

-- View for upcoming assignments
CREATE VIEW upcoming_assignments AS
SELECT 
    id,
    title,
    content,
    author_id,
    deadline,
    created_at,
    (deadline - NOW()) as time_remaining
FROM posts
WHERE 
    type = 'assignment' 
    AND deadline > NOW() 
    AND is_deleted = FALSE
ORDER BY deadline ASC;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Posts policies - service role only access (no client access)
-- No policies defined = only service_role can access

-- Comments policies - service role only access
-- No policies defined = only service_role can access

-- Reactions policies - service role only access  
-- No policies defined = only service_role can access

-- Assignment status policies - service role only access
-- No policies defined = only service_role can access

-- User stats policies - service role only access
-- No policies defined = only service_role can access

-- NOTE: With RLS enabled but no policies defined, only the service_role can access these tables.
-- This provides maximum security for the proxy-only access model.

-- Additional security: revoke all grants from anon and authenticated roles
REVOKE ALL ON posts FROM anon, authenticated;
REVOKE ALL ON comments FROM anon, authenticated;
REVOKE ALL ON reactions FROM anon, authenticated;
REVOKE ALL ON assignment_status FROM anon, authenticated;
REVOKE ALL ON user_stats FROM anon, authenticated;

-- Ensure only service_role can access these tables
GRANT ALL ON posts TO service_role;
GRANT ALL ON comments TO service_role;
GRANT ALL ON reactions TO service_role;
GRANT ALL ON assignment_status TO service_role;
GRANT ALL ON user_stats TO service_role;

-- ========================================
-- REALTIME SUBSCRIPTIONS
-- ========================================

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE assignment_status;
ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;