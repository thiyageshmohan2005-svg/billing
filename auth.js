// ==================== GOOGLE AUTHENTICATION SERVICE ==================== //

class AuthService {
    constructor(googleClientId) {
        this.googleClientId = googleClientId || 'YOUR_GOOGLE_CLIENT_ID_HERE';
        this.user = null;
        this.token = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Initialize Google Sign-In
        this.initializeGoogleSignIn();
    }

    initializeGoogleSignIn() {
        if (typeof google === 'undefined') {
            console.warn('Google SDK not loaded. Authentication may not work properly.');
            return;
        }

        google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: (response) => this.handleCredentialResponse(response),
            ux_mode: 'popup',
            auto_select: false
        });

        this.isInitialized = true;
    }

    handleCredentialResponse(response) {
        if (!response.credential) {
            console.error('No credential in response');
            return;
        }

        try {
            // Decode JWT token
            const decodedToken = this.decodeJWT(response.credential);
            
            // Verify token structure
            if (!decodedToken.email || !decodedToken.sub) {
                throw new Error('Invalid token structure');
            }

            // Store user data and token
            this.token = response.credential;
            this.user = {
                id: decodedToken.sub,
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                emailVerified: decodedToken.email_verified || false,
                authTime: new Date().toISOString(),
                expiresIn: 3600
            };

            // Save to localStorage
            this.saveSession();

            // Call login callback
            if (window.onGoogleAuthSuccess) {
                window.onGoogleAuthSuccess(this.user);
            }

            return this.user;
        } catch (error) {
            console.error('Error handling credential response:', error);
            throw error;
        }
    }

    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            throw new Error('Invalid JWT token');
        }
    }

    saveSession() {
        const sessionData = {
            user: this.user,
            token: this.token,
            timestamp: Date.now()
        };
        localStorage.setItem('googleAuthSession', JSON.stringify(sessionData));
    }

    loadSession() {
        try {
            const sessionData = localStorage.getItem('googleAuthSession');
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);
            
            // Check if session is still valid (1 hour expiry)
            const sessionAge = (Date.now() - session.timestamp) / 1000;
            if (sessionAge > 3600) {
                localStorage.removeItem('googleAuthSession');
                return null;
            }

            this.user = session.user;
            this.token = session.token;
            return session;
        } catch (error) {
            console.error('Error loading session:', error);
            localStorage.removeItem('googleAuthSession');
            return null;
        }
    }

    isAuthenticated() {
        // Check if user session exists
        if (this.user) return true;

        // Try to load from localStorage
        const session = this.loadSession();
        return !!session;
    }

    getCurrentUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    promptSignIn() {
        if (!this.isInitialized) {
            console.error('Google Sign-In not initialized');
            return;
        }
        
        google.accounts.id.prompt();
    }

    async logout() {
        try {
            // Revoke token if available
            if (this.token) {
                google.accounts.id.revoke(this.user.email, () => {
                    console.log('Token revoked');
                });
            }

            // Clear data
            this.user = null;
            this.token = null;
            localStorage.removeItem('googleAuthSession');

            // Call logout callback
            if (window.onGoogleAuthLogout) {
                window.onGoogleAuthLogout();
            }

            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }

    verifyToken() {
        if (!this.token) {
            return false;
        }

        try {
            const decodedToken = this.decodeJWT(this.token);
            const expiryTime = decodedToken.exp * 1000;
            const currentTime = Date.now();

            if (expiryTime < currentTime) {
                // Token expired
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    }

    getSession() {
        return {
            isAuthenticated: this.isAuthenticated(),
            user: this.user,
            token: this.token
        };
    }

    setCustomClientId(clientId) {
        this.googleClientId = clientId;
        this.initializeGoogleSignIn();
    }
}

// Initialize service globally
let authService;

function initializeAuthService(clientId) {
    authService = new AuthService(clientId);
    return authService;
}

function getAuthService() {
    if (!authService) {
        authService = new AuthService();
    }
    return authService;
}
