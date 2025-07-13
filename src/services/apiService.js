import { mockApiService } from './mockApi';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.useMockApi = false; // Flag to determine if we should use mock API
  }

  async request(endpoint, options = {}) {
    // If mock API is enabled, don't make real requests
    if (this.useMockApi) {
      throw new Error('Using mock API mode');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Try real API first, fallback to mock API if unavailable
  async makeRequestWithFallback(realApiCall, mockApiCall) {
    try {
      // Try real API first
      return await realApiCall();
    } catch (error) {
      console.warn('Real API unavailable, falling back to mock API:', error.message);
      this.useMockApi = true;
      return await mockApiCall();
    }
  }

  // Health check
  async checkHealth() {
    return this.makeRequestWithFallback(
      () => this.request('/health'),
      () => mockApiService.checkHealth()
    );
  }

  // Conversation endpoints
  async getConversations() {
    return this.makeRequestWithFallback(
      () => this.request('/conversations'),
      () => mockApiService.getConversations()
    );
  }

  async createConversation() {
    return this.makeRequestWithFallback(
      () => this.request('/conversations', { method: 'POST' }),
      () => mockApiService.createConversation()
    );
  }

  async getConversation(conversationId) {
    return this.makeRequestWithFallback(
      () => this.request(`/conversations/${conversationId}`),
      () => mockApiService.getConversation(conversationId)
    );
  }

  async sendMessage(conversationId, message, aiConfig) {
    return this.makeRequestWithFallback(
      () => this.request(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message, aiConfig }),
      }),
      () => mockApiService.sendMessage(conversationId, message, aiConfig)
    );
  }

  async deleteConversation(conversationId) {
    return this.makeRequestWithFallback(
      () => this.request(`/conversations/${conversationId}`, { method: 'DELETE' }),
      () => mockApiService.deleteConversation(conversationId)
    );
  }

  async clearAllConversations() {
    return this.makeRequestWithFallback(
      () => this.request('/conversations', { method: 'DELETE' }),
      () => mockApiService.clearAllConversations()
    );
  }

  // Method to force mock API usage (useful for testing)
  enableMockMode() {
    this.useMockApi = true;
  }

  // Method to reset to real API mode
  enableRealApiMode() {
    this.useMockApi = false;
  }

  // Check if currently using mock API
  isMockMode() {
    return this.useMockApi;
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;