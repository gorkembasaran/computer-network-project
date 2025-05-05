import API from "./api.js";

export const getUserSessions = async (userId) => {
  const res = await API.get(`/sessions/user/${userId}`);
  return res.data;
};

export const createOrGetSession = async (user1Id, user2Id) => {
  const res = await API.post(`/sessions`, { user1Id, user2Id });
  return res.data;
};

export const getSessionById = async (sessionId) => {
    const res = await API.get(`/sessions/${sessionId}`);
    return res.data;
  };