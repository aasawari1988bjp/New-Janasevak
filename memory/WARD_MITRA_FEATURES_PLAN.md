# Ward Mitra Feature Enhancement Plan

## 📊 Current vs Required Features Comparison

### ✅ Features We Already Have

| Feature | Status | Notes |
|---------|--------|-------|
| Citizen Registration | ✅ | Email, Password, Name, Phone, Address, EPIC Number |
| Voter Verification | ✅ | Against voter list database |
| Geofencing | ✅ | Ward 26 boundary restriction |
| Basic Complaint Submission | ✅ | Category, Title, Description, Location, Photos |
| WhatsApp Notification | ✅ | To corporator (hardcoded) |
| Complaint Storage | ✅ | Supabase database |

### ❌ Features We Need to Add (Ward Mitra Comparison)

| Feature | Priority | Ward Mitra Has | We Need |
|---------|----------|----------------|---------|
| **Real-time Status Tracking** | HIGH | ✅ | ❌ Need to implement |
| **Complaint Assignment System** | HIGH | ✅ | ❌ Need to implement |
| **Staff/Vendor Portal** | HIGH | ✅ | ❌ Need to implement |
| **Corporator Dashboard** | HIGH | ✅ | ❌ Need to implement (basic exists) |
| **Progress Updates with Photos/Videos** | HIGH | ✅ | ❌ Need to implement |
| **Department-wise Routing** | HIGH | ✅ | ❌ Need to implement |
| **Proof-based Closure** | HIGH | ✅ | ❌ Need to implement |
| **Performance Analytics** | MEDIUM | ✅ | ❌ Need to implement |
| **Public Transparency Dashboard** | MEDIUM | ✅ | ❌ Need to implement |
| **Ward-wise Visibility** | MEDIUM | ✅ | ✅ Already have geofencing |
| **Time-stamping** | MEDIUM | ✅ | ✅ Already in DB |
| **Audit-ready Reports** | MEDIUM | ✅ | ❌ Need to implement |
| **Mobile-friendly Staff Updates** | MEDIUM | ✅ | ❌ Need to implement |
| **Notifications & Updates** | HIGH | ✅ | ⚠️ Partial (only corporator) |
| **Admin Centralized Monitoring** | MEDIUM | ✅ | ⚠️ Partial (admin exists) |

### 🤖 AI Features to Implement

| AI Feature | Purpose | Implementation |
|------------|---------|----------------|
| **Auto-categorization** | Classify complaints into departments | Use LLM to analyze complaint text |
| **Smart Department Assignment** | Route to correct officer/department | AI-based routing logic |
| **Auto-notify Officers** | Send WhatsApp/SMS to relevant officers | Multi-recipient messaging |
| **Sentiment Analysis** | Detect urgent/angry complaints | Priority assignment |
| **Progress Tracking** | Monitor resolution timeline | AI alerts for delays |
| **Response Suggestions** | Help staff with response templates | LLM-generated responses |
| **Duplicate Detection** | Identify similar complaints | Semantic similarity |
| **ETA Prediction** | Estimate resolution time | ML-based prediction |

---

## 🎯 Implementation Phases

### **Phase 1: Enhanced Complaint Management (Week 1-2)**

#### 1.1 Database Schema Enhancement
```sql
-- Add new fields to complaints table
ALTER TABLE complaints ADD COLUMN assigned_to UUID REFERENCES staff(id);
ALTER TABLE complaints ADD COLUMN assigned_at TIMESTAMP;
ALTER TABLE complaints ADD COLUMN department TEXT;
ALTER TABLE complaints ADD COLUMN resolved_at TIMESTAMP;
ALTER TABLE complaints ADD COLUMN resolution_proof TEXT[]; -- URLs of proof images
ALTER TABLE complaints ADD COLUMN estimated_resolution_date DATE;
ALTER TABLE complaints ADD COLUMN actual_category TEXT; -- AI-determined category
ALTER TABLE complaints ADD COLUMN sentiment TEXT; -- urgent/normal/low
ALTER TABLE complaints ADD COLUMN is_duplicate BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN duplicate_of UUID REFERENCES complaints(id);

-- Staff/Vendor table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  department TEXT NOT NULL, -- roads, water, garbage, etc.
  role TEXT NOT NULL, -- staff, vendor, supervisor
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Complaint updates/progress table
CREATE TABLE complaint_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id),
  updated_by UUID REFERENCES staff(id),
  status TEXT NOT NULL,
  message TEXT,
  photos TEXT[],
  videos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Department configuration
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  whatsapp_numbers TEXT[], -- Array of officer WhatsApp numbers
  sms_numbers TEXT[], -- Array of SMS numbers
  email_addresses TEXT[],
  is_active BOOLEAN DEFAULT TRUE
);

-- Notifications log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id),
  recipient_type TEXT, -- corporator, staff, citizen, department
  recipient_id TEXT, -- phone/email
  message TEXT,
  channel TEXT, -- whatsapp, sms, email
  status TEXT, -- sent, failed, pending
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 AI Integration Setup

**Required APIs:**
- **LLM for Classification**: OpenAI GPT-5.2 or Gemini 3 Flash
- **WhatsApp Business API**: For notifications
- **SMS API**: Twilio or similar
- **Image Analysis**: For proof verification

**AI Functions:**
1. **Complaint Categorization**
   - Input: Complaint title + description
   - Output: Department (roads, water, garbage, lights, drainage, etc.)
   - Confidence score

2. **Priority/Sentiment Detection**
   - Input: Complaint text
   - Output: urgent/normal/low + sentiment score
   - Use keywords + LLM analysis

3. **Duplicate Detection**
   - Input: New complaint
   - Output: Similar existing complaints
   - Use embeddings + semantic search

4. **Smart Assignment**
   - Input: Department + current workload + location
   - Output: Best staff member to assign
   - Load balancing + proximity

#### 1.3 Department Management API

**Endpoints:**
```typescript
POST /api/admin/departments - Create department
GET /api/admin/departments - List all departments
PUT /api/admin/departments/:id - Update department
DELETE /api/admin/departments/:id - Delete department

POST /api/admin/staff - Add staff member
GET /api/admin/staff - List staff
PUT /api/admin/staff/:id - Update staff
DELETE /api/admin/staff/:id - Remove staff
```

#### 1.4 Enhanced Complaint API

**New Endpoints:**
```typescript
POST /api/complaints - Submit (enhanced with AI categorization)
GET /api/complaints - List with filters
GET /api/complaints/:id - Get single complaint
PUT /api/complaints/:id/assign - Assign to staff
PUT /api/complaints/:id/status - Update status
POST /api/complaints/:id/updates - Add progress update
POST /api/complaints/:id/close - Close with proof
GET /api/complaints/:id/timeline - Get full timeline

// Public transparency
GET /api/public/complaints - Public dashboard (anonymized)
GET /api/public/stats - Ward statistics
```

---

### **Phase 2: Corporator Dashboard (Week 2-3)**

#### 2.1 Dashboard Features
- **Overview Cards**:
  - Total complaints (today, week, month)
  - Pending complaints
  - Resolved complaints
  - Average resolution time
  - Department-wise breakdown
  
- **Complaint List**:
  - Filter by status, department, date, priority
  - Search functionality
  - Bulk actions (assign, close)
  
- **Assignment Interface**:
  - Drag-and-drop assignment
  - Staff workload view
  - Auto-suggest best staff member (AI)
  
- **Analytics**:
  - Response time trends
  - Resolution rate by department
  - Hotspot map (most complaints areas)
  - Performance by staff member
  
- **Reports**:
  - Daily/Weekly/Monthly reports
  - Export to PDF/Excel
  - Audit-ready format

#### 2.2 UI Components
- Complaint card with status badge
- Timeline component
- Map view with markers
- Charts (bar, line, pie)
- Staff assignment modal
- Proof upload interface

---

### **Phase 3: Staff/Vendor Portal (Week 3-4)**

#### 3.1 Mobile-First Interface
- **Login**: Phone number + OTP
- **Dashboard**:
  - Assigned tasks
  - Pending tasks
  - Completed tasks
  
- **Task Details**:
  - Complaint information
  - Location with Google Maps
  - Citizen contact
  
- **Progress Update**:
  - Add status update
  - Upload photos/videos
  - Add notes
  - Mark as resolved
  
- **Camera Integration**:
  - Take photos directly
  - Upload before/after photos
  - Video recording

#### 3.2 Notification System
- Push notifications for new assignments
- SMS for urgent tasks
- WhatsApp for updates

---

### **Phase 4: AI-Powered Notifications (Week 4-5)**

#### 4.1 Multi-Channel Notification System

**Architecture:**
```
Complaint Submitted
    ↓
AI Categorizes & Assigns Department
    ↓
Notification Manager
    ├─→ WhatsApp to Department Officers
    ├─→ SMS to Department Officers
    ├─→ WhatsApp to Corporator
    └─→ Email to Admin
```

**Implementation:**

```typescript
// AI Categorization Service
async function categorizeComplaint(complaint: {
  title: string;
  description: string;
  category: string;
}) {
  // Use LLM to categorize
  const prompt = `Categorize this municipal complaint:
  
  Title: ${complaint.title}
  Description: ${complaint.description}
  User Category: ${complaint.category}
  
  Available Departments:
  - Roads & Footpaths (roads)
  - Water Supply (water)
  - Drainage & Sewage (drainage)
  - Garbage Collection (garbage)
  - Street Lights (lights)
  - Encroachment (encroachment)
  - Pollution (pollution)
  - Others (others)
  
  Respond in JSON format:
  {
    "department": "department_code",
    "priority": "urgent|normal|low",
    "confidence": 0.95,
    "reasoning": "brief explanation"
  }`;
  
  // Call LLM API
  const response = await llm.complete(prompt);
  return JSON.parse(response);
}

// Notification Service
async function sendDepartmentNotifications(complaint: Complaint, department: Department) {
  const notifications = [];
  
  // WhatsApp to all officers
  for (const whatsapp of department.whatsapp_numbers) {
    notifications.push(
      sendWhatsApp(whatsapp, formatComplaintMessage(complaint))
    );
  }
  
  // SMS to all officers
  for (const phone of department.sms_numbers) {
    notifications.push(
      sendSMS(phone, formatComplaintSMS(complaint))
    );
  }
  
  // Log all notifications
  await Promise.all(notifications);
}
```

#### 4.2 Real-time Tracking

**Websocket/SSE for Live Updates:**
- Citizen sees status changes in real-time
- Corporator dashboard auto-updates
- Staff gets instant assignments

**Timeline Events:**
1. Complaint submitted (timestamp)
2. AI categorized (timestamp + department)
3. Assigned to staff (timestamp + staff name)
4. Staff accepted (timestamp)
5. Work in progress (timestamp + photos)
6. Work completed (timestamp + proof)
7. Corporator approved (timestamp)
8. Closed (timestamp)

---

### **Phase 5: Public Transparency Dashboard (Week 5-6)**

#### 5.1 Public Portal Features
- **Ward Overview**:
  - Total complaints
  - Resolved vs pending
  - Average resolution time
  
- **Complaint Map**:
  - Anonymized complaints on map
  - Color-coded by status
  - Cluster view
  
- **Statistics**:
  - Department-wise breakdown
  - Timeline charts
  - Response time graphs
  
- **No Personal Data**:
  - No names, phone numbers
  - Only location, category, status

#### 5.2 Trust Building Features
- Every action timestamped
- Status changes visible to public
- Resolution proof visible (optional)
- Data-driven insights

---

### **Phase 6: Advanced Analytics (Week 6-7)**

#### 6.1 Performance Metrics
- **Complaint Metrics**:
  - Total complaints (time period)
  - Resolution rate
  - Average resolution time
  - Re-opened complaints
  
- **Department Performance**:
  - Response time by department
  - Resolution rate by department
  - Workload distribution
  
- **Staff Performance**:
  - Tasks completed
  - Average completion time
  - Quality score (based on re-opens)
  
- **Trend Analysis**:
  - Complaint hotspots
  - Peak complaint times
  - Seasonal trends
  - Recurring issues

#### 6.2 Predictive Analytics (AI)
- **ETA Prediction**: Estimate resolution time based on:
  - Complaint type
  - Department workload
  - Historical data
  - Staff availability
  
- **Workload Forecasting**: Predict complaint volume
- **Resource Optimization**: Suggest staff allocation
- **Proactive Alerts**: Warn about potential delays

---

## 🛠️ Technical Stack

### AI/ML Services
- **LLM**: OpenAI GPT-5.2 / Gemini 3 Flash (via Emergent Universal Key)
- **Embeddings**: For duplicate detection
- **Classification**: Custom model for complaint categorization

### Communication APIs
- **WhatsApp Business API**: Meta Graph API
- **SMS**: Twilio / AWS SNS / MSG91
- **Email**: SendGrid / AWS SES
- **Push Notifications**: Firebase Cloud Messaging

### Real-time
- **WebSockets**: For live updates
- **Server-Sent Events**: For notifications
- **Redis**: For caching and pub/sub

### File Storage
- **Supabase Storage**: For images/videos
- **CDN**: For fast delivery

---

## 📋 Implementation Checklist

### Database
- [ ] Create staff table
- [ ] Create complaint_updates table
- [ ] Create departments table
- [ ] Create notifications table
- [ ] Add indexes for performance
- [ ] Seed initial departments

### APIs
- [ ] Enhanced complaint submission with AI
- [ ] Department management APIs
- [ ] Staff management APIs
- [ ] Assignment APIs
- [ ] Status update APIs
- [ ] Timeline APIs
- [ ] Public dashboard APIs
- [ ] Analytics APIs

### AI Integration
- [ ] LLM complaint categorization
- [ ] Priority/sentiment detection
- [ ] Duplicate detection
- [ ] Smart assignment algorithm
- [ ] ETA prediction

### Notifications
- [ ] WhatsApp Business API setup
- [ ] SMS API integration
- [ ] Multi-recipient notification system
- [ ] Notification templates
- [ ] Delivery tracking

### Dashboards
- [ ] Corporator dashboard UI
- [ ] Staff portal UI
- [ ] Admin panel enhancements
- [ ] Public transparency dashboard
- [ ] Analytics dashboard

### Mobile
- [ ] Mobile-responsive staff portal
- [ ] Camera integration
- [ ] Offline support
- [ ] Push notifications

### Testing
- [ ] API testing
- [ ] AI accuracy testing
- [ ] Notification delivery testing
- [ ] Load testing
- [ ] User acceptance testing

---

## 🚀 Quick Start Implementation Order

1. **Week 1**: Database + AI categorization
2. **Week 2**: Department management + Enhanced complaint API
3. **Week 3**: Corporator dashboard
4. **Week 4**: Staff portal
5. **Week 5**: Multi-channel notifications
6. **Week 6**: Public dashboard
7. **Week 7**: Analytics + Polish

---

## 💰 Estimated Costs

### API Costs (Monthly)
- **LLM (GPT-5.2/Gemini)**: $50-200 (depends on volume)
- **WhatsApp Business API**: $0.01-0.05 per message
- **SMS API**: $0.02-0.10 per SMS
- **Storage**: $5-20 (images/videos)
- **Total**: ~$100-500/month (for 500-1000 complaints/month)

### Development Time
- **Total**: 6-7 weeks
- **Developer**: 1-2 full-time

---

## 📞 Integration Requirements

### External Services Needed
1. **WhatsApp Business API**
   - Meta Business Suite setup
   - Phone number registration
   - Business verification
   
2. **SMS Provider**
   - Twilio account (recommended)
   - Or MSG91 (India-specific)
   - Or AWS SNS
   
3. **LLM Access**
   - Emergent Universal Key (already have)
   - Or OpenAI API key
   - Or Google Gemini API key

### Department Officer Data Required
- List of all departments
- Officer names and roles
- WhatsApp numbers for each department
- SMS numbers
- Email addresses (optional)

---

## 🎯 Success Metrics

### Transparency Metrics
- ✅ 100% complaints time-stamped
- ✅ All status changes visible
- ✅ Mandatory resolution proof
- ✅ Public dashboard availability

### Performance Metrics
- ⏱️ Reduce average resolution time by 50%
- 📈 Increase resolution rate to 90%+
- 🎯 95% notification delivery success
- ⚡ Real-time updates (<5 seconds)
- 😊 Citizen satisfaction score 4+/5

---

## 🔐 Security & Compliance

- Role-based access control
- Data encryption at rest and transit
- Audit logs for all actions
- GDPR-like privacy controls
- Regular security audits
- Backup and disaster recovery

---

## 📱 Mobile App Considerations (Future)

- Native Android app
- Native iOS app
- Progressive Web App (PWA)
- Offline functionality
- Camera integration
- GPS tracking
- Push notifications

---

This plan transforms your app from a basic complaint system to a comprehensive Ward Mitra-level platform with AI-powered automation!
