# Health Report Analysis & Insight Engine

A comprehensive MERN stack application that transforms health reports into actionable insights through automated analysis and visualization.

## Features

### Backend (Node.js/Express)
- **Google OAuth Authentication** - Secure login with Google accounts
- **File Upload & Parsing** - Support for PDF, CSV, and JSON health reports
- **Rules-Based Analysis Engine** - Medical insights using json-rules-engine
- **MongoDB Integration** - Flexible schema for health data storage
- **RESTful API** - Complete API for frontend integration

### Frontend (React)
- **Modern React Application** - Built with hooks and context
- **Interactive Dashboard** - Health overview with key metrics
- **Data Visualization** - Trend charts using Recharts
- **Responsive Design** - Tailwind CSS with custom design system
- **File Upload Interface** - Drag-and-drop report uploads

### Key Capabilities
- **Multi-Format Support** - Parse PDF, CSV, and JSON health reports
- **Biomarker Analysis** - Automated interpretation against medical standards
- **Trend Tracking** - Historical biomarker visualization
- **Personalized Recommendations** - Age and sex-specific insights
- **Secure Data Storage** - Encrypted health information

## Project Structure

\`\`\`
health-report-analyzer/
├── backend/
│   ├── config/
│   │   └── passport.js          # Google OAuth configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── HealthReport.js      # Health report schema
│   │   └── BiomarkerRule.js     # Analysis rules schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── reports.js           # Report management routes
│   │   └── users.js             # User profile routes
│   ├── services/
│   │   ├── reportParser.js      # File parsing logic
│   │   └── rulesEngine.js       # Analysis engine
│   ├── scripts/
│   │   └── seedDatabase.js      # Database seeding
│   └── server.js                # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BiomarkerTrendChart.js
│   │   │   ├── CurrentStatusPanel.js
│   │   │   ├── RecommendationsList.js
│   │   │   ├── ReportUploadModal.js
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── DashboardPage.js
│   │   │   ├── ReportsPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── ...
│   │   └── App.js
│   └── package.json
└── README.md
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console project for OAuth

### Backend Setup

1. **Install Dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Configure the following variables:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/health-reports
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret_key
   CLIENT_URL=http://localhost:3000
   PORT=5000
   \`\`\`

3. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`

4. **Database Setup**
   \`\`\`bash
   # Seed the database with biomarker rules
   npm run seed
   \`\`\`

5. **Start Backend Server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. **Install Dependencies**
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. **Start Development Server**
   \`\`\`bash
   npm start
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### Getting Started
1. **Sign In** - Use Google OAuth to authenticate
2. **Complete Profile** - Add date of birth and sex for personalized analysis
3. **Upload Report** - Drag and drop your health report (PDF, CSV, or JSON)
4. **View Insights** - Get automated analysis and recommendations
5. **Track Trends** - Monitor biomarker changes over time

### Supported File Formats

**PDF Reports**
- Lab reports with tabular biomarker data
- Automatic text extraction and parsing

**CSV Files**
- Columns: biomarker, value, unit, reference_range
- Headers: test_name, result, units, normal_range

**JSON Files**
\`\`\`json
{
  "biomarkers": [
    {
      "name": "Total Cholesterol",
      "value": 195,
      "unit": "mg/dL",
      "referenceRange": "100-199"
    }
  ]
}
\`\`\`

### Analysis Rules

The system includes pre-configured rules for:
- **Lipid Panel** - Cholesterol, LDL, HDL, Triglycerides
- **Glucose Metabolism** - Fasting glucose, HbA1c
- **Thyroid Function** - TSH, Free T4
- **Age/Sex Specific** - Different ranges for demographics

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication middleware
- **json-rules-engine** - Business rules engine
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **csv-parse** - CSV parsing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Tailwind CSS** - Utility-first CSS
- **React Dropzone** - File upload component
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/status` - Check auth status

### Reports
- `POST /api/reports/upload` - Upload health report
- `GET /api/reports` - Get user's reports
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/trends/:biomarker` - Get biomarker trends
- `POST /api/reports/:id/notes` - Add user note

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
