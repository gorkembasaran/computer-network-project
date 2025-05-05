import API from './api.js';

export const getUserById = async (userId) => {
  const res = await API.get(`/users/${userId}`);
  return res.data;
};