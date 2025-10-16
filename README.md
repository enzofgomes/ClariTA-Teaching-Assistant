# 🦊 ClariTA - AI-Powered Teaching Assistant

> Transform your learning experience with AI-generated quizzes from PDF lecture slides

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

## 📖 Overview

ClariTA is an innovative AI-powered teaching assistant that automatically generates interactive quizzes from PDF lecture slides. Built with modern web technologies, it provides educators and students with a seamless way to create, take, and review assessments.

### ✨ Key Features

- **PDF Upload & Processing**: Upload lecture slides and extract content automatically
- **AI Quiz Generation**: Generate multiple question types (MCQ, True/False, Fill-in-the-blank)
- **Interactive Dashboard**: Track progress, view statistics, and manage quizzes
- **Customizable Quizzes**: Configure question count and types
- **Performance Analytics**: Detailed results and explanations
- **Secure Authentication**: User accounts with Supabase integration
- **Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ClariTA-Teaching-Assistant.git
   cd ClariTA-Teaching-Assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight routing
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **UI Components**: Custom component library with shadcn/ui
- **Authentication**: Supabase Auth integration

### Backend (Node.js + TypeScript)
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth middleware
- **File Processing**: PDF parsing and text extraction
- **AI Integration**: Google Gemini API for quiz generation
- **Storage**: Supabase Storage for file management

### Database Schema
```sql
-- Users (managed by Supabase Auth)
-- Uploads table
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  page_count INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES uploads(id),
  name TEXT,
  folder TEXT,
  tags TEXT[],
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quiz_id UUID REFERENCES quizzes(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);
```

## Design System

### Color Palette
- **Primary Orange**: `#de8318` - Main brand color
- **Secondary Orange**: `#dc5817` - Accent color  
- **Dark Brown**: `#6b2d16` - Text and contrast
- **Cream**: `#f5e2aa` - Background gradient
- **Light Cream**: `#fef7e0` - Background gradient

### Typography
- **Headings**: Bold, large sizes with orange accents
- **Body Text**: Clean, readable fonts with proper contrast
- **Interactive Elements**: Clear call-to-action styling

### Components
- **Glassmorphism Cards**: Semi-transparent with backdrop blur
- **Hover Effects**: Smooth transitions and elevation changes
- **Responsive Grid**: Adaptive layouts for all screen sizes

## 📁 Project Structure

```
ClariTA-Teaching-Assistant/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # Base UI components (shadcn/ui)
│   │   │   ├── AuthForm.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   └── ...
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/          # Utility libraries
│   │   └── types/        # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Express middleware
│   └── index.ts         # Server entry point
├── shared/               # Shared code between client/server
│   └── schema.ts        # Database schema definitions
├── migrations/           # Database migration files
└── public/              # Static assets
    └── assets/
        └── images/
            └── fox-logo.png
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### File Management
- `POST /api/upload` - Upload PDF file
- `GET /api/user/uploads` - Get user's uploads
- `DELETE /api/uploads/:id` - Delete upload

### Quiz Management
- `POST /api/quizzes` - Generate new quiz
- `GET /api/user/quizzes` - Get user's quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `PATCH /api/quizzes/:id` - Update quiz metadata
- `DELETE /api/quizzes/:id` - Delete quiz

### Quiz Attempts
- `POST /api/quiz-attempts` - Submit quiz attempt
- `GET /api/quiz-attempts/:id` - Get attempt results
- `GET /api/quizzes/:id/latest-attempt` - Get latest attempt

### Statistics
- `GET /api/user/statistics` - Get user performance stats

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing

## 🚀 Deployment

### Deploying to Render (Recommended)

ClariTA is configured for easy deployment on Render. Follow these steps:

#### 1. Prerequisites
- GitHub repository with your code
- Supabase project (for database and auth)
- Google Gemini API key

#### 2. Deploy to Render

**Option A: Using the Dashboard (Recommended)**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

3. **Configure Environment Variables**
   In the Render dashboard, add these environment variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will automatically build and deploy your app
   - Your app will be live at: `https://your-app-name.onrender.com`

**Option B: Using Render Blueprint (render.yaml)**

1. The `render.yaml` file is already configured in your project root
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **"New +"** → **"Blueprint"**
4. Connect your repository
5. Render will use the `render.yaml` configuration automatically

#### 3. Post-Deployment Setup

**Update Supabase Redirect URLs**
1. Go to your Supabase project: **Authentication** → **URL Configuration**
2. Add your Render URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-app-name.onrender.com
   ```

**Update CORS Settings (if needed)**
1. In Supabase, go to **Settings** → **API**
2. Ensure your Render URL is allowed in CORS settings

#### 4. Monitoring & Logs

- **View Logs**: Render Dashboard → Your Service → Logs
- **Health Checks**: Render automatically monitors your app's health
- **Auto-Deploy**: Enable auto-deploy for automatic updates on git push

---

### Local Production Build

To test the production build locally before deploying:

```bash
# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export SUPABASE_URL=your_supabase_url
export SUPABASE_ANON_KEY=your_supabase_anon_key
export SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
export GEMINI_API_KEY=your_gemini_api_key

# Start the production server
npm start
```

---

### Alternative Deployment Options

| Platform | Best For | Setup Difficulty | Cost |
|----------|----------|------------------|------|
| **Render** | Full-stack apps (Recommended) | ⭐ Easy | Free tier available |
| **Railway** | Full-stack apps with DB | ⭐ Easy | $5 credits/month |
| **Fly.io** | Global deployment | ⭐⭐ Medium | Limited free tier |
| **DigitalOcean** | Production apps | ⭐⭐ Medium | Starting at $5/month |
| **AWS/GCP** | Enterprise scale | ⭐⭐⭐ Hard | Pay-as-you-go |

---

### Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NODE_ENV` | Environment mode | Set to `production` |
| `PORT` | Server port | Auto-set by Render (10000) |
| `SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Settings → API |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

---

### Troubleshooting Deployment

**Build Fails**
- Check that all dependencies are in `package.json` (not devDependencies if needed for build)
- Verify Node.js version (18+)
- Check build logs in Render dashboard

**App Won't Start**
- Verify all environment variables are set correctly
- Check that PORT is not hardcoded (use `process.env.PORT`)
- Review server logs in Render dashboard

**Database Connection Issues**
- Verify Supabase credentials are correct
- Check Supabase project is not paused
- Ensure IP whitelist includes Render IPs (usually 0.0.0.0/0 for Supabase)

**Authentication Not Working**
- Update Supabase redirect URLs to include your Render URL
- Clear browser cache and cookies
- Check CORS settings in Supabase

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure responsive design

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

**ClariTA Development Team**
- **Enzo** - BS Information Technology | FIU | First Time Hacker
- **Angelica** - [Role and background]
- **Fabianne** - [Role and background]  
- **Veronica** - [Role and background]

## Acknowledgments

- **Supabase** for authentication and database services
- **Google Gemini** for AI-powered quiz generation
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **React** and **TypeScript** communities for excellent tooling

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ClariTA-Teaching-Assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ClariTA-Teaching-Assistant/discussions)
- **Email**: support@clarita.app

## Roadmap

### Upcoming Features
- [ ] **Multi-language Support** - Support for multiple languages
- [ ] **Advanced Analytics** - Detailed performance insights
- [ ] **Quiz Sharing** - Share quizzes with other users
- [ ] **Mobile App** - Native mobile application
- [ ] **Integration APIs** - LMS and educational platform integrations
- [ ] **Advanced Question Types** - Drag-and-drop, matching, etc.
- [ ] **Collaborative Features** - Team workspaces and collaboration
- [ ] **AI Tutoring** - Personalized learning recommendations

---

