// API Keys Configuration
// This file will be created/updated after deployment
// Format: window.API_KEYS = { GROQ: 'key', OPENAI: 'key', CLAUDE: 'key' }

  if (typeof window !== 'undefined') {
    window.API_KEYS = {
      "GROQ": "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",
      "OPENAI": null,
      "CLAUDE": null
    };

    // Debug log to confirm keys are loaded
    console.log('🔑 API Keys loaded from keys.js');
    console.log('Available providers:', Object.keys(window.API_KEYS).filter(k => window.API_KEYS[k]));
  }

// Note: This file will be overwritten post-deployment with actual keys
