// Unified message service with backend checking and fallback logic

import backendChecker from './backendChecker';
import fallbackAI from './fallbackAI';
import userPreferences from './userPreferences';

class MessageService {
  constructor() {
    this.isProcessing = false;
    this.messageHistory = [];
    this.currentProvider = null;
    this.listeners = new Set();
  }

  // Add listener for message service events
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify listeners of events
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in message service listener:', error);
      }
    });
  }

  // Main method to send a message with fallback logic
  async sendMessage(message, options = {}) {
    if (this.isProcessing) {
      throw new Error('Another message is currently being processed');
    }

    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Notify listeners that processing started
      this.notifyListeners({
        type: 'processing_started',
        message,
        timestamp: new Date()
      });

      // Get user preferences
      const preferences = userPreferences.getPreferences();
      const aiSettings = preferences.aiSettings;

      // Step 1: Check backend availability
      const backendStatus = await this.checkBackendAvailability();
      
      if (backendStatus.isAvailable) {
        // Try backend first
        try {
          const response = await this.sendToBackend(message, {
            ...options,
            ...aiSettings
          });
          
          this.currentProvider = 'backend';
          const result = {
            success: true,
            provider: 'backend',
            text: response.text || response.message,
            processingTime: Date.now() - startTime,
            timestamp: new Date(),
            metadata: response.metadata || {}
          };

          this.addToHistory(message, result);
          this.notifyListeners({
            type: 'message_success',
            provider: 'backend',
            result
          });

          return result;

        } catch (backendError) {
          console.warn('Backend request failed:', backendError.message);
          
          // If auto fallback is disabled, throw the error
          if (!preferences.autoFallback) {
            throw backendError;
          }

          // Continue to fallback logic
          this.notifyListeners({
            type: 'backend_failed',
            error: backendError.message,
            fallbackEnabled: true
          });
        }
      }

      // Step 2: Use fallback AI or mock AI
      const useMockAI = process.env.REACT_APP_USE_MOCK_AI === 'true';
      
      let fallbackResult;
      if (useMockAI) {
        // Use mock AI (no API keys needed)
        fallbackResult = await this.useMockAI(message, options);
      } else {
        // Use real AI APIs
        fallbackResult = await this.useFallbackAI(message, {
          ...options,
          ...aiSettings
        });
      }

      const result = {
        ...fallbackResult,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(message, result);
      this.notifyListeners({
        type: 'message_success',
        provider: result.provider,
        result
      });

      return result;

    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

      this.notifyListeners({
        type: 'message_error',
        error: error.message,
        result: errorResult
      });

      throw error;

    } finally {
      this.isProcessing = false;
    }
  }

  // Check backend availability
  async checkBackendAvailability() {
    try {
      return await backendChecker.checkAvailability();
    } catch (error) {
      return {
        isAvailable: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Send message to backend
  async sendToBackend(message, options = {}) {
    const endpoint = options.endpoint || '/api/chat/message';
    const payload = {
      message,
      options: {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        systemPrompt: options.systemPrompt
      }
    };

    return await backendChecker.sendToBackend(endpoint, payload, {
      timeout: options.timeout || 30000,
      headers: options.headers
    });
  }

  // Use fallback AI based on user preferences
  async useFallbackAI(message, options = {}) {
    console.log('=== Using Fallback AI ===');
    console.log('Message:', message);
    console.log('Options:', options);
    
    const preferences = userPreferences.getPreferences();
    let provider = options.provider || preferences.fallbackProvider;
    
    console.log('Preferred provider:', provider);

    // If provider is 'auto', determine the best available provider
    if (provider === 'auto') {
      provider = this.selectBestProvider();
      console.log('Auto-selected provider:', provider);
    }

    // Check available providers first
    const availableProviders = fallbackAI.getAvailableProviders();
    console.log('Available providers:', availableProviders);
    
    if (availableProviders.length === 0) {
      console.error('No providers available - checking environment variables...');
      console.log('REACT_APP_OPENAI_API_KEY present:', !!process.env.REACT_APP_OPENAI_API_KEY);
      console.log('REACT_APP_CLAUDE_API_KEY present:', !!process.env.REACT_APP_CLAUDE_API_KEY);
      throw new Error('No fallback AI providers are configured. Please add API keys in environment variables and restart the development server.');
    }

    // Check if the preferred provider is available
    if (!fallbackAI.isProviderAvailable(provider)) {
      console.log(`Provider ${provider} not available, switching to ${availableProviders[0].id}`);
      provider = availableProviders[0].id;
      
      this.notifyListeners({
        type: 'provider_switched',
        from: preferences.fallbackProvider,
        to: provider,
        reason: 'preferred_provider_unavailable'
      });
    }

    // Get preferred model for the provider
    const model = options.model || preferences.preferredModel[provider];

    // Prepare AI options
    const aiOptions = {
      model,
      temperature: options.temperature || preferences.aiSettings.temperature,
      maxTokens: options.maxTokens || preferences.aiSettings.maxTokens,
      systemPrompt: options.systemPrompt || preferences.aiSettings.systemPrompt
    };

    // Retry logic
    const retrySettings = preferences.retrySettings;
    let lastError;

    for (let attempt = 1; attempt <= retrySettings.maxRetries; attempt++) {
      try {
        this.notifyListeners({
          type: 'fallback_attempt',
          provider,
          attempt,
          maxAttempts: retrySettings.maxRetries
        });

        const response = await fallbackAI.sendMessage(message, provider, aiOptions);
        this.currentProvider = provider;
        
        return response;

      } catch (error) {
        lastError = error;
        console.warn(`Fallback AI attempt ${attempt} failed:`, error.message);

        if (attempt < retrySettings.maxRetries) {
          await this.delay(retrySettings.retryDelay * attempt);
        }
      }
    }

    throw new Error(`All fallback attempts failed. Last error: ${lastError.message}`);
  }

  // Use mock AI (no API keys needed)
  async useMockAI(message, options = {}) {
    console.log('=== Using Mock AI ===');
    console.log('Message:', message);
    
    // Import the existing mock API service
    const mockApiService = await import('./mockApi');
    
    // Use the existing mock API with a temporary conversation ID
    const tempConvId = 'temp_mock_conversation';
    const mockConfig = {
      temperature: options.temperature || 0.7,
      personalityPreset: options.personalityPreset || 'default',
      model: 'mock-ai'
    };
    
    const response = await mockApiService.default.sendMessage(tempConvId, message, mockConfig);
    
    return {
      success: true,
      provider: 'mock-ai',
      model: 'mock-ai',
      text: response.data.aiMessage.text,
      timestamp: new Date()
    };
  }

  // Select the best available provider automatically
  selectBestProvider() {
    const availableProviders = fallbackAI.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // Priority order: prefer OpenAI, then Claude
    const priorities = ['openai', 'claude'];
    
    for (const priority of priorities) {
      const provider = availableProviders.find(p => p.id === priority);
      if (provider) {
        return provider.id;
      }
    }

    // Return first available if no priority match
    return availableProviders[0].id;
  }

  // Get current status
  getStatus() {
    const backendStatus = backendChecker.getCurrentStatus();
    const preferences = userPreferences.getPreferences();
    const availableProviders = fallbackAI.getAvailableProviders();

    return {
      backend: backendStatus,
      fallback: {
        enabled: preferences.autoFallback,
        preferredProvider: preferences.fallbackProvider,
        availableProviders: availableProviders.map(p => p.id),
        currentProvider: this.currentProvider
      },
      isProcessing: this.isProcessing
    };
  }

  // Test all available services
  async testAllServices() {
    const results = {
      backend: null,
      fallback: {}
    };

    // Test backend
    try {
      results.backend = await backendChecker.testConnection();
    } catch (error) {
      results.backend = {
        success: false,
        error: error.message
      };
    }

    // Test each available fallback provider
    const availableProviders = fallbackAI.getAvailableProviders();
    for (const provider of availableProviders) {
      try {
        results.fallback[provider.id] = await fallbackAI.testProvider(provider.id);
      } catch (error) {
        results.fallback[provider.id] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }

  // Add message to history
  addToHistory(message, response) {
    this.messageHistory.push({
      id: Date.now(),
      message,
      response,
      timestamp: new Date()
    });

    // Keep only last 100 messages
    if (this.messageHistory.length > 100) {
      this.messageHistory = this.messageHistory.slice(-100);
    }
  }

  // Get message history
  getHistory() {
    return [...this.messageHistory];
  }

  // Clear message history
  clearHistory() {
    this.messageHistory = [];
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get detailed diagnostics
  async getDiagnostics() {
    const status = this.getStatus();
    const testResults = await this.testAllServices();
    const preferences = userPreferences.getPreferenceSummary();

    return {
      status,
      testResults,
      preferences,
      history: {
        totalMessages: this.messageHistory.length,
        recentMessages: this.messageHistory.slice(-5)
      }
    };
  }
}

// Create singleton instance
const messageService = new MessageService();

export default messageService;