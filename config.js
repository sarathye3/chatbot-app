// AI Chatbot Configuration
// This file can be modified after deployment to update API keys
window.APP_CONFIG = {
  // API Configuration
  API_URL: 'http://localhost:3001/api',
  BACKEND_URL: 'http://localhost:3001',
  
  // AI Provider API Keys
  // Add your actual API keys here
  AI_PROVIDERS: {
    // Groq API Key - Get from https://console.groq.com/
    GROQ_API_KEY: 'your-groq-api-key-here',
    
    // OpenAI API Key - Get from https://platform.openai.com/api-keys
    OPENAI_API_KEY: null, // 'your-openai-api-key-here',
    
    // Claude API Key - Get from https://console.anthropic.com/
    CLAUDE_API_KEY: null, // 'your-claude-api-key-here',
  },
  
  // App Settings
  APP_NAME: 'AI Chatbot',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  USE_MOCK_AI: false,
  DEBUG_MODE: false,
  
  // API Settings
  API_TIMEOUT: 30000, // 30 seconds
  
  // Default AI Configuration
  DEFAULT_AI_CONFIG: {
    model: 'llama3-8b-8192',
    provider: 'groq',
    temperature: 0.7,
    maxTokens: 1000
  }
};