/**
 * BlueMe Authentication System
 * Handles user authentication without affecting existing functionality
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        this.apiBase = '/api/auth';
        
        // Load existing token from localStorage
        this.loadStoredAuth();
        
        // Initialize UI
        this.initAuthUI();
    }

    /**
     * Load stored authentication data
     */
    loadStoredAuth() {
        const storedToken = localStorage.getItem('blueme_token');
        const storedUser = localStorage.getItem('blueme_user');
        
        if (storedToken && storedUser) {
            this.token = storedToken;
            this.user = JSON.parse(storedUser);
            this.isAuthenticated = true;
            this.updateAuthUI();
        }
    }

    /**
     * Store authentication data
     */
    storeAuth(token, user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
        
        localStorage.setItem('blueme_token', token);
        localStorage.setItem('blueme_user', JSON.stringify(user));
        
        this.updateAuthUI();
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('blueme_token');
        localStorage.removeItem('blueme_user');
        
        this.updateAuthUI();
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    /**
     * Register new user
     */
    async register(email, password, username, avatar) {
        try {
            const response = await this.apiRequest('/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, username, avatar })
            });

            this.storeAuth(response.token, response.user);
            this.showNotification('Account created successfully!', 'success');
            this.hideAuthModal();
            
            return response;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await this.apiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.storeAuth(response.token, response.user);
            this.showNotification('Welcome back!', 'success');
            this.hideAuthModal();
            
            return response;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        this.clearAuth();
        this.showNotification('Logged out successfully', 'info');
        this.hideAuthModal();
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        if (!this.isAuthenticated) {
            return null;
        }

        try {
            const response = await this.apiRequest('/profile');
            this.user = response.user;
            localStorage.setItem('blueme_user', JSON.stringify(this.user));
            return response.user;
        } catch (error) {
            console.error('Failed to get profile:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(username) {
        try {
            const response = await this.apiRequest('/profile', {
                method: 'PUT',
                body: JSON.stringify({ username })
            });

            this.user = response.user;
            localStorage.setItem('blueme_user', JSON.stringify(this.user));
            this.showNotification('Profile updated successfully!', 'success');
            
            return response.user;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            await this.apiRequest('/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            this.showNotification('Password changed successfully!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    /**
     * Delete account
     */
    async deleteAccount(password) {
        try {
            await this.apiRequest('/account', {
                method: 'DELETE',
                body: JSON.stringify({ password })
            });

            this.clearAuth();
            this.showNotification('Account deleted successfully', 'info');
            this.hideAuthModal();
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    /**
     * Initialize authentication UI
     */
    initAuthUI() {
        // Create auth button in header
        this.createAuthButton();
        
        // Create auth modal
        this.createAuthModal();
        
        // Update UI based on current auth state
        this.updateAuthUI();
    }

    /**
     * Create authentication button
     */
    createAuthButton() {
        console.log('🔐 Creating authentication button...');
        
        const header = document.querySelector('.header');
        if (!header) {
            console.error('❌ Header element not found');
            return;
        }
        
        console.log('✅ Header element found:', header);

        const authButton = document.createElement('div');
        authButton.className = 'auth-button';
        authButton.innerHTML = `
            <button id="auth-btn" class="auth-btn">
                <span class="auth-icon">👤</span>
                <span class="auth-text">Guest</span>
            </button>
        `;
        
        header.appendChild(authButton);
        console.log('✅ Authentication button added to header');
        
        // Add click handler
        const authBtn = document.getElementById('auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                console.log('🔐 Auth button clicked');
                this.showAuthModal();
            });
            console.log('✅ Auth button click listener added');
        } else {
            console.error('❌ Auth button not found after creation');
        }
    }

    /**
     * Create authentication modal
     */
    createAuthModal() {
        console.log('🔐 Creating authentication modal...');
        
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2 id="auth-modal-title">Sign In</h2>
                    <button class="auth-modal-close">&times;</button>
                </div>
                <div class="auth-modal-body">
                    <!-- Login Form -->
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <input type="email" id="login-email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="login-password" placeholder="Password" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">Sign In</button>
                    </form>

                    <!-- Register Form -->
                    <form id="register-form" class="auth-form" style="display: none;">
                        <!-- Avatar Selection -->
                        <div class="form-group">
                            <label class="form-label">Choose Your Avatar</label>
                            <div class="avatar-selection">
                                <div class="avatar-option" data-avatar="👤">
                                    <div class="avatar-preview">👤</div>
                                    <span>Default</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎵">
                                    <div class="avatar-preview">🎵</div>
                                    <span>Music</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎧">
                                    <div class="avatar-preview">🎧</div>
                                    <span>Headphones</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎤">
                                    <div class="avatar-preview">🎤</div>
                                    <span>Microphone</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎸">
                                    <div class="avatar-preview">🎸</div>
                                    <span>Guitar</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎹">
                                    <div class="avatar-preview">🎹</div>
                                    <span>Piano</span>
                                </div>
                                <div class="avatar-option" data-avatar="🥁">
                                    <div class="avatar-preview">🥁</div>
                                    <span>Drums</span>
                                </div>
                                <div class="avatar-option" data-avatar="🎺">
                                    <div class="avatar-preview">🎺</div>
                                    <span>Trumpet</span>
                                </div>
                            </div>
                            <input type="hidden" id="selected-avatar" value="👤">
                        </div>
                        
                        <div class="form-group">
                            <input type="email" id="register-email" placeholder="Email Address" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="register-username" placeholder="Username (optional)">
                        </div>
                        <div class="form-group">
                            <input type="password" id="register-password" placeholder="Password (min 6 characters)" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="register-confirm-password" placeholder="Confirm Password" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">Create Account</button>
                    </form>

                    <!-- Profile Form -->
                    <div id="profile-form" class="auth-form" style="display: none;">
                        <div class="profile-info">
                            <div class="profile-avatar-section">
                                <div class="profile-avatar-large" id="profile-avatar-display">👤</div>
                                <h3>Welcome, <span id="profile-username"></span>!</h3>
                            </div>
                            <p>Email: <span id="profile-email"></span></p>
                            <p>Status: <span id="profile-status"></span></p>
                        </div>
                        <div class="profile-actions">
                            <button id="change-password-btn" class="auth-secondary-btn">Change Password</button>
                            <button id="delete-account-btn" class="auth-danger-btn">Delete Account</button>
                            <button id="logout-btn" class="auth-submit-btn">Logout</button>
                        </div>
                    </div>

                    <!-- Change Password Form -->
                    <form id="change-password-form" class="auth-form" style="display: none;">
                        <div class="form-group">
                            <input type="password" id="current-password" placeholder="Current Password" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="new-password" placeholder="New Password" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="confirm-password" placeholder="Confirm New Password" required>
                        </div>
                        <button type="submit" class="auth-submit-btn">Change Password</button>
                        <button type="button" id="cancel-password-btn" class="auth-secondary-btn">Cancel</button>
                    </form>

                    <!-- Delete Account Form -->
                    <form id="delete-account-form" class="auth-form" style="display: none;">
                        <div class="form-group">
                            <input type="password" id="delete-password" placeholder="Enter password to confirm" required>
                        </div>
                        <button type="submit" class="auth-danger-btn">Delete Account</button>
                        <button type="button" id="cancel-delete-btn" class="auth-secondary-btn">Cancel</button>
                    </form>
                </div>
                <div class="auth-modal-footer">
                    <button id="toggle-auth-mode" class="auth-toggle-btn">Don't have an account? Sign up</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ Authentication modal added to body');
        
        // Add event listeners
        this.setupAuthModalEvents();
        this.setupAvatarSelection();
        console.log('✅ Authentication modal event listeners added');
    }

    /**
     * Setup avatar selection functionality
     */
    setupAvatarSelection() {
        // Add click handlers for avatar options
        document.addEventListener('click', (e) => {
            if (e.target.closest('.avatar-option')) {
                const avatarOption = e.target.closest('.avatar-option');
                const avatar = avatarOption.dataset.avatar;
                
                // Remove selected class from all options
                document.querySelectorAll('.avatar-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                avatarOption.classList.add('selected');
                
                // Update hidden input
                const selectedAvatarInput = document.getElementById('selected-avatar');
                if (selectedAvatarInput) {
                    selectedAvatarInput.value = avatar;
                }
                
                console.log('🎭 Avatar selected:', avatar);
            }
        });
        
        // Set default avatar as selected
        setTimeout(() => {
            const defaultAvatar = document.querySelector('.avatar-option[data-avatar="👤"]');
            if (defaultAvatar) {
                defaultAvatar.classList.add('selected');
            }
        }, 100);
    }

    /**
     * Setup authentication modal event listeners
     */
    setupAuthModalEvents() {
        const modal = document.getElementById('auth-modal');
        const closeBtn = modal.querySelector('.auth-modal-close');
        const toggleBtn = document.getElementById('toggle-auth-mode');
        
        // Close modal
        closeBtn.addEventListener('click', () => this.hideAuthModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideAuthModal();
        });
        
        // Toggle between login/register
        toggleBtn.addEventListener('click', () => this.toggleAuthMode());
        
        // Form submissions
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            this.login(email, password);
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const avatar = document.getElementById('selected-avatar').value;
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                this.showNotification('Password must be at least 6 characters', 'error');
                return;
            }
            
            this.register(email, password, username, avatar);
        });
        
        document.getElementById('change-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }
            
            this.changePassword(currentPassword, newPassword);
        });
        
        document.getElementById('delete-account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('delete-password').value;
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                this.deleteAccount(password);
            }
        });
        
        // Profile actions
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('change-password-btn').addEventListener('click', () => this.showChangePasswordForm());
        document.getElementById('delete-account-btn').addEventListener('click', () => this.showDeleteAccountForm());
        
        // Cancel buttons
        document.getElementById('cancel-password-btn').addEventListener('click', () => this.showProfileForm());
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.showProfileForm());
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.style.display = 'flex';
        
        if (this.isAuthenticated) {
            this.showProfileForm();
        } else {
            this.showLoginForm();
        }
    }

    /**
     * Hide authentication modal
     */
    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.style.display = 'none';
        this.resetForms();
    }

    /**
     * Toggle between login and register forms
     */
    toggleAuthMode() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleBtn = document.getElementById('toggle-auth-mode');
        const title = document.getElementById('auth-modal-title');
        
        if (loginForm.style.display !== 'none') {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            title.textContent = 'Create Account';
            toggleBtn.textContent = 'Already have an account? Sign in';
        } else {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            title.textContent = 'Sign In';
            toggleBtn.textContent = "Don't have an account? Sign up";
        }
    }

    /**
     * Show login form
     */
    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('profile-form').style.display = 'none';
        document.getElementById('change-password-form').style.display = 'none';
        document.getElementById('delete-account-form').style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Sign In';
        document.getElementById('toggle-auth-mode').style.display = 'block';
    }

    /**
     * Show profile form
     */
    showProfileForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('profile-form').style.display = 'block';
        document.getElementById('change-password-form').style.display = 'none';
        document.getElementById('delete-account-form').style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Profile';
        document.getElementById('toggle-auth-mode').style.display = 'none';
        
        // Update profile info
        document.getElementById('profile-username').textContent = this.user.username || 'User';
        document.getElementById('profile-email').textContent = this.user.email || '';
        document.getElementById('profile-status').textContent = this.user.is_premium ? 'Premium User' : 'Free User';
        
        // Update profile avatar
        const avatarDisplay = document.getElementById('profile-avatar-display');
        if (avatarDisplay && this.user.avatar) {
            avatarDisplay.textContent = this.user.avatar;
        }
    }

    /**
     * Show change password form
     */
    showChangePasswordForm() {
        document.getElementById('change-password-form').style.display = 'block';
        document.getElementById('profile-form').style.display = 'none';
    }

    /**
     * Show delete account form
     */
    showDeleteAccountForm() {
        document.getElementById('delete-account-form').style.display = 'block';
        document.getElementById('profile-form').style.display = 'none';
    }

    /**
     * Update authentication UI
     */
    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        const authText = authBtn?.querySelector('.auth-text');
        const authIcon = authBtn?.querySelector('.auth-icon');
        
        if (this.isAuthenticated) {
            authText.textContent = this.user.username || 'User';
            authIcon.textContent = '👤';
            authBtn.classList.add('authenticated');
        } else {
            authText.textContent = 'Guest';
            authIcon.textContent = '👤';
            authBtn.classList.remove('authenticated');
        }
    }

    /**
     * Reset all forms
     */
    resetForms() {
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.value = '';
        });
        this.showLoginForm();
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Initializing AuthManager...');
    try {
        window.authManager = new AuthManager();
        console.log('✅ AuthManager initialized successfully');
        console.log('🔐 Auth button should be visible in top-right corner');
    } catch (error) {
        console.error('❌ Failed to initialize AuthManager:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
