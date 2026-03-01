# Testing Guide

## Quick Start

### 1. Create a Student Account

1. Visit the home page and click "Student Login"
2. Click the "Sign Up" tab
3. Fill in the registration form:
   - Full Name: `John Doe`
   - Email: `john@test.com`
   - Department: `Computer Science`
   - Password: `password123`
4. Click "Sign Up"
5. Switch to "Login" tab and login with the credentials

### 2. Create an Admin Account

Since admin accounts need special privileges, you'll need to:

1. First create a student account (follow step 1 above with different email)
2. Use the Supabase dashboard or SQL to update the user's role:

```sql
UPDATE students
SET role = 'admin'
WHERE email = 'admin@test.com';
```

Alternatively, create directly:
- Email: `admin@test.com`
- Password: `admin123`

Then update via SQL to set role = 'admin'

### 3. Test Student Features

As a student, you can:
- View your dashboard with report statistics
- Create a new incident report with:
  - Type (Bullying, Theft, etc.)
  - Date
  - Location (with auto-detect feature)
  - Description
  - Optional photo upload
- View all your reports
- View report details
- Delete unresolved reports

### 4. Test Admin Features

As an admin, you can:
- View all reports from all students
- See report details with student information
- Change report status (new → unresolved → resolved)
- Delete any report
- View all students
- Edit student information
- Promote students to admin role

## Key Features to Test

### Role-Based Access Control
- Students can only see their own reports
- Admins can see all reports
- After logging in, users are redirected to appropriate dashboard
- Changing a student to admin grants immediate admin access on next login

### Photo Upload
- Upload photos up to 5MB
- Photos stored securely in Supabase Storage
- Students can only access their own photos
- Admins can view all photos

### Report Status Management
- New reports start with "new" status
- Only admins can change status
- Students can delete unresolved reports
- Students cannot delete resolved reports

### Location Detection
- Browser geolocation API integration
- Auto-detect with reverse geocoding
- Manual entry fallback

## Troubleshooting

If you encounter issues:

1. Ensure Supabase credentials are set in `.env`
2. Check browser console for errors
3. Verify database tables and RLS policies are created
4. Ensure storage bucket "report-photos" exists
