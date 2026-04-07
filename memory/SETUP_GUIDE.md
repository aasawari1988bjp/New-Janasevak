# Ward 26 Citizen Connect - Setup Guide

## 🚀 Application Overview

This is a Next.js application for **Ward 26, KDMC (Kalyan Dombivli Municipal Corporation)** - a local politician's (Corporator) app for Mrs. Aasawari Kedar Navare (BJP).

### Key Features

1. **Citizen Registration with Verification**
   - Name, Email, Password, Phone, Address, EPIC Number
   - Voter verification against voter list database
   - Geofencing (restricted to Ward 26 area only)

2. **Voter List Management**
   - Admin interface to upload voter lists (PDF)
   - Supports large files (60,000+ voters, 10,000+ pages)
   - Batch processing for performance
   - Real-time statistics dashboard

3. **Geofencing**
   - Automatically detects user location
   - Only allows registration from within Ward 26 boundaries
   - Real-time location verification

4. **Complaint System**
   - Citizens can lodge complaints
   - Track complaint status
   - Direct communication with representatives

## 📦 Tech Stack

- **Framework**: Next.js 15.3.5 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Custom auth with bcrypt
- **PDF Processing**: pdf-parse library
- **Deployment**: Kubernetes with supervisor

## 🗄️ Database Schema

### Required Supabase Tables:

#### 1. `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  voter_id TEXT,
  epic_number TEXT UNIQUE,
  latitude DECIMAL,
  longitude DECIMAL,
  is_verified BOOLEAN DEFAULT false,
  voter_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `voter_list` table
```sql
CREATE TABLE voter_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sr_no INTEGER,
  epic_number TEXT UNIQUE NOT NULL,
  voter_name TEXT NOT NULL,
  father_husband_name TEXT,
  house_no TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voter_list_epic ON voter_list(epic_number);
CREATE INDEX idx_voter_list_name ON voter_list(voter_name);
```

#### 3. `complaints` table (if not exists)
```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending',
  location_lat DECIMAL,
  location_lng DECIMAL,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Environment Variables

File: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Running the Application

### Development Mode
```bash
cd /app
yarn dev
```

### Production Mode
```bash
cd /app
yarn build
yarn start
```

### Using Supervisor
```bash
sudo supervisorctl restart nextjs
sudo supervisorctl status nextjs
tail -f /var/log/supervisor/nextjs.out.log
```

## 📍 Geofencing Configuration

Ward 26 boundaries are defined in `/app/src/lib/geofence.ts`:

```typescript
export const WARD_26_BOUNDARY: Coordinate[] = [
  { lat: 19.2245, lng: 73.0835 },
  // ... 16 coordinate points defining the polygon
];

export const WARD_26_CENTER = {
  lat: 19.2215,
  lng: 73.0925,
};
```

**Areas covered:**
- Ayare Road
- Rajaji Path
- Ram Nagar
- Shiv Market
- Savarkar Road

## 📤 Voter List Upload

### Admin Interface
- URL: `/admin`
- Upload PDF voter lists
- Supports large files (60k+ entries)
- Batch processing (500 records per batch)
- Real-time progress tracking

### Supported PDF Formats
The parser supports common voter list formats:
- Table format: `Sr.No | EPIC | Name | Age | Gender`
- Key-value format: `Name: XXX, EPIC: ABC1234567, Age: 35`
- Both English and Hindi text

### Parsing Logic
- Extracts EPIC numbers (3 letters + 7 digits)
- Extracts voter names, age, gender
- Handles father/husband names, house numbers
- Batch inserts for performance

## 🔐 Voter Verification Process

1. **User Registration**
   - User provides: Name, EPIC Number, other details
   - System verifies location is within Ward 26
   - System verifies EPIC number in voter list database

2. **Verification Methods**
   - **Exact EPIC Match**: 100% confidence
   - **Name Similarity**: Uses Levenshtein distance (75%+ similarity required)

3. **Registration Flow**
   ```
   User fills form → Location check → EPIC verification → 
   Name matching → Account creation → Success
   ```

## 📊 Admin Dashboard Features

1. **Statistics Overview**
   - Total voters count
   - Gender distribution
   - Age distribution charts

2. **Upload Management**
   - PDF upload interface
   - Progress tracking
   - Error logging
   - Sample entries preview

3. **Data Insights**
   - Age groups: 18-25, 26-35, 36-50, 51-65, 65+
   - Male/Female ratio
   - Voter density visualization

## 🛠️ API Endpoints

### Public APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/verify-location` - Location verification
- `POST /api/voter-verify` - Voter EPIC verification

### Admin APIs
- `POST /api/admin/upload-voter-list` - Upload voter PDF
- `GET /api/admin/voter-stats` - Get voter statistics

### Complaints APIs
- `GET /api/complaints` - List complaints
- `POST /api/complaints` - Create complaint

## 🐛 Troubleshooting

### Voter Upload Issues
**Problem**: PDF not parsing correctly
**Solution**: 
- Check PDF format matches supported formats
- View raw text preview in upload result
- Ensure EPIC numbers follow format: ABC1234567

**Problem**: Large PDF taking too long
**Solution**:
- System processes in batches (500 at a time)
- Check `/var/log/supervisor/nextjs.out.log` for progress
- Consider splitting very large PDFs

### Location/Geofencing Issues
**Problem**: Valid users getting blocked
**Solution**:
- Verify WARD_26_BOUNDARY coordinates in `/app/src/lib/geofence.ts`
- Test specific lat/lng using `/api/verify-location`
- Check browser location permissions

### Database Connection Issues
**Problem**: Cannot connect to Supabase
**Solution**:
- Verify environment variables in `.env.local`
- Check Supabase project is active
- Verify service role key permissions

## 📱 Application URLs

- **Homepage**: `http://localhost:3000/`
- **Registration**: `http://localhost:3000/register`
- **Login**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Dashboard**: `http://localhost:3000/dashboard`

## 🔍 Key Files to Know

- `/app/src/app/api/admin/upload-voter-list/route.ts` - PDF upload handler
- `/app/src/lib/voter-verification.ts` - Voter verification logic
- `/app/src/lib/geofence.ts` - Geofencing logic
- `/app/src/app/admin/page.tsx` - Admin dashboard UI
- `/app/src/app/register/page.tsx` - Registration page

## 📈 Performance Optimizations

1. **Batch Processing**: Inserts 500 voters at a time
2. **Database Indexes**: On epic_number and voter_name
3. **Caching**: Stats cached on client side
4. **Lazy Loading**: Components loaded on demand

## 🎯 Next Steps

1. **Upload Voter List**: Go to `/admin` and upload your PDF voter list
2. **Test Registration**: Try registering with a valid EPIC number
3. **Test Geofencing**: Try registering from outside Ward 26
4. **Monitor Logs**: Check supervisor logs for any errors

## 📞 Support

For issues or questions, check:
- Supervisor logs: `/var/log/supervisor/nextjs.out.log`
- Browser console for client-side errors
- Supabase dashboard for database queries
