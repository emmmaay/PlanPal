-- ========================================
-- MAIN SUPABASE DATABASE SETUP SCRIPT
-- Run this on your main Supabase database
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email TEXT NOT NULL,
    is_creator BOOLEAN DEFAULT FALSE NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create roles table for user hierarchy
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role_type TEXT NOT NULL CHECK (role_type IN ('creator', 'top_admin', 'course_admin', 'user')),
    scope UUID, -- null for global roles, course_id for course-specific roles
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create courses registry table (public information only)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    lecturer TEXT,
    course_rep TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create course credentials table (sensitive data - service role only)
CREATE TABLE course_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL UNIQUE,
    supabase_url TEXT NOT NULL,
    supabase_anon_key TEXT NOT NULL,
    supabase_service_key TEXT NOT NULL, -- Store encrypted in production
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create course memberships table
CREATE TABLE course_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'student' NOT NULL CHECK (role IN ('student', 'course_admin')),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one membership per user per course
    UNIQUE(user_id, course_id)
);

-- Create platform settings table
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES users(id) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create global pinned posts table
CREATE TABLE global_pinned_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author UUID REFERENCES users(id) NOT NULL,
    is_pinned BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user badges table
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL,
    badge_data JSONB,
    course_id UUID, -- null for global badges
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roles_user_id ON roles(user_id);
CREATE INDEX idx_roles_scope ON roles(scope) WHERE scope IS NOT NULL;
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_course_credentials_course_id ON course_credentials(course_id);
CREATE INDEX idx_course_memberships_user_id ON course_memberships(user_id);
CREATE INDEX idx_course_memberships_course_id ON course_memberships(course_id);
CREATE INDEX idx_course_memberships_role ON course_memberships(role);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_course ON user_badges(course_id) WHERE course_id IS NOT NULL;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_pinned_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users table policies (restrict PII exposure)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create a public view for users without PII
CREATE VIEW public_users AS
SELECT id, username, is_creator, created_at
FROM users
WHERE NOT is_banned;

-- Grant access to the public view for all authenticated users
GRANT SELECT ON public_users TO authenticated;

-- Roles table policies
CREATE POLICY "Users can view roles" ON roles FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can manage roles" ON roles FOR INSERT OR UPDATE OR DELETE USING (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
);

-- Courses table policies  
CREATE POLICY "Users can view active courses they are enrolled in" ON courses FOR SELECT USING (
    is_active = TRUE AND (
        EXISTS (SELECT 1 FROM course_memberships cm WHERE cm.course_id = id AND cm.user_id = auth.uid() AND cm.status = 'active')
        OR EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type IN ('creator', 'top_admin'))
    )
);
CREATE POLICY "Only admins can manage courses" ON courses FOR INSERT OR UPDATE OR DELETE USING (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
);

-- Course credentials - no policies needed, only service role can access (RLS enabled but no policies = only service_role access)

-- Course memberships policies
CREATE POLICY "Users can view their own memberships" ON course_memberships FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type IN ('creator', 'top_admin'))
    OR EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type = 'course_admin' AND r.scope = course_id)
);
CREATE POLICY "Admins can manage memberships" ON course_memberships FOR INSERT OR UPDATE OR DELETE USING (
    EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type IN ('creator', 'top_admin'))
    OR EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type = 'course_admin' AND r.scope = course_id)
) WITH CHECK (
    EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type IN ('creator', 'top_admin'))
    OR EXISTS (SELECT 1 FROM roles r WHERE r.user_id = auth.uid() AND r.role_type = 'course_admin' AND r.scope = course_id)
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Global pinned posts policies
CREATE POLICY "All users can view pinned posts" ON global_pinned_posts FOR SELECT USING (is_pinned = TRUE);
CREATE POLICY "Only admins can manage pinned posts" ON global_pinned_posts FOR INSERT OR UPDATE OR DELETE USING (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
);

-- User badges policies
CREATE POLICY "Users can view all badges" ON user_badges FOR SELECT USING (TRUE);

-- Platform settings policies
CREATE POLICY "Users can view settings" ON platform_settings FOR SELECT USING (TRUE);
CREATE POLICY "Only admins can update settings" ON platform_settings FOR INSERT OR UPDATE OR DELETE USING (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM roles r 
        WHERE r.user_id = auth.uid() 
        AND r.role_type IN ('creator', 'top_admin')
    )
);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_credentials_updated_at BEFORE UPDATE ON course_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_pinned_posts_updated_at BEFORE UPDATE ON global_pinned_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA SETUP
-- ========================================

-- Function to insert default settings after first user creation
CREATE OR REPLACE FUNCTION insert_default_settings()
RETURNS TRIGGER AS $$
DECLARE
    creator_id UUID;
BEGIN
    -- Get the creator's ID
    SELECT id INTO creator_id FROM users WHERE is_creator = TRUE LIMIT 1;
    
    -- Insert default platform settings if creator exists
    IF creator_id IS NOT NULL THEN
        INSERT INTO platform_settings (key, value, updated_by) VALUES 
        ('anonymous_hub_enabled', 'true', creator_id),
        ('anonymous_hub_reset_timer', '0', creator_id),
        ('platform_name', '"YCT ND1 Computer Science"', creator_id)
        ON CONFLICT (key) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after creator user is inserted or updated
CREATE TRIGGER insert_default_settings_trigger
    AFTER INSERT OR UPDATE OF is_creator ON users
    FOR EACH ROW
    WHEN (NEW.is_creator = TRUE AND COALESCE(OLD.is_creator, FALSE) = FALSE)
    EXECUTE FUNCTION insert_default_settings();

-- Function to automatically assign creator role to the first user
CREATE OR REPLACE FUNCTION assign_creator_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user
    IF NOT EXISTS (SELECT 1 FROM users WHERE is_creator = TRUE) THEN
        -- Mark as creator
        NEW.is_creator = TRUE;
        
        -- Insert creator role
        INSERT INTO roles (user_id, role_type, assigned_by)
        VALUES (NEW.id, 'creator', NEW.id);
    END IF;
    
    -- Always insert default user role
    INSERT INTO roles (user_id, role_type)
    VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign roles on user creation
CREATE TRIGGER assign_creator_role_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_creator_role();

-- ========================================
-- REALTIME SUBSCRIPTIONS
-- ========================================

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE global_pinned_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE course_memberships;