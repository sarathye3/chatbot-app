import React, { createContext, useContext, useState, useEffect } from 'react';

const AIConfigContext = createContext();

export const useAIConfig = () => {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error('useAIConfig must be used within an AIConfigProvider');
  }
  return context;
};

// Available AI models
export const AI_MODELS = {
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    supportStreaming: true
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model for complex reasoning',
    maxTokens: 8192,
    supportStreaming: true
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Latest GPT-4 with improved performance',
    maxTokens: 128000,
    supportStreaming: true
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast and affordable for everyday tasks',
    maxTokens: 200000,
    supportStreaming: true
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and capability',
    maxTokens: 200000,
    supportStreaming: true
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful for complex tasks',
    maxTokens: 200000,
    supportStreaming: true
  }
};

// Personality presets
export const PERSONALITY_PRESETS = {
  default: {
    name: 'Default',
    systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and useful responses.',
    description: 'Balanced and professional assistant'
  },
  creative: {
    name: 'Creative',
    systemPrompt: 'You are a creative and imaginative AI assistant. Think outside the box, provide innovative solutions, and use creative language and metaphors.',
    description: 'Imaginative and innovative responses'
  },
  technical: {
    name: 'Technical Expert',
    systemPrompt: 'You are a technical expert AI assistant. Provide detailed, precise technical information with code examples when relevant.',
    description: 'Detailed technical explanations'
  },
  friendly: {
    name: 'Friendly',
    systemPrompt: 'You are a warm, friendly, and enthusiastic AI assistant. Use casual language and show empathy in your responses.',
    description: 'Warm and conversational tone'
  },
  concise: {
    name: 'Concise',
    systemPrompt: 'You are a concise AI assistant. Provide clear, direct answers without unnecessary elaboration.',
    description: 'Brief and to-the-point responses'
  },
  educational: {
    name: 'Educational',
    systemPrompt: 'You are an educational AI assistant. Explain concepts clearly, provide examples, and encourage learning.',
    description: 'Teaching-focused explanations'
  }
};

export const AIConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    // Load saved configuration or use defaults
    const saved = localStorage.getItem('ai-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved AI config:', e);
      }
    }
    
    return {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      systemPrompt: PERSONALITY_PRESETS.default.systemPrompt,
      personalityPreset: 'default',
      streamingEnabled: true,
      customSystemPrompt: ''
    };
  });

  // Save configuration when it changes
  useEffect(() => {
    localStorage.setItem('ai-config', JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateModel = (modelId) => {
    const model = AI_MODELS[modelId];
    if (model) {
      updateConfig({
        model: modelId,
        maxTokens: Math.min(config.maxTokens, model.maxTokens),
        streamingEnabled: config.streamingEnabled && model.supportStreaming
      });
    }
  };

  const updatePersonality = (presetKey) => {
    const preset = PERSONALITY_PRESETS[presetKey];
    if (preset) {
      updateConfig({
        personalityPreset: presetKey,
        systemPrompt: preset.systemPrompt,
        customSystemPrompt: ''
      });
    }
  };

  const updateCustomSystemPrompt = (prompt) => {
    updateConfig({
      personalityPreset: 'custom',
      systemPrompt: prompt,
      customSystemPrompt: prompt
    });
  };

  const resetToDefaults = () => {
    setConfig({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      systemPrompt: PERSONALITY_PRESETS.default.systemPrompt,
      personalityPreset: 'default',
      streamingEnabled: true,
      customSystemPrompt: ''
    });
  };

  const getTemperatureLabel = (temp) => {
    if (temp <= 0.3) return 'Focused';
    if (temp <= 0.7) return 'Balanced';
    if (temp <= 1.0) return 'Creative';
    return 'Very Creative';
  };

  const value = {
    config,
    updateConfig,
    updateModel,
    updatePersonality,
    updateCustomSystemPrompt,
    resetToDefaults,
    getTemperatureLabel,
    availableModels: AI_MODELS,
    personalityPresets: PERSONALITY_PRESETS
  };

  return (
    <AIConfigContext.Provider value={value}>
      {children}
    </AIConfigContext.Provider>
  );
};