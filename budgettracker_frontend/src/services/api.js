import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && token !== 'null' && token !== 'undefined' && token.includes('.')) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (token) {
      localStorage.removeItem('token')
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/profile'),
}

export const transactionAPI = {
  getTransactions: (params) => api.get('/transaction', { params }),
  createTransaction: (transactionData) => api.post('/transaction', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/transaction/${id}`, transactionData),
  deleteTransaction: (id) => api.delete(`/transaction/${id}`),
  getTransactionById: (id) => api.get(`/transaction/${id}`),
}
  
export const budgetAPI = {
  getBudgets: () => api.get('/budget'),
  createBudget: (budgetData) => api.post('/budget', budgetData),
  updateBudget: (id, budgetData) => api.put(`/budget/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/budget/${id}`),
}

export const savingsAPI = {
  getSavings: () => api.get('/savings'),
  createSaving: (savingData) => api.post('/savings', savingData),
  updateSaving: (id, savingData) => api.put(`/savings/${id}`, savingData),
  deleteSaving: (id) => api.delete(`/savings/${id}`),
}

export const forumAPI = {
  getAllPosts: () => api.get('/forumposts'),
  createPost: (postData) => api.post('/forumposts', postData),
  updatePost: (id, postData) => api.put(`/forumposts/${id}`, postData),
  deletePost: (id) => api.delete(`/forumposts/${id}`),
}

export const commentsAPI = {
  createComment: (commentData) => api.post('/comments', commentData),
  getComments: (postId) => api.get(`/comments/${postId}`),
}

export default api