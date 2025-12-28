import { chatRequests, activeChats } from './chatStorage.js';

export const broadcastToChat = (chatId, message) => {
  const chat = activeChats.get(chatId) || chatRequests.get(chatId);
  if (!chat?.connections) return;

  const msgString = JSON.stringify(message);
  chat.connections.forEach(conn => {
    if (conn.readyState === 1) { // WebSocket.OPEN === 1
      conn.send(msgString);
    }
  });
};

export const notifyAdminsOfNewRequest = (chatRequest) => {
  console.log(`🛎️ New chat request from: ${chatRequest.vendorName}`);
};
