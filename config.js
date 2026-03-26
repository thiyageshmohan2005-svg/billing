/**
 * CONFIGURATION FILE FOR BILLPRO
 * Update this file with your Google OAuth 2.0 and Twilio SMS credentials
 */

const CONFIG = {
    // Google OAuth 2.0 Configuration
    GOOGLE_CLIENT_ID: '539888137547-ma3pupkbg2v6vq2me22qpoerm2tue696.apps.googleusercontent.com',
    
    // Phone OTP / Twilio Configuration (for SMS verification)
    TWILIO_CONFIG: {
        ACCOUNT_SID: 'YOUR_TWILIO_ACCOUNT_SID',
        AUTH_TOKEN: 'YOUR_TWILIO_AUTH_TOKEN',
        VERIFY_SERVICE_ID: 'YOUR_TWILIO_VERIFY_SERVICE_ID',
        TWILIO_PHONE_NUMBER: 'YOUR_TWILIO_PHONE_NUMBER',
        IS_PRODUCTION: false  // Set to true when using real Twilio credentials
    },
    
    // Application Settings
    APP_NAME: 'Sabari Cakes and Cafe',
    APP_PHONE: '8220347161',
    APP_VERSION: '2.0.0',
    
    // Authentication Settings
    SESSION_TIMEOUT: 3600, // 1 hour in seconds
    AUTO_LOGOUT: true,
    OTP_EXPIRY_TIME: 600, // 10 minutes in seconds
    MAX_OTP_ATTEMPTS: 3,
    
    // Feature Flags
    ENABLE_GOOGLE_AUTH: true,
    ENABLE_PHONE_OTP_AUTH: true,
    ENABLE_DEMO_LOGIN: true,
    ENABLE_AUTO_LOGIN: true,
    
    // Data Settings
    ENABLE_AUTO_SAVE: true,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
};

// Initialize authentication service with client ID
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth service with proper client ID
    const auth = initializeAuthService(CONFIG.GOOGLE_CLIENT_ID);
    
    // Store config globally
    window.APP_CONFIG = CONFIG;
});
