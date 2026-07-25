import { Router } from 'express';
import {
  scheduleEmailsHandler,
  getScheduledEmailsHandler,
  getSentEmailsHandler,
  cancelEmailHandler,
  getStatsHandler,
} from '../controllers/emailController';

const router = Router();

router.post('/schedule', scheduleEmailsHandler);
router.get('/scheduled', getScheduledEmailsHandler);
router.get('/sent', getSentEmailsHandler);
router.delete('/:id', cancelEmailHandler);
router.get('/stats', getStatsHandler);  // Note: put this BEFORE /:id

export default router;
