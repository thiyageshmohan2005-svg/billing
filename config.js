/**
 * CONFIGURATION FILE FOR BILLPRO
 * Update this file with your Google OAuth 2.0 credentials
 */

const CONFIG = {
    // Google OAuth 2.0 Configuration
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    
    // Application Settings
    APP_NAME: 'Sabari Cakes and Cafe',
    APP_PHONE: '8220347161',
    APP_VERSION: '2.0.0',
    
    // Authentication Settings
    SESSION_TIMEOUT: 3600, // 1 hour in seconds
    AUTO_LOGOUT: true,
    
    // Feature Flags
    ENABLE_GOOGLE_AUTH: true,
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
