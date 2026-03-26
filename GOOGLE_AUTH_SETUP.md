# 🔐 Google Authentication Setup Guide

## Overview
BillPro now includes enterprise-grade Google OAuth 2.0 authentication. This guide will help you set up proper Google authentication for your billing system.

## What's Included

### Authentication Service (`auth.js`)
- **Proper OAuth 2.0 Flow**: Implements the complete Google Sign-In protocol
- **Token Management**: Secure token handling and verification
- **Session Management**: Automatic session persistence with 1-hour expiry
- **Error Handling**: Comprehensive error handling and user feedback
- **Token Revocation**: Secure logout with token revocation

### Configuration System (`config.js`)
- Centralized configuration management
- Easy Google Client ID setup
- Feature flags for authentication options
- Session timeout controls

## Step-by-Step Setup

### Step 1: Create Google OAuth 2.0 Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "NEW PROJECT"
   - Name it: "BillPro" or your business name
   - Click "CREATE"

3. **Wait for Project Creation**
   - Google will create your project (takes 1-2 minutes)
   - You'll see a notification when done

4. **Enable Google+ API**
   - In the sidebar, click "APIs & Services"
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click on it and click "ENABLE"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application" as application type
   - Add authorized redirect URIs:
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     http://localhost:8000
     http://127.0.0.1:8000
     file:///
     ```
   - If you have a domain, add:
     ```
     https://yourdomain.com
     https://www.yourdomain.com
     ```
   - Click "CREATE"

6. **Copy Your Client ID**
   - A dialog will show your Client ID and Secret
   - Copy the **Client ID** (keep it safe)
   - You don't need the Client Secret for frontend

### Step 2: Add Client ID to Config

1. **Open `config.js`**
   ```
   c:\Users\thiya\OneDrive\Desktop\billing software\config.js
   ```

2. **Replace this line:**
   ```javascript
   GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
   ```

3. **With your actual Client ID:**
   ```javascript
   GOOGLE_CLIENT_ID: '123456789-abc123def456ghi789.apps.googleusercontent.com',
   ```

4. **Save the file**

### Step 3: Test the Setup

1. **Open your billing app** in a web browser
2. **You should see:**
   - Login screen with "Sign in with Google" button
   - "Demo Login" button for testing without Google
   
3. **Test Google Login:**
   - Click "Sign in with Google"
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - You'll be authenticated and redirected back

4. **Test Demo Login:**
   - Click "Demo Login"
   - You'll be logged in with a demo account (no Google needed)

## Features

### ✅ Security Features
- **JWT Token Verification**: All tokens are validated and verified
- **Session Expiry**: Sessions automatically expire after 1 hour
- **Secure Logout**: Tokens are revoked on logout
- **Email Verification**: Confirmed user email from Google
- **Session Persistence**: Secure localStorage management

### ✅ User Experience
- **One-Click Login**: Click button, authenticate, done
- **Auto-Login**: Users stay logged in across sessions
- **Graceful Logout**: Clean logout with confirmation
- **Error Messages**: Clear error handling and user feedback
- **User Display**: User name and email shown in sidebar

### ✅ Developer Features
- **Centralized Config**: Easy to update credentials
- **Modular Code**: `auth.js` can be used in other projects
- **Error Logging**: Console logging for debugging
- **Feature Flags**: Enable/disable authentication features
- **Callback Hooks**: Global callbacks for auth events

## Authentication Flow

### Login Flow
```
1. User opens app
   ↓
2. Check if already authenticated
   ↓
3. If not:
   - Show login screen with:
     * Google Sign-In button
     * Demo Login button
   ↓
4. User clicks Google button
   ↓
5. Google OAuth verification
   ↓
6. Token validation
   ↓
7. User info extracted
   ↓
8. Session saved to localStorage
   ↓
9. App loads with user info
```

### Session Flow
```
1. User loads app
   ↓
2. Check localStorage for session
   ↓
3. If session exists:
   - Check if less than 1 hour old
   - If valid: Load app directly
   - If expired: Show login screen
   ↓
4. If no session: Show login screen
```

### Logout Flow
```
1. User clicks Logout button
   ↓
2. Confirm logout
   ↓
3. Revoke token with Google
   ↓
4. Clear localStorage session
   ↓
5. Reset authentication state
   ↓
6. Reload page to show login screen
```

## API Reference

### AuthService Methods

```javascript
// Initialize with custom Client ID
const auth = new AuthService('YOUR_CLIENT_ID');

// Check if user is authenticated
const isLoggedIn = auth.isAuthenticated();

// Get current user
const user = auth.getCurrentUser();
// Returns: {
//   id: 'unique-user-id',
//   email: 'user@example.com',
//   name: 'User Name',
//   picture: 'profile-image-url',
//   emailVerified: true,
//   authTime: '2024-01-01T12:00:00Z'
// }

// Get authentication token
const token = auth.getToken();

// Get full session info
const session = auth.getSession();
// Returns: {
//   isAuthenticated: true,
//   user: {...},
//   token: 'jwt-token-string'
// }

// Verify token validity
const isValid = auth.verifyToken();

// Logout
await auth.logout();

// Manual prompt for sign-in
auth.promptSignIn();

// Set custom Client ID (if needed)
auth.setCustomClientId('new-client-id');
```

## Troubleshooting

### Issue: "Google SDK not loaded"
- **Solution**: Make sure Google's script tag is in the HTML header
- Check: `<script src="https://accounts.google.com/gsi/client" async defer></script>`

### Issue: "ClientID is not set"
- **Solution**: Update `config.js` with your actual Google Client ID
- Check: Don't use placeholder text

### Issue: "Invalid redirect URI"
- **Solution**: Add the URI where your app is hosted to Google Cloud Console
- Go to: APIs & Services → Credentials → OAuth 2.0 Client ID
- Add your current URL to authorized URIs

### Issue: Session expires immediately
- **Solution**: Check that your system clock is correct
- Google tokens use timestamp validation

### Issue: "CORS error" or API errors
- **Solution**: This usually means your Client ID is incorrect or your app is in an unauthorized location
- Verify:
  1. Client ID is correct in `config.js`
  2. Your current URL is in Google's authorized URIs

## Demo Mode

If you want to use the app without Google authentication:

1. **Keep Demo Login enabled** in `config.js`:
   ```javascript
   ENABLE_DEMO_LOGIN: true,
   ```

2. **Click "Demo Login"** on the login screen
3. **Use the app normally** - Demo login creates a session identical to Google login

## Security Best Practices

1. **Never commit your Client Secret** to git (it's not needed anyway)
2. **Keep your Client ID in `config.js`** for easy updates
3. **Users' data is stored only in their browser** in localStorage
4. **Sessions expire after 1 hour** for security
5. **Always use HTTPS** in production for authentication

## Production Deployment

When deploying to production:

1. **Update Google credentials for production domain**
2. **Add production URL to authorized URIs** in Google Cloud Console
3. **Update `config.js`** with production settings
4. **Test login flow** before going live
5. **Monitor authentication logs** for errors

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [JWT Token Verification](https://tools.ietf.org/html/rfc7519)

## Support

For issues with authentication:
1. Check the browser console for error messages (`F12`)
2. Verify your Google Client ID in `config.js`
3. Ensure your current URL is in Google's authorized URIs
4. Try Demo Login to test the app independently

---

**Your billing system is now secured with enterprise-grade Google authentication!** 🔐
