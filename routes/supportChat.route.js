import { Router } from 'express';
import expressWs from 'express-ws';
import {
  requestChat,
  acceptChat,
  getChatStatus,
  getAdminRequests,
  handleAdminWebSocket,
  handleChatWebSocket
} from '../controllers/supportChat.controller.js';

const supportChatRouter = Router();
expressWs(supportChatRouter);

// WebSocket endpoints first (most specific)
supportChatRouter.ws('/admin/ws', handleAdminWebSocket);
supportChatRouter.ws('/:chatId/ws', handleChatWebSocket);

// Admin routes first
supportChatRouter.get('/admin/requests', getAdminRequests);

// REST routes
supportChatRouter.post('/request', requestChat);
supportChatRouter.post('/:chatId/accept', acceptChat);
supportChatRouter.get('/:chatId/status', getChatStatus);

export default supportChatRouter;