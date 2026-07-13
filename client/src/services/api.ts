import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Game API
  async getGameState() {
    const response = await this.client.get('/game/state');
    return response.data;
  }

  async getEnterprises() {
    const response = await this.client.get('/game/enterprises');
    return response.data;
  }

  async createEnterprise(data: { name: string; type: string; location: string }) {
    const response = await this.client.post('/game/enterprises', data);
    return response.data;
  }

  async updateEnterprise(id: string, updates: any) {
    const response = await this.client.put(`/game/enterprises/${id}`, updates);
    return response.data;
  }

  async makeDecision(enterpriseId: string, decision: { type: string; value: number }) {
    const response = await this.client.post(`/game/enterprises/${enterpriseId}/decisions`, decision);
    return response.data;
  }

  async getEvents() {
    const response = await this.client.get('/game/events');
    return response.data;
  }

  async respondToEvent(eventId: string, choiceId: string) {
    const response = await this.client.post(`/game/events/${eventId}/respond`, { choiceId });
    return response.data;
  }

  async getEconomicIndicators() {
    const response = await this.client.get('/game/economy');
    return response.data;
  }

  async getMarketState() {
    const response = await this.client.get('/game/market');
    return response.data;
  }

  async getProgress() {
    const response = await this.client.get('/game/progress');
    return response.data;
  }

  async getAvailableEnterpriseTypes() {
    const response = await this.client.get('/game/enterprise-types');
    return response.data;
  }

  // Stepik API
  async getStepikProfile() {
    const response = await this.client.get('/stepik/profile');
    return response.data;
  }

  async getStepikCourses() {
    const response = await this.client.get('/stepik/courses');
    return response.data;
  }

  async syncProgress(gameProgress: any) {
    const response = await this.client.post('/stepik/sync-progress', { gameProgress });
    return response.data;
  }

  // Auth API (mounted at /auth, not /api/auth)
  async verifyToken() {
    const response = await axios.get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.data;
  }

  async logout() {
    const response = await axios.post('/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
