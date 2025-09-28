# 📝 CloudNotes-Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)

> A modern full-stack note-taking application with secure authentication, OTP verification, Google OAuth, and real-time note management capabilities.

## 📋 Table of Contents

- **[🌟 Features](#-features)**
- **[🏗️ Architecture](#️-architecture)**
- **[📁 Project Structure](#-project-structure)**
- **[🚀 Quick Start](#-quick-start)**
- **[📚 API Documentation](#-api-documentation)**
- **[🔒 Security Features](#-security-features)**
- **[🎨 UI/UX Features](#-uiux-features)**
- **[🚀 Deployment](#-deployment)**
- **[🐛 Troubleshooting](#-troubleshooting)**
- **[🤝 Contributing](#-contributing)**
- **[👤 Author](#-author)**
- **[📄 License](#-license)**

## 🌟 Features

### 🔐 Authentication & Security
- **Email + OTP Verification** with 6-digit secure codes
- **Google OAuth Integration** for seamless sign-in
- **JWT Authentication** with HttpOnly cookies
- **Password Security** with bcrypt hashing
- **Protected Routes** with middleware validation
- **Form Validation** with real-time feedback

### 📝 Note Management
- **Create Notes** with modal interface
- **View Notes** in organized dashboard layout
- **Edit Notes** with inline editing capabilities
- **Delete Notes** with confirmation
- **User-Specific** note storage and management
- **Real-time Updates** with instant synchronization

### 🎨 Modern UI/UX
- **Responsive Design** with mobile-first approach
- **Interactive Components** and smooth animations
- **Loading States** and error handling
- **Custom 404 Pages** for better user experience
- **Responsive Logo** positioning for all devices
- **Form Validation** with helpful error messages

### 🔧 Technical Features
- **TypeScript** for type safety
- **Vite** for fast development and building
- **MongoDB** with Mongoose ODM
- **Express.js** with middleware support
- **Nodemailer** for email services
- **Passport.js** for OAuth integration

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Vite, React Router
- **Backend**: Express.js with MongoDB and Mongoose
- **Authentication**: JWT with HttpOnly cookies, Google OAuth
- **Email Service**: Nodemailer for OTP delivery
- **Security**: CORS, Helmet, Input validation, Rate limiting

## 📁 Project Structure

```
CloudNotes-Platform/
├── client/                       # React Frontend
│   ├── public/                   # Static assets
│   │   └── images/               # Logo and illustrations
│   └── src/
│       ├── components/           # Reusable UI components
│       ├── pages/                # Page components
│       ├── lib/                  # API client and utilities
│       └── styles.css            # Global styles
│
├── server/                       # Express Backend
│   ├── src/
│   │   ├── config/               # Database and environment config
│   │   ├── middleware/           # Authentication middleware
│   │   ├── models/               # MongoDB schemas
│   │   ├── routes/               # API route handlers
│   │   └── utils/                # Helper functions
│   └── dist/                     # Compiled JavaScript
│
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1) Clone and Setup
```bash
git clone https://github.com/Kush-Varshney/CloudNotes.git
cd CloudNotes
```

### 2) Backend Setup
```bash
cd  server
npm install
cp  .env  # Edit with your values
npm run dev
```

### 3) Frontend Setup
```bash
cd  client
npm install
npm run dev
```

### 4) Environment Variables

**Server (.env):**
```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/cloudnotes
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_ORIGIN=http://localhost:5173

# Optional SMTP (if set, emails are sent; otherwise OTP is returned in dev responses)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="CloudNotes <no-reply@cloudnotes.app>"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Client (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001
```

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/auth/me

## 📚 API Documentation

### Authentication
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/signup/start` | `{ name, dob, email }` | Start signup with OTP |
| POST | `/auth/signup/verify` | `{ email, otp }` | Verify OTP and complete signup |
| POST | `/auth/login/start` | `{ email, keepSignedIn }` | Start login with OTP |
| POST | `/auth/login/verify` | `{ email, otp }` | Verify OTP and complete login |
| POST | `/auth/logout` | - | User logout |
| GET | `/auth/me` | - | Get current user |
| GET | `/auth/google` | - | Google OAuth login |
| GET | `/auth/google/callback` | - | Google OAuth callback |

### Notes
| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/notes` | - | Get user notes |
| POST | `/notes` | `{ content }` | Create new note |
| PUT | `/notes/:id` | `{ content }` | Update note |
| DELETE | `/notes/:id` | - | Delete note |

**Authentication Required**: All routes except auth endpoints require `Authorization: Bearer <token>` header.

## 🔒 Security Features

- **JWT Authentication** with HttpOnly cookies
- **Password Hashing** using bcrypt with salt rounds
- **OTP Verification** with expiration and attempt limits
- **Input Validation** with comprehensive schemas
- **CORS Protection** for controlled cross-origin requests
- **Security Headers** with Helmet.js
- **Rate Limiting** to prevent API abuse
- **Google OAuth** with secure callback handling

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-First** approach with desktop enhancements
- **Adaptive Logo** positioning for different screen sizes
- **Flexible Layout** that works on all devices
- **Touch-Friendly** interface for mobile users

### User Experience
- **Loading States** with smooth transitions
- **Error Handling** with clear, actionable messages
- **Form Validation** with real-time feedback
- **Custom 404 Pages** for better navigation
- **Smooth Animations** and transitions

### Design System
- **Color Palette**: Primary blue, neutral grays, accent colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing system
- **Components**: Reusable, accessible components

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Use PM2 for process management
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure MongoDB Atlas for production

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API base URL for production
4. Configure environment variables

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudnotes
JWT_SECRET=your-production-secret-key
PORT=3001
CLIENT_ORIGIN=https://your-frontend-domain.com
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 🐛 Troubleshooting

### Common Issues

**1. Google OAuth Not Working**
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Verify callback URLs in Google Cloud Console:
  - Development: `http://localhost:3001/auth/google/callback`
  - Production: `https://your-backend-domain.com/auth/google/callback`
- Check `CLIENT_ORIGIN` matches your frontend URL

**2. OTP Not Received**
- Check SMTP configuration in environment variables
- In development mode, OTP is returned in API response
- Verify email address format and SMTP credentials

**3. Database Connection Issues**
- Verify MongoDB is running locally or Atlas connection string
- Check `MONGO_URI` in environment variables
- Ensure network connectivity and firewall settings

**4. CORS Errors**
- Ensure `CLIENT_ORIGIN` in server .env matches your frontend URL
- Check CORS configuration in server setup

**5. Authentication Issues**
- Verify JWT secret is set correctly
- Check token expiration settings
- Ensure Authorization header is included in requests

### Debug Steps
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test API endpoints with Postman or curl
4. Check browser console for frontend errors
5. Verify database connection and data integrity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add proper error handling and validation
- Update documentation for new features
- Test thoroughly before submitting PR
- Use meaningful commit messages

## 🎯 Roadmap

- [ ] Real-time note synchronization
- [ ] Note sharing and collaboration
- [ ] Rich text editor with formatting
- [ ] Note categories and tags
- [ ] Export functionality (PDF, Markdown)
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Note templates
- [ ] Offline support with sync
- [ ] Note encryption for sensitive content

## 👤 Author

**Kush Varshney**  
B.Tech CSE | Full Stack Developer  
[Portfolio](https://kushvarshney.vercel.app/) • [GitHub](https://github.com/Kush-Varshney/) • [LinkedIn](https://www.linkedin.com/in/kush-varshney-490baa250/)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Note**: This is a demo application for educational purposes. For production use, ensure proper security audits and compliance measures.
