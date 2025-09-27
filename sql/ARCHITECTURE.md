# Database Architecture

## Multi-Database Design

This educational platform uses a decentralized multi-database architecture:

### Main Database (Your Supabase)
- User authentication and profiles
- Role and permission management  
- Course registry (metadata only)
- Course credentials (service-role protected)
- Course memberships
- Global notifications and settings
- Global pinned posts

### Per-Course Databases (Course Rep's Supabase)
- Course-specific posts and assignments
- Comments and reactions
- Assignment completion tracking
- Course leaderboards and stats

## Security Model

**CRITICAL**: Per-course databases should NEVER be accessed directly by frontend clients.

### Access Pattern
1. Frontend authenticates with main Supabase
2. All course data requests go through Ubuntu backend API
3. Backend validates user permissions using main database
4. Backend connects to appropriate course database using service keys
5. Backend returns filtered data to frontend

### Why This Design?
- **Security**: Course credentials never exposed to clients
- **Authorization**: Membership and roles enforced server-side
- **Scalability**: Each course can have its own database capacity
- **Isolation**: Course data is completely separate
- **Control**: Course reps control their own database

### Database Credentials
- Main database: Your Supabase credentials
- Course databases: Stored encrypted in `course_credentials` table
- Frontend only has main database anon key
- Backend has all service keys for API operations

## Course Creation Flow
1. Top admin creates course in main database
2. Course rep provides their Supabase credentials  
3. Credentials stored encrypted in `course_credentials`
4. Course rep is assigned `course_admin` role
5. Backend runs course database setup script
6. Course becomes active and accessible

## Role Hierarchy
- **Creator**: You (immutable, cannot be removed)
- **Top Admin**: Can manage everything except removing creator
- **Course Admin**: Can manage specific course content
- **User**: Can participate in courses they're enrolled in