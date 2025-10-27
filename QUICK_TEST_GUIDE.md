# Quick Test Guide - TutorsPool Authentication

## 🚀 Quick Start

### 1. Access the Application
**URL**: http://localhost:5173

### 2. Test Credentials (For Quick Testing)

#### Student Account
```
Navigate to: http://localhost:5173/signup
Tab: "I'm a Student"

Step 1 - Basic Info:
- Name: John Student
- Email: john.student@test.com
- Phone: +1234567890
- Country: United States

Step 2 - Academic Details:
- Grade Level: High School (9-12)
- Preferred Mode: Online

Step 3 - Learning Goals:
- Learning Goals: "I want to improve my mathematics skills and prepare for college entrance exams"

Step 4 - Budget:
- Min Budget: 20
- Max Budget: 50

Click: "Complete Registration"
```

#### Tutor Account
```
Navigate to: http://localhost:5173/signup
Tab: "I'm a Tutor"

Step 1 - Basic Info:
- Name: Sarah Teacher
- Email: sarah.teacher@test.com
- Phone: +1234567890
- Country: United States

Step 2 - Professional Details:
- Headline: "Experienced Mathematics Teacher with 10 Years Experience"
- Bio: "I have been teaching mathematics for over 10 years. I specialize in algebra, calculus, geometry, and test preparation. My students consistently achieve excellent results."
- Years of Experience: 10

Step 3 - Subjects & Pricing:
- Subjects: Check "Mathematics" and "Physics"
- Levels: Check "High School (9-12)" and "College/University"
- Hourly Rate: 35
- Currency: USD

Step 4 - Availability:
- Click "Add Time Block"
- Day: Monday
- Start: 09:00
- End: 17:00
- (Add more blocks if desired)

Step 5 - In-Person Location:
- Skip (optional)

Click: "Complete Registration"
```

#### Admin Account
```
Navigate to: http://localhost:5173/signup
Tab: "I'm an Admin"

- Name: Admin User
- Email: admin@tutorspool.com
- Phone: +1234567890
- Country: United States
- Timezone: Eastern Time (ET)
- Admin Code: ADMIN2024

Click: "Create Admin Account"
```

### 3. Test Login
```
Navigate to: http://localhost:5173/login

Use any email you registered with:
- Email: john.student@test.com (or any registered email)
- Password: (any password - not validated currently)

Click: "Sign in"
```

## ✅ Expected Results

### After Student Registration:
- ✅ Redirects to `/student/dashboard`
- ✅ Shows student dashboard with profile info
- ✅ Can search for tutors
- ✅ Can book sessions

### After Tutor Registration:
- ✅ Redirects to `/tutor/dashboard`
- ✅ Shows tutor dashboard with profile info
- ✅ Can manage availability
- ✅ Can view bookings

### After Admin Registration:
- ✅ Redirects to `/admin`
- ✅ Shows admin dashboard
- ✅ Can manage users
- ✅ Can view all bookings

### After Login:
- ✅ Redirects to role-based dashboard
- ✅ User info displayed in header
- ✅ Can access protected routes

## 🐛 Troubleshooting

### Issue: "Please complete all required fields"
**Solution**: Make sure all required fields are filled:
- Student Step 2: Both Grade Level AND Preferred Mode must be selected
- Tutor Step 3: At least one subject, one level, and hourly rate must be set
- Tutor Step 4: At least one availability block must be added

### Issue: "Registration failed"
**Solution**: Check browser console for errors. Common causes:
- Email already registered (use a different email)
- Network error (check if backend is running on port 5174)

### Issue: Can't proceed to next step
**Solution**: 
- Check that all required fields in current step are filled
- For select dropdowns, make sure an option is selected
- For checkboxes (subjects/levels), at least one must be checked

### Issue: "Invalid Admin Code"
**Solution**: Use the correct admin code: `ADMIN2024`

## 🔍 Verify Everything Works

### Checklist:
- [ ] Can access signup page
- [ ] Can switch between Student/Tutor/Admin tabs
- [ ] Student registration completes all 4 steps
- [ ] Tutor registration completes all 5 steps
- [ ] Admin registration works with correct code
- [ ] Can navigate from signup to login
- [ ] Can login with registered email
- [ ] Redirects to correct dashboard based on role
- [ ] User info shows in header after login
- [ ] Can logout and login again

## 📱 Browser Console

Open browser console (F12) to see:
- Form validation logs
- API request/response logs
- Authentication token storage
- Any errors or warnings

## 🎯 Quick Test Scenarios

### Scenario 1: Complete Student Journey
1. Register as student → 2. Login → 3. Search tutors → 4. View tutor profile → 5. Book session

### Scenario 2: Complete Tutor Journey
1. Register as tutor → 2. Login → 3. View dashboard → 4. Update availability → 5. View bookings

### Scenario 3: Admin Management
1. Register as admin → 2. Login → 3. View users → 4. Approve/reject users → 5. View bookings

## 🌐 API Endpoints (For Testing)

### Test Backend Directly:
```bash
# Test registration
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","country":"USA","role":"STUDENT"}'

# Test login
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test auth check (replace TOKEN with actual token)
curl http://localhost:5174/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Success Indicators

✅ **Registration Working**: User created, token received, redirected to dashboard
✅ **Login Working**: Token received, user data loaded, redirected to dashboard
✅ **Navigation Working**: Can move between pages without errors
✅ **Validation Working**: Form prevents submission with invalid data
✅ **Role-based Access**: Each role sees appropriate dashboard

---

**Need Help?** Check the detailed documentation in `AUTHENTICATION_FIXES.md` and `TESTING_SUMMARY.md`
