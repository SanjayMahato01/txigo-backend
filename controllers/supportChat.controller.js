import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
const chatRequests = new Map();
const activeChats = new Map();
const adminConnections = new Set();

// Utility function to broadcast to all connections in a chat
const broadcastToChat = (chatId, data) => {
  const chat = activeChats.get(chatId) || chatRequests.get(chatId);
  if (!chat?.connections) return;

  const message = JSON.stringify(data);
  chat.connections.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// Notify all admins of new chat request
const notifyAdminsOfNewRequest = (chatRequest) => {
  const notification = JSON.stringify({
    type: 'new_request',
    chatRequest
  });

  adminConnections.forEach(adminWs => {
    if (adminWs.readyState === adminWs.OPEN) {
      adminWs.send(notification);
    }
  });
};

export const requestChat = (req, res) => {
  const { vendorId, vendorName } = req.body;

  const chatRequest = {
    id: uuidv4(),
    vendorId,
    vendorName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    messages: [],
    connections: new Set()
  };

  chatRequests.set(chatRequest.id, chatRequest);
  notifyAdminsOfNewRequest(chatRequest);

  res.json({ chatRequest });
};

export const acceptChat = (req, res) => {
  const { chatId } = req.params;

  if (!chatRequests.has(chatId)) {
    // Optional: check if it's already accepted
    if (activeChats.has(chatId)) {
      return res.status(400).json({ error: 'Chat already accepted' });
    }

    return res.status(404).json({ error: 'Chat request not found' });
  }

  const chatRequest = chatRequests.get(chatId);
  chatRequest.status = 'active';
  chatRequest.adminId = 'admin-001';
  chatRequest.adminName = 'Support Admin';

  const systemMessage = {
    id: uuidv4(),
    text: `${chatRequest.adminName} has joined the chat`,
    sender: 'system',
    createdAt: new Date().toISOString()
  };

  chatRequest.messages.push(systemMessage);

  chatRequests.delete(chatId);
  activeChats.set(chatId, chatRequest);

  broadcastToChat(chatId, {
    type: 'chat_activated',
    chatRequest,
    message: systemMessage
  });

  res.json({ chatRequest });
};


export const getChatStatus = (req, res) => {
  const { chatId } = req.params;
  const chat = activeChats.get(chatId) || chatRequests.get(chatId);

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  res.json({ 
    chatRequest: chat,
    messages: chat.messages || []
  });
};

export const getAdminRequests = (req, res) => {
  const pendingRequests = Array.from(chatRequests.values())
    .filter(request => request.status === 'pending');
  res.json({ chatRequests: pendingRequests });
};

export const handleAdminWebSocket = (ws) => {
  adminConnections.add(ws);

  // Send initial pending requests when admin connects
  const pendingRequests = Array.from(chatRequests.values())
    .filter(request => request.status === 'pending');
  if (pendingRequests.length > 0) {
    ws.send(JSON.stringify({
      type: 'initial_requests',
      chatRequests: pendingRequests
    }));
  }

  ws.on('close', () => {
    adminConnections.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('Admin WebSocket error:', err);
    adminConnections.delete(ws);
  });
};

export const handleChatWebSocket = (ws, req) => {
  const { chatId } = req.params;
  const chat = activeChats.get(chatId) || chatRequests.get(chatId);

  if (!chat) {
    ws.close(1008, 'Chat not found');
    return;
  }

  // Initialize connections if it doesn't exist
  chat.connections ??= new Set();
  chat.connections.add(ws);

  // Send chat history
  if (chat.messages.length > 0) {
    ws.send(JSON.stringify({
      type: 'history',
      messages: chat.messages
    }));
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'message') {
        const chatMessage = {
          id: uuidv4(),
          text: data.message.text,
          sender: data.message.sender,
          createdAt: new Date().toISOString()
        };

        chat.messages.push(chatMessage);
        broadcastToChat(chatId, {
          type: 'message',
          message: chatMessage
        });

      } else if (data.type === 'end_chat' && activeChats.has(chatId)) {
        const chatRequest = activeChats.get(chatId);
        chatRequest.status = 'closed';
        
        const systemMessage = {
          id: uuidv4(),
          text: 'Chat session has ended',
          sender: 'system',
          createdAt: new Date().toISOString()
        };
        
        chatRequest.messages.push(systemMessage);
        activeChats.delete(chatId);
        
        broadcastToChat(chatId, {
          type: 'chat_ended',
          message: systemMessage
        });
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    chat.connections?.delete(ws);
    
    // Clean up if no more connections
    if (chat.connections?.size === 0) {
      if (chat.status === 'pending') {
        chatRequests.delete(chatId);
      } else if (chat.status === 'active') {
        activeChats.delete(chatId);
      }
    }
  });

  ws.on('error', (err) => {
    console.error('Chat WebSocket error:', err);
    chat.connections?.delete(ws);
  });
};