import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Posts
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Concerns
export const getConcerns = () => api.get('/concerns');
export const createConcern = (data) => api.post('/concerns', data);

// Emergency Contacts
export const getEmergencyContacts = () => api.get('/emergency-contacts');

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const loginUser = (data) => api.post('/users/login', data);
export const registerUser = (data) => api.post('/users/register', data);

// Admin
export const adminLogin = (data) => api.post('/admin/login', data);

// Comments
export const getComments = (postId) => api.get(`/comments/${postId}`);
export const createComment = (data) => api.post('/comments', data);

// Document Requests
export const getDocumentRequests = () => api.get('/document-requests');
export const createDocumentRequest = (data) => api.post('/document-requests', data);

// Barangays
export const getBarangays = () => api.get('/barangays');
export const createBarangay = (data) => api.post('/barangays', data);

// Officials
export const getOfficials = () => api.get('/officials');
export const getBarangayAdmin = (barangayId) => api.get(`/barangay-admin/${barangayId}`);

// Activity Logs
export const getActivityLogs = () => api.get('/activity-logs');

export default api;
