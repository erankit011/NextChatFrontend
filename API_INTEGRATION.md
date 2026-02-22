# NextChat - API Integration Guide

Complete documentation for frontend-backend integration in NextChat application.

## 📋 Overview

NextChat is a real-time chat application with user authentication, profile management, and room-based messaging built with React (frontend) and Express.js (backend).

---

## ✅ Setup Complete

### 1. Dependencies Installed

**Frontend:**
- `axios` - HTTP client for API calls
- `react-router-dom` - Routing and navigation
- `socket.io-client` - Real-time chat
- `react-toastify` - Notifications
- `emoji-picker-react` - Emoji support
- `lucide-react` - Icons

**Backend:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `cookie-parser` - Cookie handling
- `socket.io` - Real-time communication
- `nodemailer` - Email service

### 2. API Service (`src/services/api.js`)

Centralized API configuration with:
- Base URL: `http://localhost:8085/api`
- Automatic cookie handling (`withCredentials: true`)
- JWT token interceptor
- Global error handling (401 redirects)

### 3. Authentication Context (`src/context/AuthContext.jsx`)

Provides global auth state:
- `user` - Current user object
- `isAuthenticated` - Boolean auth status
- `loading` - Loading state
- `login(email, password)` - Login function
- `signup(userData)` - Signup function
- `logout()` - Logout function
- `updateUser(userData)` - Update user data

### 4. Custom Hooks

- `useAuth()` - Access auth context
- `useForm()` - Form state management

### 5. Pages Implemented

- **Login** (`pages/Login.jsx`) - Email/password login with validation
- **Signup** (`pages/Signup.jsx`) - User registration with validation
- **ForgotPassword** (`pages/ForgotPassword.jsx`) - Password reset request
- **ResetPassword** (`pages/ResetPassword.jsx`) - Password reset with token
- **Home** (`pages/Home.jsx`) - Room join interface
- **Chat** (`pages/Chat.jsx`) - Chat room wrapper
- **Profile** (`pages/Profile.jsx`) - User profile management

### 6. Components

- **ChatScreen** (`src/components/ChatScreen.jsx`) - Real-time chat interface
- **Button** (`src/components/common/Button.jsx`) - Reusable button
- **Input** (`src/components/common/Input.jsx`) - Reusable input field

### 7. Routing Setup

**Public Routes:**
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

**Protected Routes:**
- `/home` - Chat room join interface
- `/chat` - Chat room
- `/profile` - User profile

**Default:**
- `/` - Redirects to login

---

## 🔌 API Endpoints

### Authentication Endpoints

```javascript
// Signup (Create new user)
POST /api/users
Body: { username, email, password }
Response: { success: true, data: {...}, token: "..." }

// Login
POST /api/users/login
Body: { email, password }
Response: { success: true, data: {...}, token: "...", message: "Login successful" }

// Logout
POST /api/users/logout
Response: { success: true, message: "Logout successful" }

// Get current user
GET /api/users/me
Headers: Cookie: token=<jwt_token>
Response: { success: true, data: {...} }

// Forgot password
POST /api/users/forgot-password
Body: { email }
Response: { success: true, message: "Password reset link sent to email" }

// Reset password
POST /api/users/reset-password/:token
Body: { newPassword }
Response: { success: true, message: "Password reset successful" }
```

### User Management Endpoints

```javascript
// Get user by ID
GET /api/users/:id
Response: { success: true, data: {...} }

// Update user
PUT /api/users/:id
Body: { username?, email?, password? }
Response: { success: true, data: {...} }

// Delete user
DELETE /api/users/:id
Response: { success: true, message: "User deleted successfully" }
```

---

## 💻 Usage Examples

### 1. Authentication in Components

```javascript
import { useAuth } from '../src/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Making API Calls

```javascript
import { authAPI, userAPI } from '../src/services/api';

// Login
try {
  const response = await authAPI.login({ email, password });
  console.log('Logged in:', response.data);
} catch (error) {
  console.error('Login failed:', error.response?.data?.error);
}

// Update user
try {
  const response = await userAPI.updateUser(userId, { username: 'NewName' });
  console.log('Updated:', response.data);
} catch (error) {
  console.error('Update failed:', error);
}

// Forgot password
try {
  await authAPI.forgotPassword('user@example.com');
  console.log('Reset link sent');
} catch (error) {
  console.error('Failed:', error);
}
```

### 3. Protected Routes

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

### 4. Form Handling with Validation

```javascript
import { useForm } from '../src/hooks/useForm';
import { validateLoginForm } from '../src/utils/validators';

function LoginForm() {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      await authAPI.login(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 5. Real-time Chat with Socket.IO

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8085');

// Join room
socket.emit('joinRoom', { username, room });

// Send message
socket.emit('sendMessage', { message, room, author: username });

// Receive messages
socket.on('message', (data) => {
  console.log('New message:', data);
});

// Typing indicator
socket.emit('typing', { room, username });
socket.on('typing', (data) => {
  console.log(`${data.username} is typing...`);
});
```

---

## 🔐 Authentication Flow

### Signup Flow
1. User fills signup form (username, email, password)
2. Frontend validates input
3. POST request to `/api/users`
4. Backend hashes password with bcrypt (10 rounds)
5. User created in MongoDB
6. JWT token generated (5-hour expiration)
7. Token set as HTTP-only cookie
8. User redirected to `/home`
9. Toast notification: "Account created successfully!"

### Login Flow
1. User enters email and password
2. Frontend validates input
3. POST request to `/api/users/login`
4. Backend verifies credentials with bcrypt
5. JWT token generated and set as cookie
6. User data returned (without password)
7. AuthContext updated
8. User redirected to `/home`
9. Toast notification: "Login successful!"

### Logout Flow
1. User clicks logout button
2. Confirmation modal appears
3. POST request to `/api/users/logout`
4. Backend clears cookie
5. Frontend clears localStorage
6. AuthContext reset
7. User redirected to `/login`
8. Toast notification: "Logged out successfully"

### Forgot Password Flow
1. User enters email on forgot password page
2. POST request to `/api/users/forgot-password`
3. Backend generates reset token (15-minute expiration)
4. Email sent with reset link: `http://localhost:5173/reset-password?token=xyz`
5. Success message displayed in form
6. User clicks link in email
7. Reset password page opens with token
8. User enters new password
9. POST request to `/api/users/reset-password/:token`
10. Password updated in database
11. User redirected to login

### Profile Update Flow
1. User clicks "Edit Profile"
2. Fields become editable
3. User modifies username/password
4. If changing password, current password required
5. Current password verified via login API
6. Confirmation modal appears
7. PUT request to `/api/users/:id`
8. User data updated in database
9. AuthContext updated
10. Success message displayed

### Delete Account Flow
1. User clicks "Delete Account"
2. Password verification modal appears
3. User enters password
4. Password verified via login API
5. Confirmation modal appears
6. DELETE request to `/api/users/:id`
7. User deleted from database
8. User logged out
9. Redirected to signup page

---

## 🔒 Security Implementation

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Minimum length**: 6 characters
- **Validation**: Client and server-side
- **Storage**: Never stored in plain text

### JWT Tokens
- **Storage**: HTTP-only cookies (XSS protection)
- **Expiration**: 5 hours for auth tokens
- **Reset tokens**: 15 minutes expiration
- **Secrets**: Separate for auth and reset tokens

### Cookie Configuration
```javascript
{
  httpOnly: true,        // Prevents JavaScript access
  secure: false,         // Set to true in production (HTTPS)
  sameSite: 'strict',    // CSRF protection
  maxAge: 5 * 60 * 60 * 1000  // 5 hours
}
```

### Input Validation
- Email format validation
- Password strength requirements
- Username uniqueness check
- Sanitized inputs on backend

### CORS Protection
```javascript
cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
})
```

---

## 🌐 CORS Configuration

Backend CORS setup in `server/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📧 Email Service

### Configuration (Nodemailer with Gmail)

```javascript
// server/services/mail.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Gmail app password
  }
});
```

### Email Template (Password Reset)

```html
<p>Click the link below to reset your password:</p>
<a href="http://localhost:5173/reset-password?token=TOKEN">Reset Password</a>
<p>This link will expire in 15 minutes.</p>
```

---

## 🧪 Testing the Integration

### 1. Start Backend Server
```bash
cd server
node server.js
# Server running on http://localhost:8085
```

### 2. Start Frontend Dev Server
```bash
cd client
npm run dev
# Frontend running on http://localhost:5173
```

### 3. Test Authentication Flow
1. Navigate to `http://localhost:5173`
2. Click "Sign up" and create account
3. Login with credentials
4. Access home page (protected route)
5. Test profile update
6. Test password change
7. Test account deletion
8. Test forgot password flow
9. Logout

### 4. Test Chat Flow
1. Login to application
2. Generate or enter Room ID
3. Click "Join Room"
4. Send messages
5. Test emoji picker
6. Test typing indicator
7. Open same room in another browser
8. Test real-time messaging
9. Leave room

---

## 🐛 Common Issues & Solutions

### 1. CORS Errors
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
- Ensure backend has `credentials: true` in CORS config
- Check `withCredentials: true` in axios config
- Verify origin URLs match exactly

### 2. Cookie Not Set
**Problem**: Token cookie not appearing in browser

**Solution**:
- Check `httpOnly: true` in backend cookie options
- Verify `sameSite` setting matches environment
- In production, set `secure: true` (requires HTTPS)

### 3. 401 Unauthorized Errors
**Problem**: Protected routes return 401

**Solution**:
- Token might be expired (5 hours default)
- Clear cookies and localStorage
- Login again to get fresh token

### 4. Password Verification Fails
**Problem**: Correct password shows as incorrect

**Solution**:
- Ensure using `authAPI.login` not `userAPI.login`
- Check bcrypt comparison in backend
- Verify password hasn't been changed

### 5. Socket.IO Connection Issues
**Problem**: Real-time chat not working

**Solution**:
- Check Socket.IO server is running on port 8085
- Verify SOCKET_URL in ChatScreen.jsx
- Check browser console for connection errors

### 6. Email Not Sending
**Problem**: Password reset email not received

**Solution**:
- Verify Gmail credentials in `.env`
- Use Gmail App Password (not regular password)
- Check spam folder
- Verify email service is configured correctly

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=8085
MONGODB_URI=mongodb://0.0.0.0/ind-chatDB
JWT_SECRET=your_jwt_secret_here
JWT_RAW_SECRET=your_reset_token_secret_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Frontend (Optional `.env`)
```env
VITE_API_URL=http://localhost:8085/api
VITE_SOCKET_URL=http://localhost:8085
```

---

## 📊 API Response Format

### Success Response
```javascript
{
  success: true,
  data: { /* response data */ },
  message: "Operation successful" // optional
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

---

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Update API base URL to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder
4. Configure redirects for React Router

### Backend (Render/Heroku)
1. Set environment variables
2. Update CORS origins to production frontend URL
3. Set `secure: true` in cookie config (HTTPS)
4. Use MongoDB Atlas for database
5. Deploy with `node server.js`

### SSL Certificate
- Vercel/Netlify provide automatic HTTPS
- No manual SSL configuration needed
- Cookies will work with `secure: true`

---

## 📝 Notes

- JWT tokens expire after 5 hours
- Reset tokens expire after 15 minutes
- Passwords hashed with bcrypt (10 rounds)
- All API responses follow consistent format
- HTTP-only cookies prevent XSS attacks
- CORS configured for localhost:5173 and localhost:5174
- Profile page uses query params for navigation
- ChatScreen stores messages in localStorage (30-min expiration, max 100 messages)

---

## 👨‍💻 Developer

**Developed with ❤️ by ANKIT**

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅


