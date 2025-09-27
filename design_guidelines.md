# Design Guidelines for YCT ND1 Computer Science Educational Web App

## Design Approach
**Reference-Based Approach** - Drawing inspiration from modern educational platforms like Notion, Discord, and GitHub for their excellent information hierarchy and community features.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary (Default)**
- Background: 220 15% 8% (deep navy-charcoal)
- Surface: 220 12% 12% (elevated cards/panels)
- Primary: 210 85% 55% (bright blue for CTAs and highlights)
- Text Primary: 0 0% 95% (near-white)
- Text Secondary: 220 10% 70% (muted gray)
- Success: 140 60% 50% (assignments completed)
- Warning: 35 85% 60% (deadlines approaching)
- Danger: 0 75% 55% (overdue items)

**Light Mode**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 85% 45%
- Text Primary: 220 15% 15%

### B. Typography
**Font Stack**: Inter (Google Fonts) for UI, JetBrains Mono for code/timestamps
- Headers: 600-700 weight, tight leading
- Body: 400-500 weight, relaxed leading
- Small text: 400 weight, compact leading

### C. Layout System
**Tailwind Spacing**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-8, m-8 (32px)
- Large breaks: p-12, m-12 (48px)

### D. Component Library

**Navigation**
- Sidebar navigation with role-based sections
- Breadcrumb navigation for deep hierarchies
- Tab navigation for main sections (Dashboard, Courses, Discussions, etc.)

**Cards & Containers**
- Course cards with visual hierarchy (title, lecturer, deadlines)
- Assignment cards with progress indicators
- Discussion thread containers with reaction counts
- Anonymous post cards with distinct styling

**Forms & Inputs**
- Consistent form styling across all admin panels
- File upload areas with drag-and-drop indicators
- Search bars with autocomplete styling
- Filter dropdowns and toggles

**Data Displays**
- Leaderboard tables with ranking visualization
- Assignment lists with completion status
- Notification feeds with timestamp hierarchy
- Analytics dashboards with clean data presentation

**Admin Interfaces**
- Role management panels with clear hierarchy indicators
- Course creation workflows with multi-step forms
- User management tables with action buttons
- Database configuration forms for course setup

**Overlays**
- Modal dialogs for confirmations and forms
- Toast notifications for real-time updates
- Dropdown menus for user actions
- Context menus for admin functions

### E. Responsive Design
- Mobile-first approach with sidebar collapsing to bottom navigation
- Card-based layouts that stack naturally on smaller screens
- Touch-friendly button sizes (min 44px height)
- PWA optimizations for app-like experience

## Key Design Principles

1. **Hierarchy Clarity**: Clear visual distinction between Top Admins, Course Admins, and Normal Users through subtle UI indicators
2. **Information Density**: Efficient use of space for content-heavy sections like course materials and discussions
3. **Status Communication**: Clear visual indicators for assignment status, notification states, and user roles
4. **Gamification Integration**: Tasteful badge displays and leaderboard presentations that motivate without overwhelming
5. **Anonymous vs. Identified**: Distinct visual treatment for Anonymous Hub content versus regular discussions

## Special Considerations

- **Multi-Database Visual Cues**: Subtle indicators showing which database/course context users are in
- **Real-time Updates**: Smooth animations for notification badges and live content updates
- **Role-Based UI**: Progressive disclosure of admin features based on user permissions
- **Error Handling**: Comprehensive error states with helpful messaging and recovery options
- **Loading States**: Skeleton screens and progress indicators for data-heavy operations

This design system prioritizes functionality and clarity while maintaining modern aesthetics suitable for an educational environment.