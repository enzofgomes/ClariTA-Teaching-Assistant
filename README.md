# ClariTA - AI-Powered Teaching Assistant

> Transform your learning experience with AI-generated quizzes from PDF lecture slides

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

## Overview

ClariTA is an innovative AI-powered teaching assistant that automatically generates interactive quizzes from PDF lecture slides. Built with modern web technologies, it provides educators and students with a seamless way to create, take, and review assessments.

### Key Features

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

## Project Structure

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

## API Endpoints

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

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables (Production)
```env
NODE_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
GEMINI_API_KEY=your_production_gemini_api_key
```

### Deployment Options
- **Vercel**: Recommended for full-stack deployment
- **Netlify**: Frontend deployment with serverless functions
- **Railway**: Full-stack deployment with database
- **Docker**: Containerized deployment

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

