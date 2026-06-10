const rateLimit = require('express-rate-limit');

// General API limit — all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes' },
});

// Strict limit for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                   // only 10 login/signup attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again after 15 minutes' },
});

// Sync limit — prevent admin from hammering external APIs
const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 manual syncs per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Sync rate limit reached, please wait before triggering again' },
});



module.exports = { generalLimiter, authLimiter, syncLimiter };

