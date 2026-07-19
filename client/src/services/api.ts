import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
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

  async deleteEnterprise(id: string) {
    const response = await this.client.delete(`/game/enterprises/${id}`);
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

  async getEconomicHistory() {
    const response = await this.client.get('/game/economy/history');
    return response.data;
  }

  // Period progression
  async getPeriodStatus() {
    const response = await this.client.get('/game/period-status');
    return response.data;
  }

  async advancePeriod() {
    const response = await this.client.post('/game/advance-period');
    return response.data;
  }

  // Decision cooldown
  async getDecisionCooldown() {
    const response = await this.client.get('/game/cooldown');
    return response.data;
  }

  // Events history
  async getEventsHistory() {
    const response = await this.client.get('/game/events/history');
    return response.data;
  }

  // Enterprise map
  async getEnterpriseMap(period?: string) {
    const params = period ? { period } : {};
    const response = await this.client.get('/game/map', { params });
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

  async getStepikCourse(courseId?: number) {
    const response = await this.client.get('/stepik/course', {
      params: courseId ? { courseId } : undefined,
    });
    return response.data;
  }

  async getStepikCourseProgress(courseId: number) {
    const response = await this.client.get(`/stepik/courses/${courseId}/progress`);
    return response.data;
  }

  async getCompletedLessons() {
    const response = await this.client.get('/stepik/completed-lessons');
    return response.data;
  }

  async syncProgress(gameProgress: unknown) {
    const response = await this.client.post('/stepik/sync-progress', { gameProgress });
    return response.data;
  }

  // Auth API
  async verifyToken() {
    const response = await axios.get('/api/auth/verify', { withCredentials: true });
    return response.data;
  }

  async logout() {
    const response = await axios.post('/api/auth/logout', null, { withCredentials: true });
    return response.data;
  }
}

export const apiService = new ApiService();
