import Session from '../models/Session.js';

export const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await Session.find({
      participants: userId,
    })
      .populate('participants', 'username')
      .sort({ updatedAt: -1 });

    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Oturumlar getirilemedi.' });
  }
};

export const createOrGetSession = async (req, res) => {
    const { user1Id, user2Id } = req.body;
  
    try {
      let session = await Session.findOne({
        participants: { $all: [user1Id, user2Id] },
      });
  
      const isNewSession = !session;
  
      if (isNewSession) {
        session = await Session.create({ participants: [user1Id, user2Id] });
      
        session = await Session.findById(session._id).populate('participants', 'username');
      
        const io = req.app.get('io');
      
        [user1Id, user2Id].forEach((id) => {
          const socketId = getSocketId(id);
          if (socketId) {
            io.to(socketId).emit('session_created', {
              _id: session._id,
              participants: session.participants, // ✅ artık _id + username içeriyor
              lastMessage: '',
              updatedAt: session.updatedAt,
            });
          }
        });
      }
  
      res.status(200).json(session);
    } catch (err) {
      res.status(500).json({ message: 'Oturum oluşturulamadı.' });
    }
  };

  export const getSessionById = async (req, res) => {
    try {
      const session = await Session.findById(req.params.sessionId).populate('participants', 'username');
      if (!session) {
        return res.status(404).json({ message: 'Session bulunamadı.' });
      }
      res.status(200).json(session);
    } catch (err) {
      res.status(500).json({ message: 'Session alınamadı.' });
    }
  };