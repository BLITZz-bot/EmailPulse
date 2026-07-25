import { Router } from 'express';
import passport from '../config/passport';
import { googleCallbackHandler, getMeHandler, logoutHandler } from '../controllers/authController';

const router = Router();

// Initiate Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallbackHandler
);

// Get current user profile
router.get('/me', getMeHandler);

// Logout
router.post('/logout', logoutHandler);

export default router;
