# 🚀 Role-Based Routing Guide

## ✅ Implementation Complete

Your app now has **intelligent role-based routing** that automatically redirects users to their appropriate dashboard based on their role.

## 🎯 How It Works

### When Users Log In

1. **Student logs in** → Redirected to `/student/dashboard`
2. **Tutor logs in** → Redirected to `/tutor/dashboard`
3. **Admin logs in** → Redirected to `/admin`

### When Logged-In Users Try to Access Login/Signup

- If a logged-in user tries to visit `/login` or `/signup`, they're automatically redirected to their dashboard
- This prevents confusion and improves UX

### When Users Try to Access Wrong Dashboard

- If a **student** tries to access `/tutor/dashboard` → Redirected to `/student/dashboard`
- If a **tutor** tries to access `/admin` → Redirected to `/tutor/dashboard`
- If an **admin** tries to access `/student/dashboard` → Redirected to `/admin`

## 📁 Components Created/Updated

### 1. **GuestRoute Component** (`src/components/GuestRoute.tsx`)
```typescript
// Redirects authenticated users to their dashboard
// Used for login, signup pages
<Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
```

**Purpose:**
- Prevents logged-in users from accessing login/signup pages
- Automatically redirects to appropriate dashboard

### 2. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
```typescript
// Protects routes that require authentication
// Optionally restricts by role
<Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
```

**Purpose:**
- Requires authentication to access
- Redirects unauthenticated users to `/login`
- Enforces role-based access control

### 3. **AuthContext** (`src/contexts/AuthContext.tsx`)
```typescript
// Provides getDashboardUrl() function
const dashboardUrl = getDashboardUrl(); // Returns role-specific dashboard URL
```

**Purpose:**
- Centralized authentication state
- `getDashboardUrl()` returns correct dashboard based on user role

## 🗺️ Route Structure

### Public Routes (No Auth Required)
```
/                    → Landing Page
/about               → About Page
/contact             → Contact Page
/subjects            → Subjects Page
/blog                → Blog List
/blog/:slug          → Blog Post
/search              → Search Tutors
/tutor/:tutorId      → Tutor Profile
```

### Guest-Only Routes (Redirects if Logged In)
```
/login               → Login Page (redirects to dashboard if logged in)
/signup              → Signup Page (redirects to dashboard if logged in)
/debug-signup        → Debug Signup (redirects to dashboard if logged in)
```

### Protected Routes (Requires Auth)

#### Student Routes
```
/student/dashboard   → Student Dashboard (STUDENT only)
/account             → Account Settings (any authenticated user)
/session/:bookingId  → Session Page (any authenticated user)
```

#### Tutor Routes
```
/tutor/dashboard     → Tutor Dashboard (TUTOR only)
/tutor/register      → Tutor Registration
```

#### Admin Routes
```
/admin               → Admin Dashboard (ADMIN only)
/admin/dashboard     → Admin Dashboard (ADMIN only)
/admin/users         → User Management (ADMIN only)
/admin/tutors        → Tutor Management (ADMIN only)
/admin/bookings      → Booking Management (ADMIN only)
/admin/blog          → Blog Management (ADMIN only)
/admin/reports       → Reports (ADMIN only)
/admin/errors        → Error Monitoring (ADMIN only)
/admin/profile       → Admin Profile (ADMIN only)
/admin/settings      → Admin Settings (ADMIN only)
/admin/approvals     → User Approvals (ADMIN only)
```

## 🔐 Role-Based Access Control

### Role Hierarchy
```
ADMIN    → Full access to all routes
TUTOR    → Access to tutor dashboard and common routes
STUDENT  → Access to student dashboard and common routes
```

### Access Matrix

| Route | STUDENT | TUTOR | ADMIN | Guest |
|-------|---------|-------|-------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/login` | ❌ (→ dashboard) | ❌ (→ dashboard) | ❌ (→ dashboard) | ✅ |
| `/student/dashboard` | ✅ | ❌ (→ tutor dash) | ❌ (→ admin) | ❌ (→ login) |
| `/tutor/dashboard` | ❌ (→ student dash) | ✅ | ❌ (→ admin) | ❌ (→ login) |
| `/admin` | ❌ (→ student dash) | ❌ (→ tutor dash) | ✅ | ❌ (→ login) |
| `/account` | ✅ | ✅ | ✅ | ❌ (→ login) |

## 🧪 Testing the Routing

### Test as Student
1. Log in with student credentials
2. Try to access `/login` → Should redirect to `/student/dashboard`
3. Try to access `/tutor/dashboard` → Should redirect to `/student/dashboard`
4. Try to access `/admin` → Should redirect to `/student/dashboard`
5. Access `/student/dashboard` → Should work ✅

### Test as Tutor
1. Log in with tutor credentials
2. Try to access `/login` → Should redirect to `/tutor/dashboard`
3. Try to access `/student/dashboard` → Should redirect to `/tutor/dashboard`
4. Try to access `/admin` → Should redirect to `/tutor/dashboard`
5. Access `/tutor/dashboard` → Should work ✅

### Test as Admin
1. Log in with admin credentials
2. Try to access `/login` → Should redirect to `/admin`
3. Try to access `/student/dashboard` → Should redirect to `/admin`
4. Try to access `/tutor/dashboard` → Should redirect to `/admin`
5. Access `/admin` → Should work ✅

### Test as Guest (Not Logged In)
1. Try to access `/student/dashboard` → Should redirect to `/login`
2. Try to access `/tutor/dashboard` → Should redirect to `/login`
3. Try to access `/admin` → Should redirect to `/login`
4. Access `/login` → Should work ✅

## 🎨 User Experience Flow

### New User Registration
```
1. Visit /signup
2. Fill registration form
3. Select role (STUDENT/TUTOR)
4. Submit
5. Auto-login
6. Redirect to role-specific dashboard
```

### Existing User Login
```
1. Visit /login
2. Enter credentials
3. Submit
4. Auto-redirect to:
   - /student/dashboard (if STUDENT)
   - /tutor/dashboard (if TUTOR)
   - /admin (if ADMIN)
```

### Logged-In User Navigation
```
1. User clicks "Login" in header
2. GuestRoute detects user is logged in
3. Redirects to their dashboard
4. User sees their dashboard instead of login page
```

## 🔧 How to Add New Protected Routes

### Add Student-Only Route
```typescript
<Route 
  path="/student/new-feature" 
  element={
    <ProtectedRoute roles={['STUDENT']}>
      <NewFeature />
    </ProtectedRoute>
  } 
/>
```

### Add Tutor-Only Route
```typescript
<Route 
  path="/tutor/new-feature" 
  element={
    <ProtectedRoute roles={['TUTOR']}>
      <NewFeature />
    </ProtectedRoute>
  } 
/>
```

### Add Admin-Only Route
```typescript
<Route 
  path="/admin/new-feature" 
  element={
    <ProtectedRoute roles={['ADMIN']}>
      <AdminRouteWrapper>
        <NewFeature />
      </AdminRouteWrapper>
    </ProtectedRoute>
  } 
/>
```

### Add Multi-Role Route
```typescript
<Route 
  path="/shared-feature" 
  element={
    <ProtectedRoute roles={['STUDENT', 'TUTOR']}>
      <SharedFeature />
    </ProtectedRoute>
  } 
/>
```

### Add Any-Authenticated Route
```typescript
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

## 📊 Benefits

✅ **Better UX** - Users always land on the right page  
✅ **Security** - Role-based access control enforced  
✅ **No Confusion** - Logged-in users can't access login page  
✅ **Automatic** - No manual redirects needed in components  
✅ **Centralized** - All routing logic in one place  
✅ **Type-Safe** - TypeScript ensures correct role names  

## 🚨 Important Notes

1. **Always use ProtectedRoute** for authenticated pages
2. **Always use GuestRoute** for login/signup pages
3. **Role names are case-sensitive**: `'STUDENT'`, `'TUTOR'`, `'ADMIN'`
4. **getDashboardUrl()** is the source of truth for dashboard URLs
5. **Loading states** are handled automatically by both route components

## 🎯 Summary

Your routing system now:
- ✅ Redirects users to role-specific dashboards on login
- ✅ Prevents logged-in users from accessing login/signup
- ✅ Enforces role-based access control
- ✅ Provides smooth, automatic navigation
- ✅ Handles loading states gracefully
- ✅ Is fully type-safe with TypeScript

---

**Status:** ✅ Complete and ready to use  
**Last Updated:** October 23, 2025
