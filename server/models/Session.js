import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);