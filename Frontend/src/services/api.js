import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ns_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ns_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const profileApi = {
  get: () => api.get('/profiles/me'),
  update: (data) => api.patch('/profiles/me', data),
}

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }),
  match: () => api.get('/jobs/match'),
  search: (params) => api.get('/jobs/search', { params }),
  domains: () => api.get('/jobs/domains'),
  single: (id) => api.get(`/jobs/${id}`),
}

export const applicationsApi = {
  list: () => api.get('/applications'),
  track: (job_id) => api.post('/applications', { job_id }),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  remind: (id, data) => api.patch(`/applications/${id}/remind`, data),
}

export const certificationsApi = {
  list: () => api.get('/certifications'),
  add: (data) => api.post('/certifications', data),
  update: (id, data) => api.patch(`/certifications/${id}`, data),
  delete: (id) => api.delete(`/certifications/${id}`),
}

export const companiesApi = {
  list: () => api.get('/companies'),
  following: () => api.get('/companies/following'),
  feed: () => api.get('/companies/feed'),
  jobs: (slug) => api.get(`/companies/${slug}/jobs`),
  follow: (id) => api.post(`/companies/${id}/follow`),
  unfollow: (id) => api.delete(`/companies/${id}/follow`),
}

export const insightsApi = {
  get: () => api.get('/insights'),
}

export default api