// Service to check backend availability and manage connection status
class BackendChecker {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    this.healthEndpoint = '/api/health';
    this.isAvailable = false;
    this.lastChecked = null;
    this.checkInterval = 30000; // 30 seconds
    this.timeoutDuration = 5000; // 5 seconds
    this.listeners = new Set();
  }

  // Add listener for backend status changes
  addStatusListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of status change
  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  // Check if backend is available
  async checkAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);

      const response = await fetch(`${this.baseURL}${this.healthEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const wasAvailable = this.isAvailable;
      this.isAvailable = response.ok;
      this.lastChecked = new Date();

      // Notify listeners if status changed
      if (wasAvailable !== this.isAvailable) {
        this.notifyListeners({
          isAvailable: this.isAvailable,
          lastChecked: this.lastChecked,
          status: this.isAvailable ? 'connected' : 'disconnected'
        });
      }

      return {
        isAvailable: this.isAvailable,
        status: this.isAvailable ? 'connected' : 'disconnected',
        lastChecked: this.lastChecked,
        responseTime: null
      };

    } catch (error) {
      const wasAvailable = this.isAvailable;
      this.isAvailable = false;
      this.lastChecked = new Date();

      // Notify listeners if status changed
      if (wasAvailable !== this.isAvailable) {
        this.notifyListeners({
          isAvailable: this.isAvailable,
          lastChecked: this.lastChecked,
          status: 'disconnected',
          error: error.message
        });
      }

      return {
        isAvailable: false,
        status: 'disconnected',
        lastChecked: this.lastChecked,
        error: error.message
      };
    }
  }

  // Start periodic checking
  startPeriodicCheck() {
    // Initial check
    this.checkAvailability();
    
    // Set up interval for periodic checks
    this.intervalId = setInterval(() => {
      this.checkAvailability();
    }, this.checkInterval);
  }

  // Stop periodic checking
  stopPeriodicCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Get current status
  getCurrentStatus() {
    return {
      isAvailable: this.isAvailable,
      lastChecked: this.lastChecked,
      status: this.isAvailable ? 'connected' : 'disconnected'
    };
  }

  // Test connection with custom endpoint
  async testConnection(endpoint = this.healthEndpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);
      const startTime = Date.now();

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        success: response.ok,
        status: response.status,
        responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  // Send message to backend
  async sendToBackend(endpoint, data, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Backend is not available');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      // If request fails, mark backend as unavailable
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        this.isAvailable = false;
        this.notifyListeners({
          isAvailable: false,
          lastChecked: new Date(),
          status: 'disconnected',
          error: error.message
        });
      }
      throw error;
    }
  }
}

// Create singleton instance
const backendChecker = new BackendChecker();

export default backendChecker;