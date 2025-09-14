const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// JWT secret - in production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'blueme-super-secret-key-change-in-production';

/**
 * Optional authentication middleware
 * Allows requests to proceed whether user is authenticated or not
 * Adds user info to req.user if token is valid
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            req.user = null;
            req.isAuthenticated = false;
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verify user still exists in database
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, is_premium, premium_expires_at')
                .eq('id', decoded.userId)
                .single();

            if (error || !user) {
                req.user = null;
                req.isAuthenticated = false;
                return next();
            }

            req.user = user;
            req.isAuthenticated = true;
        } else {
            // Fallback for when Supabase is not configured
            req.user = { id: decoded.userId, email: decoded.email };
            req.isAuthenticated = true;
        }

        next();
    } catch (error) {
        req.user = null;
        req.isAuthenticated = false;
        next();
    }
};

/**
 * Required authentication middleware
 * Blocks requests if user is not authenticated
 */
const requireAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please log in to access this feature'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verify user still exists in database
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, username, is_premium, premium_expires_at')
                .eq('id', decoded.userId)
                .single();

            if (error || !user) {
                return res.status(401).json({ 
                    error: 'Invalid token',
                    message: 'User not found or token expired'
                });
            }

            req.user = user;
            req.isAuthenticated = true;
        } else {
            // Fallback for when Supabase is not configured
            req.user = { id: decoded.userId, email: decoded.email };
            req.isAuthenticated = true;
        }

        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Invalid token',
            message: 'Please log in again'
        });
    }
};

/**
 * Premium feature middleware
 * Requires user to be authenticated and have premium access
 */
const requirePremium = async (req, res, next) => {
    if (!req.isAuthenticated) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access premium features'
        });
    }

    if (!req.user.is_premium) {
        return res.status(403).json({ 
            error: 'Premium required',
            message: 'This feature requires a premium subscription'
        });
    }

    // Check if premium has expired
    if (req.user.premium_expires_at && new Date(req.user.premium_expires_at) < new Date()) {
        return res.status(403).json({ 
            error: 'Premium expired',
            message: 'Your premium subscription has expired'
        });
    }

    next();
};

/**
 * Generate JWT token for user
 */
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '30d' } // Token expires in 30 days
    );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    optionalAuth,
    requireAuth,
    requirePremium,
    generateToken,
    verifyToken,
    JWT_SECRET
};
