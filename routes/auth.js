const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Check if Supabase is configured
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ 
                error: 'Authentication service not configured' 
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ 
                error: 'User already exists with this email' 
            });
        }

        // Create user in database
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                email: email.toLowerCase(),
                username: username || email.split('@')[0],
                password_hash: hashedPassword,
                is_premium: false,
                free_playlist_count: 0,
                premium_playlist_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id, email, username, is_premium, created_at')
            .single();

        if (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ 
                error: 'Failed to create user account' 
            });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                is_premium: user.is_premium
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Check if Supabase is configured
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ 
                error: 'Authentication service not configured' 
            });
        }

        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, password_hash, is_premium, premium_expires_at')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                is_premium: user.is_premium,
                premium_expires_at: user.premium_expires_at
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Get current user profile
 */
router.get('/profile', requireAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                username: req.user.username,
                is_premium: req.user.is_premium,
                premium_expires_at: req.user.premium_expires_at
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Update user profile
 */
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { username } = req.body;

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ 
                error: 'Authentication service not configured' 
            });
        }

        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (username) {
            updateData.username = username;
        }

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .select('id, email, username, is_premium, premium_expires_at')
            .single();

        if (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({ 
                error: 'Failed to update profile' 
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                is_premium: user.is_premium,
                premium_expires_at: user.premium_expires_at
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Change password
 */
router.put('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters long' 
            });
        }

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ 
                error: 'Authentication service not configured' 
            });
        }

        // Get current user with password hash
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', req.user.id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const { error: updateError } = await supabase
            .from('users')
            .update({
                password_hash: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        if (updateError) {
            console.error('Password update error:', updateError);
            return res.status(500).json({ 
                error: 'Failed to update password' 
            });
        }

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Delete user account
 */
router.delete('/account', requireAuth, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                error: 'Password is required to delete account' 
            });
        }

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ 
                error: 'Authentication service not configured' 
            });
        }

        // Get current user with password hash
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', req.user.id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Password is incorrect' 
            });
        }

        // Delete user (this will cascade delete related data due to foreign key constraints)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', req.user.id);

        if (deleteError) {
            console.error('Account deletion error:', deleteError);
            return res.status(500).json({ 
                error: 'Failed to delete account' 
            });
        }

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

/**
 * Check authentication status
 */
router.get('/status', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.json({
                authenticated: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../middleware/auth');
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.json({
                authenticated: false,
                message: 'Invalid token'
            });
        }

        // Verify user still exists
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, is_premium, premium_expires_at')
                .eq('id', decoded.userId)
                .single();

            if (error || !user) {
                return res.json({
                    authenticated: false,
                    message: 'User not found'
                });
            }

            res.json({
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    is_premium: user.is_premium,
                    premium_expires_at: user.premium_expires_at
                }
            });
        } else {
            res.json({
                authenticated: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email
                }
            });
        }

    } catch (error) {
        console.error('Auth status error:', error);
        res.json({
            authenticated: false,
            message: 'Error checking authentication status'
        });
    }
});

module.exports = router;
