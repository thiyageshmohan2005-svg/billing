// ==================== PHONE OTP VERIFICATION SERVICE ==================== //

class PhoneOTPService {
    constructor(config = {}) {
        this.accountSid = config.accountSid || 'YOUR_TWILIO_ACCOUNT_SID';
        this.authToken = config.authToken || 'YOUR_TWILIO_AUTH_TOKEN';
        this.verifyServiceId = config.verifyServiceId || 'YOUR_TWILIO_VERIFY_SERVICE_ID';
        this.twilioPhoneNumber = config.twilioPhoneNumber || '';
        this.isProduction = config.isProduction || false;
        this.otpStore = {}; // Temporary OTP storage for demo
        this.sessionTimeout = 600000; // 10 minutes
    }

    /**
     * Send OTP to phone number
     * @param {string} phoneNumber - Phone number in E.164 format (+919876543210)
     * @returns {Promise} - Result of OTP send
     */
    async sendOTP(phoneNumber) {
        // Validate phone number
        if (!this.validatePhoneNumber(phoneNumber)) {
            throw new Error('Invalid phone number format. Use format: +919876543210');
        }

        try {
            if (this.isProduction) {
                // Production: Use Twilio API
                return await this.sendOTPTwilio(phoneNumber);
            } else {
                // Demo mode: Generate and store OTP locally
                return this.generateDemoOTP(phoneNumber);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    }

    /**
     * Send OTP via Twilio Verify API
     */
    async sendOTPTwilio(phoneNumber) {
        try {
            const response = await fetch(
                `https://verify.twilio.com/v2/Services/${this.verifyServiceId}/Verifications`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(this.accountSid + ':' + this.authToken),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `To=${phoneNumber}&Channel=sms`,
                }
            );

            if (!response.ok) {
                throw new Error('Failed to send OTP via Twilio');
            }

            const data = await response.json();
            
            // Store session info
            sessionStorage.setItem('otpPhoneNumber', phoneNumber);
            sessionStorage.setItem('otpSessionSid', data.sid);
            sessionStorage.setItem('otpSessionTime', Date.now().toString());

            return {
                success: true,
                message: `OTP sent to ${phoneNumber}`,
                sid: data.sid
            };
        } catch (error) {
            console.error('Twilio OTP Error:', error);
            throw error;
        }
    }

    /**
     * Generate demo OTP for testing (no real SMS sent)
     */
    generateDemoOTP(phoneNumber) {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with expiry
        const expiryTime = Date.now() + this.sessionTimeout;
        this.otpStore[phoneNumber] = {
            otp: otp,
            expiryTime: expiryTime,
            attempts: 0
        };

        // Store in session
        sessionStorage.setItem('otpPhoneNumber', phoneNumber);
        sessionStorage.setItem('otpSessionTime', Date.now().toString());

        // Log OTP (for development only)
        console.log(`📱 Demo OTP for ${phoneNumber}: ${otp}`);
        console.log(`⏱️ This OTP will expire in 10 minutes`);

        return {
            success: true,
            message: `Demo OTP sent to ${phoneNumber}. Check console for OTP (for testing only).`,
            otp: otp, // Return in demo mode for testing
            phoneNumber: phoneNumber
        };
    }

    /**
     * Verify OTP code
     * @param {string} phoneNumber - Phone number that received OTP
     * @param {string} otpCode - 6-digit OTP code from user
     * @returns {Promise} - Verification result
     */
    async verifyOTP(phoneNumber, otpCode) {
        if (!phoneNumber || !otpCode) {
            throw new Error('Phone number and OTP code are required');
        }

        try {
            if (this.isProduction) {
                // Production: Use Twilio API
                return await this.verifyOTPTwilio(phoneNumber, otpCode);
            } else {
                // Demo mode: Verify locally
                return this.verifyDemoOTP(phoneNumber, otpCode);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }

    /**
     * Verify OTP via Twilio Verify API
     */
    async verifyOTPTwilio(phoneNumber, otpCode) {
        try {
            const response = await fetch(
                `https://verify.twilio.com/v2/Services/${this.verifyServiceId}/VerificationCheck`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(this.accountSid + ':' + this.authToken),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `To=${phoneNumber}&Code=${otpCode}`,
                }
            );

            const data = await response.json();

            if (data.status === 'approved') {
                // Clear session
                sessionStorage.removeItem('otpSessionSid');
                sessionStorage.removeItem('otpSessionTime');
                
                return {
                    success: true,
                    verified: true,
                    message: 'Phone number verified successfully!'
                };
            } else {
                throw new Error('Invalid OTP code');
            }
        } catch (error) {
            console.error('Twilio verification error:', error);
            throw error;
        }
    }

    /**
     * Verify demo OTP locally
     */
    verifyDemoOTP(phoneNumber, otpCode) {
        const storedData = this.otpStore[phoneNumber];

        if (!storedData) {
            throw new Error('No OTP found for this phone number. Please request a new OTP.');
        }

        // Check expiry
        if (Date.now() > storedData.expiryTime) {
            delete this.otpStore[phoneNumber];
            throw new Error('OTP has expired. Please request a new OTP.');
        }

        // Check attempts
        if (storedData.attempts >= 3) {
            delete this.otpStore[phoneNumber];
            throw new Error('Too many failed attempts. Please request a new OTP.');
        }

        // Verify OTP
        if (storedData.otp !== otpCode) {
            storedData.attempts++;
            throw new Error(`Invalid OTP. Attempts remaining: ${3 - storedData.attempts}`);
        }

        // Success
        delete this.otpStore[phoneNumber];
        sessionStorage.removeItem('otpSessionTime');

        return {
            success: true,
            verified: true,
            message: 'Phone number verified successfully!'
        };
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // E.164 format: +[country code][number]
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phoneNumber);
    }

    /**
     * Format phone number to E.164
     */
    formatPhoneNumber(phoneNumber, countryCode = '+91') {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // If already starts with country code (91), add +
        if (cleaned.startsWith(countryCode.replace('+', ''))) {
            return '+' + cleaned;
        }
        
        // If 10 digits, assume India
        if (cleaned.length === 10) {
            return countryCode + cleaned;
        }
        
        // If already has country code
        if (cleaned.length > 10) {
            return '+' + cleaned;
        }

        throw new Error('Invalid phone number length');
    }

    /**
     * Resend OTP
     */
    async resendOTP(phoneNumber) {
        // Clear old OTP on resend
        if (!this.isProduction) {
            delete this.otpStore[phoneNumber];
        }
        return this.sendOTP(phoneNumber);
    }

    /**
     * Get remaining time for OTP expiry (demo mode)
     */
    getRemainingTime(phoneNumber) {
        const storedData = this.otpStore[phoneNumber];
        if (!storedData) return 0;

        const remaining = storedData.expiryTime - Date.now();
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    }
}

// Initialize OTP service globally
let phoneOTPService;

function initializePhoneOTP(config = {}) {
    phoneOTPService = new PhoneOTPService(config);
    return phoneOTPService;
}

function getPhoneOTPService() {
    if (!phoneOTPService) {
        phoneOTPService = new PhoneOTPService();
    }
    return phoneOTPService;
}
