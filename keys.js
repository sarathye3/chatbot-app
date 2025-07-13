// API Keys Configuration
// This file will be created/updated after deployment
// Format: window.API_KEYS = { GROQ: 'key', OPENAI: 'key', CLAUDE: 'key' }

// Default empty state for initial deployment
if (typeof window !== 'undefined') {
  window.API_KEYS = {
    GROQ: null,
    OPENAI: null,
    CLAUDE: null
  };
}

// Note: This file will be overwritten post-deployment with actual keys