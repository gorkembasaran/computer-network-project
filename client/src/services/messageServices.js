import API from "./api.js";

export const getMessagesBySession = async (sessionId) => {
  const res = await API.get(`/messages/session/${sessionId}`);
  return res.data;
};

export const sendMessage = async ({ sessionId, senderId, content }) => {
  const res = await API.post(`/messages`, { sessionId, senderId, content });
  return res.data;
};