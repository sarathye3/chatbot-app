// Fallback AI API integrations for OpenAI and Claude

class FallbackAIService {
  constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.claudeApiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    this.defaultTimeout = 30000;
    
    // Debug logging
    console.log('=== FallbackAI Service Debug ===');
    console.log('OpenAI API Key:', this.openaiApiKey ? 'Present (' + this.openaiApiKey.substring(0, 10) + '...)' : 'Missing');
    console.log('Claude API Key:', this.claudeApiKey ? 'Present' : 'Missing');
    console.log('Available providers:', this.getAvailableProviders());
  }

  // OpenAI API integration
  async sendToOpenAI(message, options = {}) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = 'You are a helpful AI assistant.'
    } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'openai',
        model,
        text: data.choices[0]?.message?.content || 'No response generated',
        usage: data.usage,
        timestamp: new Date()
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('OpenAI request timed out');
      }
      throw error;
    }
  }

  // Claude API integration
  async sendToClaude(message, options = {}) {
    if (!this.claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    const {
      model = 'claude-3-sonnet-20240229',
      maxTokens = 1000,
      systemPrompt = 'You are a helpful AI assistant.'
    } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [
            { role: 'user', content: message }
          ]
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'claude',
        model,
        text: data.content[0]?.text || 'No response generated',
        usage: data.usage,
        timestamp: new Date()
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Claude request timed out');
      }
      throw error;
    }
  }

  // Groq API integration
  async sendToGroq(message, options = {}) {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const {
      model = 'llama3-8b-8192',
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = 'You are a helpful AI assistant.'
    } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        provider: 'groq',
        model,
        text: data.choices[0]?.message?.content || 'No response generated',
        usage: data.usage,
        timestamp: new Date()
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Groq request timed out');
      }
      throw error;
    }
  }

  // Generic fallback method that routes to the appropriate AI service
  async sendMessage(message, provider, options = {}) {
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'chatgpt':
      case 'gpt':
        return await this.sendToOpenAI(message, options);
        
      case 'claude':
      case 'anthropic':
        return await this.sendToClaude(message, options);
        
      case 'groq':
      case 'llama':
        return await this.sendToGroq(message, options);
        
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  // Check if a provider is available (has API key configured)
  isProviderAvailable(provider) {
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'chatgpt':
      case 'gpt':
        return !!this.openaiApiKey;
        
      case 'claude':
      case 'anthropic':
        return !!this.claudeApiKey;
        
      case 'groq':
      case 'llama':
        return !!this.groqApiKey;
        
      default:
        return false;
    }
  }

  // Get list of available providers
  getAvailableProviders() {
    const providers = [];
    
    if (this.openaiApiKey) {
      providers.push({
        id: 'openai',
        name: 'OpenAI ChatGPT',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview']
      });
    }
    
    if (this.claudeApiKey) {
      providers.push({
        id: 'claude',
        name: 'Anthropic Claude',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229']
      });
    }
    
    if (this.groqApiKey) {
      providers.push({
        id: 'groq',
        name: 'Groq',
        models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it']
      });
    }
    
    return providers;
  }

  // Test connection to a specific provider
  async testProvider(provider) {
    try {
      const testMessage = "Hello, this is a test message. Please respond briefly.";
      const response = await this.sendMessage(testMessage, provider, {
        maxTokens: 50
      });
      
      return {
        success: true,
        provider,
        responseTime: response.timestamp,
        message: 'Connection successful'
      };
      
    } catch (error) {
      return {
        success: false,
        provider,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const fallbackAI = new FallbackAIService();

export default fallbackAI;