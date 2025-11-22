# Admin Login Testing Guide

## Admin Credentials
- **Email:** admin@gmail.com
- **Password:** admin123

## What Should Happen When Admin Logs In

### 1. Login Process
When you login with admin credentials:
1. The system checks your user profile in Firestore
2. If role is "admin", you're redirected to `/admin/dashboard`
3. If role is "user", you're redirected to `/dashboard`

### 2. Admin Menu Features
After logging in as admin, you should see:
- **Blue "ADMIN" badge** next to your name in the dropdown menu
- **Admin Dashboard** option (links to `/admin/dashboard`)
- **User Dashboard** option (links to `/dashboard`)
- Profile
- Logout

### 3. Debug Console Logs
Open browser console (F12) to see debug information:
```
User signed in: <user-id>
User profile loaded: { uid: "...", email: "admin@gmail.com", displayName: "Admin", role: "admin", ... }
Admin detected, redirecting to admin dashboard
```

## Troubleshooting

### Issue: Still showing as regular user
**Solution:** Run the fix-admin script
```bash
npm run fix-admin
```

This will:
- Find the admin@gmail.com user in Firestore
- Update displayName to "Admin"
- Update role to "admin"

### Issue: Not redirecting to admin dashboard
**Possible causes:**
1. Browser cache - Clear cache or use incognito mode
2. Old session - Logout completely and login again
3. Profile not updated - Run `npm run fix-admin`

### Issue: Admin dashboard shows "Access Denied"
**Solution:** The admin dashboard now has authentication protection:
- Only users with role="admin" can access it
- Non-admin users are redirected to `/dashboard`
- Not logged in users are redirected to `/login`

## Admin Dashboard Features

Once logged in as admin, you can:
1. View booking statistics (total bookings, revenue, pending/approved counts)
2. See recent bookings in real-time
3. View feedback statistics and average ratings
4. Access admin-specific features

## Scripts Available

### Create Admin User
```bash
npm run create-admin
```
Creates a new admin user with email: admin@gmail.com

### Fix Existing Admin Profile
```bash
npm run fix-admin
```
Updates the existing admin@gmail.com user profile to have correct admin role

## Current Admin Profile Status

Last updated profile:
- User ID: btSP00estSORPx3jUQ1qafYXKVk2
- Email: admin@gmail.com
- Display Name: Admin
- Role: admin

## Testing Checklist

- [ ] Clear browser cache/cookies
- [ ] Logout from any existing session
- [ ] Login with admin@gmail.com / admin123
- [ ] Check console logs for "Admin detected, redirecting to admin dashboard"
- [ ] Verify redirect to `/admin/dashboard`
- [ ] Check dropdown menu shows "ADMIN" badge
- [ ] Verify "Admin Dashboard" option appears in menu
- [ ] Test accessing admin dashboard directly at `/admin/dashboard`
- [ ] Test that regular users cannot access admin dashboard
