import { Request, Response } from 'express';
import { env } from '../config/env';

export function googleCallbackHandler(req: Request, res: Response) {
  // Redirect to frontend dashboard after successful Google login
  res.redirect(`${env.FRONTEND_URL}/dashboard`);
}

export function getMeHandler(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  return res.json(req.user);
}

export function logoutHandler(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  });
}
