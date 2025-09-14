# 🔐 BlueMe Authentication System

## Overview

The BlueMe authentication system has been designed to be **completely non-intrusive** to existing functionality. Users can continue to use the app as guests, while authenticated users get additional features and data persistence.

## ✨ Key Features

### 🔒 Security
- **JWT-based authentication** with 30-day token expiration
- **Bcrypt password hashing** with 12 salt rounds
- **Rate limiting** on authentication endpoints (5 attempts per 15 minutes)
- **Row Level Security (RLS)** policies in Supabase
- **Input validation** and sanitization
- **CORS protection** with proper headers

### 🎯 User Experience
- **Optional authentication** - app works without login
- **Guest mode** preserved for all existing functionality
- **Progressive enhancement** - authentication unlocks additional features
- **Beautiful, modern UI** that matches the app's design
- **Responsive design** for mobile and desktop
- **Accessibility features** with proper focus management

### 🚀 Functionality
- **User registration** with email and optional username
- **Secure login** with email/password
- **Profile management** with username updates
- **Password change** functionality
- **Account deletion** with confirmation
- **Authentication status** checking
- **Automatic token refresh** handling

## 📁 File Structure

```
Blueme/
├── middleware/
│   └── auth.js                 # Authentication middleware
├── routes/
│   └── auth.js                 # Authentication API routes
├── public/
│   ├── js/
│   │   └── auth.js             # Frontend authentication logic
│   └── css/
│       └── auth.css            # Authentication UI styles
├── database/
│   └── auth-schema-update.sql  # Database schema updates
├── setup-auth.js               # Setup script
└── AUTHENTICATION.md           # This documentation
```

## 🛠️ Installation & Setup

### 1. Dependencies
The required dependencies are already installed:
```bash
npm install jsonwebtoken bcryptjs express-rate-limit
```

### 2. Environment Configuration
Run the setup script to configure authentication:
```bash
node setup-auth.js
```

This will:
- Create a `.env` file with a secure JWT secret
- Verify all authentication files are present
- Check dependencies are installed

### 3. Database Setup (Optional)
If using Supabase, run the schema update:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `database/auth-schema-update.sql`

### 4. Start the Server
```bash
npm start
```

## 🔧 API Endpoints

### Authentication Routes (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| DELETE | `/account` | Delete account | Yes |
| GET | `/status` | Check auth status | No |

### Example Usage

#### Register a new user:
```javascript
const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'securepassword',
        username: 'johndoe' // optional
    })
});
```

#### Login:
```javascript
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'securepassword'
    })
});
```

#### Authenticated request:
```javascript
const response = await fetch('/api/auth/profile', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

## 🎨 Frontend Integration

### Authentication Manager
The frontend uses a global `AuthManager` class accessible via `window.authManager`:

```javascript
// Check if user is authenticated
if (window.authManager.isAuthenticated) {
    console.log('User:', window.authManager.user);
}

// Login user
await window.authManager.login('user@example.com', 'password');

// Logout user
await window.authManager.logout();

// Get user profile
const profile = await window.authManager.getProfile();
```

### UI Components
- **Auth Button**: Top-right corner, shows "Guest" or username
- **Auth Modal**: Beautiful modal with login/register/profile forms
- **Notifications**: Toast notifications for success/error messages

### Making Authenticated Requests
The `AuthManager` automatically includes the JWT token in requests:

```javascript
// This automatically includes the Authorization header
const response = await window.authManager.apiRequest('/profile');
```

## 🔄 How It Works

### 1. Optional Authentication Middleware
Every request goes through `optionalAuth` middleware that:
- Checks for JWT token in Authorization header
- Validates token if present
- Adds user info to `req.user` if authenticated
- Sets `req.isAuthenticated` flag
- **Never blocks requests** - always allows them to proceed

### 2. Backend Integration
Existing endpoints automatically use authentication when available:
- Playlist creation uses authenticated user ID
- File uploads are associated with authenticated users
- Data is isolated per user when authenticated

### 3. Frontend Integration
- Authentication UI is completely separate from main app
- Guest functionality remains unchanged
- Authenticated users get enhanced features
- Token is stored in localStorage for persistence

## 🛡️ Security Considerations

### Password Security
- Passwords are hashed with bcrypt (12 salt rounds)
- Minimum 6 character requirement
- No password storage in plain text

### Token Security
- JWT tokens expire after 30 days
- Tokens are signed with a secure secret
- Tokens are validated on every request

### Rate Limiting
- Authentication endpoints are rate limited
- 5 attempts per 15 minutes per IP
- Prevents brute force attacks

### Database Security
- Row Level Security (RLS) policies
- Users can only access their own data
- Guest data is properly isolated

## 🧪 Testing

### Manual Testing
1. Start the server: `npm start`
2. Open the app in your browser
3. Click the auth button (top-right corner)
4. Try registering a new account
5. Test login/logout functionality
6. Verify guest mode still works

### API Testing
```bash
# Test auth status
curl http://localhost:3000/api/auth/status

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass","username":"testuser"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

## 🚀 Deployment

### Environment Variables
Ensure these are set in production:
```bash
JWT_SECRET=your_secure_jwt_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### Security Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] HTTPS enabled in production
- [ ] Environment variables secured

## 🔧 Customization

### Styling
Modify `public/css/auth.css` to customize the authentication UI:
- Colors and gradients
- Animations and transitions
- Layout and spacing
- Responsive breakpoints

### Functionality
Extend the authentication system by:
- Adding new user fields in the database
- Creating additional API endpoints
- Implementing social login (OAuth)
- Adding two-factor authentication

### Integration
The authentication system is designed to be easily integrated with:
- Existing user management systems
- Third-party authentication providers
- Custom user roles and permissions
- Premium subscription features

## 📞 Support

If you encounter any issues with the authentication system:

1. Check the browser console for JavaScript errors
2. Verify the server logs for backend errors
3. Ensure all dependencies are installed
4. Confirm the database schema is updated
5. Check environment variables are set correctly

The authentication system is designed to be robust and fail gracefully, so the main app functionality should never be affected by authentication issues.

## 🎉 Conclusion

The BlueMe authentication system provides a secure, user-friendly way to add user accounts to your application without affecting existing functionality. Users can continue to use the app as guests, while authenticated users get enhanced features and data persistence.

The system is production-ready with proper security measures, beautiful UI, and comprehensive error handling. It's designed to scale with your application and can be easily extended with additional features as needed.
