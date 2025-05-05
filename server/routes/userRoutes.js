import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Hata oluştu' });
  }
});

export default router;