// User preferences management for AI fallback settings

class UserPreferencesService {
  constructor() {
    this.storageKey = 'ai-chat-preferences';
    this.defaultPreferences = {
      fallbackProvider: 'openai', // 'openai', 'claude', or 'auto'
      autoFallback: true, // Automatically switch to fallback when backend is down
      preferredModel: {
        openai: 'gpt-3.5-turbo',
        claude: 'claude-3-sonnet-20240229'
      },
      aiSettings: {
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'You are a helpful AI assistant.'
      },
      notifications: {
        showConnectionStatus: true,
        showProviderSwitch: true
      },
      retrySettings: {
        maxRetries: 3,
        retryDelay: 1000 // milliseconds
      }
    };
    this.listeners = new Set();
    this.preferences = this.loadPreferences();
  }

  // Load preferences from localStorage
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new preference additions
        return { ...this.defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    return { ...this.defaultPreferences };
  }

  // Save preferences to localStorage
  savePreferences(preferences = this.preferences) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
      this.notifyListeners(preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  // Get all preferences
  getPreferences() {
    return { ...this.preferences };
  }

  // Get specific preference
  getPreference(key) {
    return this.preferences[key];
  }

  // Update single preference
  updatePreference(key, value) {
    this.preferences = {
      ...this.preferences,
      [key]: value
    };
    this.savePreferences();
    return this.preferences;
  }

  // Update multiple preferences
  updatePreferences(updates) {
    this.preferences = {
      ...this.preferences,
      ...updates
    };
    this.savePreferences();
    return this.preferences;
  }

  // Reset to default preferences
  resetToDefaults() {
    this.preferences = { ...this.defaultPreferences };
    this.savePreferences();
    return this.preferences;
  }

  // Get fallback provider preference
  getFallbackProvider() {
    return this.preferences.fallbackProvider;
  }

  // Set fallback provider
  setFallbackProvider(provider) {
    if (!['openai', 'claude', 'auto'].includes(provider)) {
      throw new Error('Invalid fallback provider. Must be "openai", "claude", or "auto"');
    }
    return this.updatePreference('fallbackProvider', provider);
  }

  // Get preferred model for a provider
  getPreferredModel(provider) {
    return this.preferences.preferredModel[provider] || null;
  }

  // Set preferred model for a provider
  setPreferredModel(provider, model) {
    const preferredModel = {
      ...this.preferences.preferredModel,
      [provider]: model
    };
    return this.updatePreference('preferredModel', preferredModel);
  }

  // Get AI settings
  getAISettings() {
    return { ...this.preferences.aiSettings };
  }

  // Update AI settings
  updateAISettings(settings) {
    const aiSettings = {
      ...this.preferences.aiSettings,
      ...settings
    };
    return this.updatePreference('aiSettings', aiSettings);
  }

  // Check if auto fallback is enabled
  isAutoFallbackEnabled() {
    return this.preferences.autoFallback;
  }

  // Toggle auto fallback
  toggleAutoFallback() {
    return this.updatePreference('autoFallback', !this.preferences.autoFallback);
  }

  // Get notification preferences
  getNotificationSettings() {
    return { ...this.preferences.notifications };
  }

  // Update notification settings
  updateNotificationSettings(settings) {
    const notifications = {
      ...this.preferences.notifications,
      ...settings
    };
    return this.updatePreference('notifications', notifications);
  }

  // Get retry settings
  getRetrySettings() {
    return { ...this.preferences.retrySettings };
  }

  // Update retry settings
  updateRetrySettings(settings) {
    const retrySettings = {
      ...this.preferences.retrySettings,
      ...settings
    };
    return this.updatePreference('retrySettings', retrySettings);
  }

  // Add preference change listener
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of preference changes
  notifyListeners(preferences) {
    this.listeners.forEach(callback => {
      try {
        callback(preferences);
      } catch (error) {
        console.error('Error in preference listener:', error);
      }
    });
  }

  // Export preferences (for backup)
  exportPreferences() {
    return JSON.stringify(this.preferences, null, 2);
  }

  // Import preferences (from backup)
  importPreferences(preferencesJson) {
    try {
      const imported = JSON.parse(preferencesJson);
      // Validate structure
      if (typeof imported !== 'object' || imported === null) {
        throw new Error('Invalid preferences format');
      }
      
      // Merge with defaults to ensure all required fields exist
      this.preferences = { ...this.defaultPreferences, ...imported };
      this.savePreferences();
      return this.preferences;
      
    } catch (error) {
      throw new Error(`Failed to import preferences: ${error.message}`);
    }
  }

  // Validate preferences object
  validatePreferences(preferences) {
    const errors = [];
    
    if (preferences.fallbackProvider && !['openai', 'claude', 'auto'].includes(preferences.fallbackProvider)) {
      errors.push('Invalid fallback provider');
    }
    
    if (preferences.aiSettings) {
      const { temperature, maxTokens } = preferences.aiSettings;
      if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
        errors.push('Temperature must be between 0 and 2');
      }
      if (maxTokens !== undefined && (maxTokens < 1 || maxTokens > 8000)) {
        errors.push('Max tokens must be between 1 and 8000');
      }
    }
    
    return errors;
  }

  // Get preference summary for display
  getPreferenceSummary() {
    const prefs = this.preferences;
    return {
      fallbackProvider: prefs.fallbackProvider,
      autoFallback: prefs.autoFallback,
      preferredModels: Object.keys(prefs.preferredModel).map(provider => ({
        provider,
        model: prefs.preferredModel[provider]
      })),
      temperature: prefs.aiSettings.temperature,
      maxTokens: prefs.aiSettings.maxTokens
    };
  }
}

// Create singleton instance
const userPreferences = new UserPreferencesService();

export default userPreferences;