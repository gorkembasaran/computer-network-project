// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import {
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
  getSocketId
} from './services/activeUserService.js';
import Session from './models/Session.js';
import Message from './models/Message.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes)

io.on('connection', (socket) => {
    console.log('Yeni bağlantı:', socket.id);

    socket.on('user_connected', async (userId) => {
        socket.userId = userId;
        addOnlineUser(userId, socket.id);
        const users = await getOnlineUsers();
        io.emit('update_online_users', users); // artık { _id, username } objeleri geliyor
      });

    socket.on('join_session', async (sessionId) => {
        try {
          const session = await Session.findById(sessionId);
      
          // Eğer session yoksa
          if (!session) {
            console.warn(`Session bulunamadı: ${sessionId}`);
            return;
          }
      
          // Kullanıcı session katılımcılarından biri mi?
          if (!session.participants.map(String).includes(socket.userId)) {
            console.warn(`Yetkisiz erişim! Kullanıcı ${socket.userId}, session ${sessionId} içinde değil.`);
            return;
          }
      
          socket.join(sessionId);
          console.log(`Kullanıcı ${socket.userId}, session ${sessionId} odasına katıldı.`);
        } catch (err) {
          console.error(`Session katılım hatası: ${err.message}`);
        }
      });

    socket.on('logout', () => {
        removeOnlineUser(socket.id);
        io.emit('update_online_users', getOnlineUsers());
    });

    socket.on('send_message', async (data) => {
        const { sessionId, senderId, content } = data;
      
        if (socket.userId !== senderId) {
          console.warn('Kimlik uyuşmazlığı: gönderici kendisi değil!');
          return;
        }
      
        try {
          // Mesajı oluştur ve hemen ardından populate et
          const message = await Message.findById(
            (await Message.create({ session: sessionId, sender: senderId, content }))._id
          ).populate('sender', 'username');
      
          // Oturumu güncelle
          await Session.findByIdAndUpdate(sessionId, {
            lastMessage: content,
            updatedAt: new Date(),
          });
      
          // Mesajı odadaki kullanıcılara gönder (sender objesiyle birlikte)
          io.to(sessionId).emit('receive_message', {
            _id: message._id,
            sessionId: message.session,
            sender: message.sender, // 👈 { _id, username }
            content: message.content,
            createdAt: message.createdAt,
          });
      
        // Sidebar güncellemesi için emit
        const session = await Session.findById(sessionId);

        if (session) {
            for (const participantId of session.participants) {
                const socketId = getSocketId(participantId);
                console.log(`🎯 session_updated emit ediliyor: ${participantId} -> ${socketId}`);
                if (socketId) {
                io.to(socketId).emit('session_updated', {
                    sessionId,
                    lastMessage: content,
                    updatedAt: new Date(),
                });
                }
            }
        }
        } catch (err) {
          console.error('Mesaj gönderim hatası:', err.message);
        }
      });
    socket.on('logout', async () => {
        removeOnlineUser(socket.id);
        const users = await getOnlineUsers(); // await gerekli
        io.emit('update_online_users', users);
      });
      socket.on('disconnect', async () => {
        console.log('Bağlantı koptu:', socket.id);
        removeOnlineUser(socket.id);
        const users = await getOnlineUsers(); // await ekle
        io.emit('update_online_users', users);
      });
});

server.listen(3001, () => {
  console.log('Sunucu çalışıyor: http://localhost:3001');
});