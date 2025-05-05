import Message from '../models/Message.js';
import Session from '../models/Session.js';

export const getMessagesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await Message.find({ session: sessionId }).populate('sender', 'username');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Mesajlar alınamadı.' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, senderId, content } = req.body;

    const message = await Message.create({
      session: sessionId,
      sender: senderId,
      content,
    });

    // Son mesajı oturuma kaydet
    await Session.findByIdAndUpdate(sessionId, {
      lastMessage: content,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Mesaj gönderilemedi.' });
  }
};