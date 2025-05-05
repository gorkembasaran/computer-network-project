import express from 'express';
import {
  getUserSessions,
  createOrGetSession,
} from '../controllers/sessionController.js';
import { getSessionById } from '../controllers/sessionController.js';

const router = express.Router();

router.get('/:sessionId', getSessionById);
router.get('/user/:userId', getUserSessions);
router.post('/', createOrGetSession);

export default router;