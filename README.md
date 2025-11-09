# Clause-IQ 🔍

**Intelligent Contract Management & Analysis Platform**

AI-powered contract review system that automates extraction, risk analysis, compliance checking, and deadline management.

---

## 🌟 Features (15/15 Complete)

### ✅ Core Contract Management
- **Upload & Storage** - PDF/DOCX to Cloudinary with metadata
- **Text Extraction** - OCR + native parsing with quality detection
- **AI Field Extraction** - Parties, dates, amounts, clauses with confidence scores
- **Risk Analysis** - AI-powered scoring (0-100) with pattern detection
- **Contract Detail View** - Comprehensive display with inline editing

### ✅ Compliance & Playbook
- **Custom Rules** - Define compliance requirements
- **Auto-Checking** - Runs after AI extraction
- **Deviation Tracking** - Detailed reports with recommendations
- **Rule Management** - Admin UI for rule CRUD

### ✅ Task & Deadline Management
- **Auto-Generation** - Creates tasks from contract dates
- **Smart Scheduling** - 30/60/90 day advance notices
- **Assignment System** - Assign to team members
- **Multiple Views** - List table and Kanban board
- **Calendar Integration** - Visual timeline with FullCalendar

### ✅ AI Chat & Knowledge Base
- **RAG System** - Retrieval Augmented Generation
- **Source Citations** - Answers reference specific clauses
- **Chat History** - Persistent conversation tracking
- **Context-Aware** - Uses actual contract text

### ✅ Collaboration Tools
- **Comments & Replies** - Threaded discussions
- **@Mentions** - Notify team members
- **Tags** - Organize contracts
- **Audit Log** - Complete activity tracking
- **Real-time Notifications** - Bell icon with updates

### ✅ Search & Reporting
- **Advanced Search** - 10+ filter options
- **Full-text Search** - In clauses and contract text
- **CSV Export** - Contracts and tasks
- **PDF Reports** - Status, risk, compliance summaries

### ✅ Admin & Security
- **RBAC** - Admin/Legal/Viewer roles
- **Rate Limiting** - Protect API endpoints
- **Usage Metrics** - Track API calls and AI usage
- **Admin Dashboard** - Organization insights
- **Org Boundaries** - Complete data isolation

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Backend API (Node.js + Express + TypeScript)
    ↓
MongoDB (Data) + Cloudinary (Files) + Gemini AI (Intelligence)
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Create from template below
npm run dev
```

**Required Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clauseiq
JWT_SECRET=your-super-secret-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

### 3. Access Application

- Open browser to http://localhost:5173
- Sign up for new account
- Create organization
- Start uploading contracts!

---

## 📁 Project Structure

```
clause-iq/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary setup
│   │   ├── controllers/     # 13 controllers
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── models/          # 14 MongoDB models
│   │   ├── routes/          # API routing
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helpers
│   │   └── server.ts        # Entry point
│   ├── Dockerfile           # Container deployment
│   ├── render.yaml          # Render deployment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # 7 reusable components
│   │   ├── pages/           # 13 page components
│   │   ├── store/           # Redux state management
│   │   ├── types/           # TypeScript interfaces
│   │   └── router/          # React Router config
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
├── DEPLOYMENT.md            # Detailed deployment guide
├── IMPLEMENTATION_SUMMARY.md # Feature completion summary
└── README.md               # This file
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account + organization
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/invite` - Invite team member (Admin)
- `POST /api/auth/accept-invitation` - Accept invite

### Contracts
- `GET /api/contracts` - List contracts (filtered)
- `POST /api/contracts` - Upload contract
- `GET /api/contracts/:id` - Get contract details
- `PATCH /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### AI & Extraction
- `POST /api/extraction/contracts/:id/extract` - Extract text
- `POST /api/ai/contracts/:id/extract` - AI field extraction
- `POST /api/ai/contracts/:id/risks` - Risk analysis

### Tasks
- `GET /api/tasks` - List tasks (filtered)
- `GET /api/tasks/upcoming` - Upcoming tasks (30 days)
- `GET /api/tasks/my-tasks` - My assigned tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Playbook & Compliance
- `GET /api/playbook/rules` - List rules
- `POST /api/playbook/rules` - Create rule (Admin)
- `POST /api/playbook/contracts/:id/check` - Run compliance check
- `GET /api/playbook/contracts/:id/result` - Get compliance result

### Chat
- `POST /api/chat/contracts/:id/ask` - Ask question
- `GET /api/chat/contracts/:id/history` - Chat history

### Comments & Collaboration
- `GET /api/comments/contracts/:id` - Get comments
- `POST /api/comments/contracts/:id` - Add comment
- `GET /api/audit-logs/contracts/:id` - Activity timeline

### Search & Reporting
- `GET /api/search/advanced` - Advanced search
- `GET /api/reports/export/contracts` - Export contracts CSV
- `GET /api/reports/export/tasks` - Export tasks CSV
- `GET /api/reports/pdf/status` - Status report PDF
- `GET /api/reports/pdf/risk` - Risk report PDF
- `GET /api/reports/pdf/compliance` - Compliance report PDF

### Notifications & Metrics
- `GET /api/notifications` - List notifications
- `GET /api/metrics/admin` - Admin metrics (Admin only)

---

## 👥 User Roles

### Admin
- Full access to all features
- Manage organization settings
- Invite/remove team members
- Create playbook rules
- View admin dashboard

### Legal
- View and edit contracts
- Run AI extractions
- Add comments and tasks
- Access all review features

### Viewer
- View contracts (read-only)
- View tasks and calendar
- Cannot edit or delete

---

## 🔄 Typical Workflow

1. **Admin** creates organization and invites team
2. **Legal** uploads contract (PDF/DOCX)
3. **System** extracts text automatically
4. **AI** extracts parties, dates, amounts, clauses
5. **System** auto-generates tasks for deadlines
6. **System** runs compliance check against playbook
7. **System** calculates risk score
8. **Legal** reviews extracted data, edits if needed
9. **Team** collaborates via comments
10. **Legal** asks questions via AI chat
11. **Calendar** shows all upcoming deadlines
12. **Notifications** alert about due tasks
13. **Admin** exports reports for leadership

---

## 📊 Rate Limits

To protect the API and manage costs:

- **General API:** 100 requests/15 minutes
- **Authentication:** 5 attempts/15 minutes  
- **AI Operations:** 20 requests/hour
- **File Uploads:** 50/hour

---

## 🧪 Testing

Start both backend and frontend in dev mode:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Test features:
1. Create account → verify OTP
2. Upload sample PDF contract
3. Run text extraction
4. Run AI extraction
5. View extracted fields
6. Check compliance
7. View tasks on calendar
8. Ask AI questions
9. Add comments
10. Generate reports

---

## 📦 Dependencies

### Backend
- Express, Mongoose, TypeScript
- @google/generative-ai (Gemini)
- Cloudinary, Multer
- pdf-parse, mammoth, tesseract.js
- jsonwebtoken, bcryptjs
- node-cron, express-rate-limit
- json2csv, pdfkit

### Frontend
- React 18, TypeScript
- Redux Toolkit, React Router
- Tailwind CSS
- @fullcalendar/react
- Axios

---

## 🚀 Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

**Quick Deploy:**
1. Backend → Render or Docker
2. Frontend → Vercel
3. Database → MongoDB Atlas
4. Configure environment variables
5. Test `/health` endpoint

---

## 📝 License

MIT

---

## 🤝 Contributing

This is a complete, production-ready implementation. For enhancements:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📧 Support

For questions or issues, refer to:
- `DEPLOYMENT.md` - Deployment instructions
- `IMPLEMENTATION_SUMMARY.md` - Feature details
- Backend logs for API issues
- Browser console for frontend issues

---

**Built with ❤️ using TypeScript, React, Node.js, MongoDB, and Google Gemini AI**

Clause-IQ - Making contract review intelligent, collaborative, and efficient.

