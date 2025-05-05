import express from 'express';
import {
  getMessagesBySession,
  sendMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/session/:sessionId', getMessagesBySession);
router.post('/', sendMessage);

export default router;