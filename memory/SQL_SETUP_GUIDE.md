# 📋 SUPABASE DATABASE SETUP - STEP BY STEP GUIDE

## 🎯 What This Will Do:

This SQL script will set up **EVERYTHING** needed for your Ward 26 Citizen Connect app:

✅ **Departments Management** (10 default departments)
✅ **Staff/Officer Management**
✅ **Enhanced Complaint System** (with AI fields)
✅ **Complaint Updates & Timeline**
✅ **Multi-Channel Notifications** (WhatsApp, SMS, Email tracking)
✅ **Analytics & Reporting** (for corporator dashboard)
✅ **User Complaint Counter** (for EPIC verification after 5 complaints)
✅ **Janasevak Notice Board** (corporator posts + citizen likes)
✅ **Sample Data** (3 sample Janasevak posts, 10 departments)

---

## 🚀 HOW TO EXECUTE (5 SIMPLE STEPS):

### **Step 1: Go to Supabase**
1. Open your browser
2. Go to: https://hsaiiwznjmucbbuqfgha.supabase.co
3. Login with your credentials

### **Step 2: Open SQL Editor**
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** button (top right)

### **Step 3: Copy the SQL**
1. Open the file: `/app/memory/COMPLETE_DATABASE_SETUP.sql`
2. **Copy the ENTIRE contents** (Ctrl+A, then Ctrl+C)

### **Step 4: Paste and Execute**
1. Paste into the SQL Editor (Ctrl+V)
2. Click **"Run"** button (or press Ctrl+Enter)
3. **Wait** for execution to complete (may take 10-30 seconds)

### **Step 5: Verify Success**
You should see a success message at the bottom:
```
✅ DATABASE SETUP COMPLETE!
All tables, indexes, triggers, and sample data have been created successfully.
```

Also check:
- **Tables Created:** Should show 9
- **Departments Seeded:** Should show 10
- **Janasevak Posts Seeded:** Should show 3

---

## 📊 What Gets Created:

### **Tables:**
1. ✅ `departments` - 10 departments (Roads, Water, Garbage, etc.)
2. ✅ `staff` - Staff and vendors who handle complaints
3. ✅ `complaints` - Enhanced with AI fields
4. ✅ `complaint_updates` - Progress timeline
5. ✅ `notifications` - WhatsApp/SMS delivery tracking
6. ✅ `complaint_analytics` - Daily statistics
7. ✅ `whatsapp_queue` - Message queue
8. ✅ `janasevak_posts` - Corporator's posts
9. ✅ `janasevak_post_likes` - Citizen likes

### **Enhancements to Existing Tables:**
- ✅ `users` table gets `complaint_count` field
- ✅ `complaints` table gets AI fields (department, priority, sentiment, etc.)

### **Sample Data Inserted:**
- ✅ **10 Departments** (Roads, Water, Garbage, Lights, etc.)
- ✅ **3 Janasevak Posts** (Welcome message, Medical camp, Street lights achievement)

### **Automatic Features:**
- ✅ **Triggers** - Auto-update like counts, analytics
- ✅ **Indexes** - Fast queries
- ✅ **Security Policies** - Row Level Security enabled
- ✅ **Views** - Easy data access

---

## ⚠️ IMPORTANT NOTES:

### **Safe to Run Multiple Times:**
✅ The SQL uses `IF NOT EXISTS` and `ON CONFLICT` clauses
✅ Running it again won't cause errors or duplicate data
✅ It will only create what's missing

### **Existing Data:**
✅ Your existing `users` and `complaints` tables are **NOT deleted**
✅ Only **new columns** are added to existing tables
✅ All existing data remains intact

### **If You See Errors:**
- Check if you're using the **correct Supabase project**
- Make sure you have **admin access**
- Copy the **entire SQL** (including comments)

---

## 🎉 After Successful Execution:

### **You Can Immediately Use:**

1. **Admin Panel:**
   - Go to: http://localhost:3000/admin
   - Upload voter list
   - Manage departments (add officer WhatsApp/SMS numbers)
   - View analytics

2. **Janasevak:**
   - Admin: http://localhost:3000/admin/janasevak (create posts)
   - Public: http://localhost:3000/janasevak (view posts)

3. **Analytics:**
   - http://localhost:3000/admin/analytics
   - View 6-month reports
   - Officer performance
   - Hotspot analysis

4. **Departments:**
   - http://localhost:3000/admin/departments
   - Add officer contacts for auto-notifications

---

## 📱 Next Steps After SQL Execution:

### **1. Add Department Officers (IMPORTANT!):**
Go to `/admin/departments` and for each department, add:
- WhatsApp numbers (for auto-notifications)
- SMS numbers (for alerts)
- Email addresses (optional)

**Example:**
- **Roads Department** → Add officer WhatsApp: 919876543210
- **Water Department** → Add officer WhatsApp: 919876543211

### **2. Upload Voter List:**
- Go to `/admin`
- Upload the PDF voter list
- System will extract EPIC numbers and names

### **3. Create First Janasevak Post:**
- Go to `/admin/janasevak`
- Click "Create Post"
- Share an announcement with citizens!

### **4. Test the App:**
- Register a new user
- Submit a complaint
- Check if AI categorizes it
- Verify notifications work (once you add officer numbers)

---

## 🔍 Verification Queries:

**After running the SQL, you can verify by running these queries in SQL Editor:**

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check departments
SELECT code, name FROM departments;

-- Check Janasevak posts
SELECT title, category FROM janasevak_posts;

-- Check users have complaint_count field
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'complaint_count';
```

---

## 🆘 Troubleshooting:

### **Error: "relation already exists"**
✅ This is OK! It means the table was already created. Script continues.

### **Error: "column already exists"**
✅ This is OK! Script uses `IF NOT EXISTS` to prevent duplicates.

### **Error: "permission denied"**
❌ You need admin/owner access to the Supabase project.

### **Error: "function does not exist"**
❌ Make sure you copied the **entire SQL file** including all functions.

---

## 📞 Support:

If you face any issues:
1. Check the error message carefully
2. Verify you're in the correct Supabase project
3. Ensure you have admin privileges
4. Try running the SQL in smaller sections

---

## ✅ Success Checklist:

After running the SQL, verify:
- [ ] No errors in SQL Editor
- [ ] Success message appears
- [ ] Can access `/admin/departments` (shows 10 departments)
- [ ] Can access `/admin/janasevak` (shows 3 sample posts)
- [ ] Can access `/admin/analytics` (shows dashboard)
- [ ] Supabase Table Editor shows all new tables

---

**🎉 Once this SQL is executed successfully, your app is fully functional with all features!**

**File Location:** `/app/memory/COMPLETE_DATABASE_SETUP.sql`

**Estimated Execution Time:** 10-30 seconds
