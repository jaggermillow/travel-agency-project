/**
 * Service for handling User Authentication.
 * Uses sessionStorage to maintain login state during the session.
 */
class AuthService {
    constructor() {
        this.isAuthenticated = false;
        // Check if already logged in from session
        const storedAuth = sessionStorage.getItem('isLoggedIn');
        if (storedAuth === 'true') {
            this.isAuthenticated = true;
        }
    }

    /**
     * Attempt to login.
     * @param {string} username 
     * @param {string} password 
     * @returns {boolean} True if successful, False otherwise.
     */
    login(username, password) {
        // Mock Credentials
        if (username === 'admin' && password === 'admin123') {
            this.isAuthenticated = true;
            sessionStorage.setItem('isLoggedIn', 'true');
            return true;
        }
        return false;
    }

    /**
     * Logout the user and redirect to login page.
     */
    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }

    /**
     * Check current auth status.
     * @returns {boolean}
     */
    isLoggedIn() {
        // Double check session storage to be sure
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }
}

export default new AuthService();
