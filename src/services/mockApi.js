// Mock API that simulates real backend endpoints
// This is used as a fallback when actual API endpoints are unavailable

// In-memory storage for conversations (simulates database)
let mockConversations = new Map();
let mockMessageIdCounter = 1;

// Model-specific response variations
const modelPersonalities = {
  'gpt-3.5-turbo': {
    style: 'efficient',
    avgLength: 'medium',
    technical: 'moderate'
  },
  'gpt-4': {
    style: 'thorough',
    avgLength: 'long',
    technical: 'high'
  },
  'gpt-4-turbo': {
    style: 'balanced',
    avgLength: 'medium-long',
    technical: 'high'
  },
  'claude-3-haiku': {
    style: 'concise',
    avgLength: 'short',
    technical: 'moderate'
  },
  'claude-3-sonnet': {
    style: 'balanced',
    avgLength: 'medium',
    technical: 'high'
  },
  'claude-3-opus': {
    style: 'comprehensive',
    avgLength: 'long',
    technical: 'very-high'
  }
};

// Mock responses database with markdown formatting
const mockResponses = [
  "That's an **interesting question**! Let me think about that for a moment.\n\nHere are my thoughts:\n- First consideration\n- Second point\n- Final insight",
  "I understand what you're asking. Here's what I think about that topic:\n\n```javascript\nconst answer = 'This could be helpful';\nconsole.log(answer);\n```",
  "Great point! I'd be happy to help you with that.\n\n> This is an important topic that deserves careful consideration.",
  "That's a thoughtful question. From my perspective, I would say:\n\n## Key Points\n\n1. **First aspect** - detailed explanation\n2. **Second aspect** - more context\n3. **Conclusion** - summary thoughts",
  "I see where you're coming from. Let me provide some insights:\n\n- ✅ This approach works well\n- ⚠️ Consider this limitation\n- 💡 Here's a better alternative",
  "Thanks for sharing that with me. Here's my take:\n\n### Analysis\n\nThe situation you've described is quite common. Many people face similar challenges, and there are several ways to approach this.",
  "That's definitely something worth exploring. Let me break it down:\n\n```python\ndef solve_problem():\n    return \"Step by step solution\"\n```\n\nThis code demonstrates the concept.",
  "I appreciate you bringing this up. Based on what you've told me:\n\n> \"The best solutions often come from understanding the problem deeply first.\"\n\nLet me elaborate on this principle.",
  "That's a complex topic, but I'll do my best to explain it clearly:\n\n## Overview\n\n**Key concepts:**\n- Fundamental principle\n- Practical application\n- Real-world implications",
  "Interesting! I have some thoughts that might be helpful:\n\n1. Consider this perspective\n2. Think about these factors\n3. Here's what I recommend\n\nLet me know if you'd like me to elaborate on any of these points!",
  "I can definitely help you with that. Let me walk you through it **step by step**:\n\n### Step 1: Preparation\nFirst, you'll need to...\n\n### Step 2: Implementation\nNext, proceed with...\n\n### Step 3: Verification\nFinally, confirm that...",
  "That's a great question that many people wonder about. Here's what I know:\n\n```markdown\n# Important Information\n\n- Fact 1: Detailed explanation\n- Fact 2: Supporting evidence\n- Fact 3: Practical implications\n```",
  "I'm glad you asked! This is actually one of my **favorite topics** to discuss.\n\n[Learn more about this topic](https://example.com)\n\nThe fascinating thing about this subject is how it connects to so many other areas.",
  "That's something I've been thinking about lately too. Here's my perspective:\n\n> The key insight is that *simplicity* often leads to the most elegant solutions.\n\nWhat do you think about this approach?",
  "Thanks for the question! I think there are several ways to approach this:\n\n| Approach | Pros | Cons |\n|----------|------|------|\n| Method A | Fast | Limited |\n| Method B | Flexible | Complex |\n| Method C | Simple | Slower |",
  "You've raised an **excellent point**. Let me explain how I see it:\n\n### The Big Picture\n\nThis connects to broader themes in the field. Consider how this relates to:\n\n- Historical context\n- Current trends\n- Future implications",
  "That's a really good observation. Here's what I would add:\n\n```typescript\ninterface Solution {\n  approach: string;\n  benefits: string[];\n  considerations: string[];\n}\n```\n\nThis structure helps organize our thinking.",
  "I appreciate your curiosity about this topic. Let me share some insights:\n\n## Core Principles\n\n1. **Understanding** comes first\n2. **Practice** reinforces learning\n3. **Application** demonstrates mastery\n\nEach step builds on the previous one.",
  "That's exactly the kind of question I love to explore. Here's my thoughts:\n\n### Quick Answer\n*Yes, this is definitely possible.*\n\n### Detailed Explanation\nThe reason this works is because...\n\n### Next Steps\n- Try this approach\n- Monitor the results\n- Adjust as needed",
  "You're absolutely right to wonder about that. Let me clarify:\n\n> \"Clarity comes from asking the right questions, not just finding quick answers.\"\n\nThis principle applies perfectly to your situation. Here's how..."
];

// Context-aware responses based on keywords
const contextualResponses = {
  greeting: [
    "Hello! Great to meet you. How can I assist you today?",
    "Hi there! I'm excited to help you with whatever you need.",
    "Hey! Thanks for reaching out. What can I do for you?"
  ],
  help: [
    "I'm here to help! I can assist with questions, provide information, or just have a conversation.",
    "Of course! I'd be happy to help you with whatever you need. What's on your mind?",
    "I'm designed to be helpful across a wide range of topics. What would you like assistance with?"
  ],
  thanks: [
    "You're very welcome! I'm glad I could help.",
    "Happy to help! Feel free to ask if you have any other questions.",
    "My pleasure! Is there anything else I can assist you with?"
  ],
  goodbye: [
    "Goodbye! It was great chatting with you.",
    "Take care! Feel free to come back anytime.",
    "See you later! Hope to chat again soon."
  ]
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getContextualResponse = (message, aiConfig = {}) => {
  const lowerMessage = message.toLowerCase();
  
  // Get base response
  let baseResponse;
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    baseResponse = getRandomFromArray(contextualResponses.greeting);
  } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
    baseResponse = getRandomFromArray(contextualResponses.help);
  } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    baseResponse = getRandomFromArray(contextualResponses.thanks);
  } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    baseResponse = getRandomFromArray(contextualResponses.goodbye);
  } else {
    baseResponse = getRandomFromArray(mockResponses);
  }
  
  // Apply AI configuration modifications
  return applyAIConfigToResponse(baseResponse, aiConfig);
};

const applyAIConfigToResponse = (response, config) => {
  if (!config) return response;
  
  const { model, temperature, personalityPreset, systemPrompt } = config;
  
  // Apply model-specific characteristics
  if (model && modelPersonalities[model]) {
    const modelProps = modelPersonalities[model];
    
    // Adjust response length based on model
    if (modelProps.avgLength === 'short' && response.length > 200) {
      response = response.substring(0, 150) + '...';
    } else if (modelProps.avgLength === 'long' && response.length < 300) {
      response += '\n\nAdditionally, this topic connects to several interesting concepts that might be worth exploring further.';
    }
    
    // Add model-specific style markers
    if (modelProps.style === 'concise') {
      response = response.replace(/\n\n/g, '\n').replace(/### /g, '**').replace(/## /g, '**');
    } else if (modelProps.style === 'comprehensive') {
      response += '\n\n*Note: This analysis considers multiple perspectives and edge cases.*';
    }
  }
  
  // Apply temperature-based randomness
  if (temperature !== undefined) {
    if (temperature < 0.3) {
      // Low temperature: more focused and consistent
      response = response.replace(/!+/g, '.').replace(/\*\*/g, '');
    } else if (temperature > 1.2) {
      // High temperature: more creative and varied
      const creativeAdditions = [
        ' 🚀',
        ' ✨',
        '\n\n*Interesting perspective to consider!*',
        '\n\n💭 *What do you think about this approach?*'
      ];
      response += getRandomFromArray(creativeAdditions);
    }
  }
  
  // Apply personality-specific modifications
  if (personalityPreset) {
    switch (personalityPreset) {
      case 'creative':
        response = '🎨 ' + response + '\n\n*Creative insight: ' + getRandomFromArray([
          'This sparks so many innovative possibilities!',
          'I love exploring unique angles on this topic.',
          'There are countless creative ways to approach this.'
        ]) + '*';
        break;
      case 'technical':
        response = response.replace(/\.\.\./g, ' with specific implementation details.');
        if (!response.includes('```')) {
          response += '\n\n```\n// Technical implementation notes\n// Consider: error handling, edge cases, performance\n```';
        }
        break;
      case 'friendly':
        response = '😊 ' + response.replace(/\./g, '! ');
        response += '\n\nI hope this helps! Feel free to ask me anything else. 🌟';
        break;
      case 'concise':
        response = response.split('\n\n')[0].replace(/\*\*/g, '').replace(/###? /g, '');
        break;
      case 'educational':
        response += '\n\n**Learning objective:** Understanding this concept will help you build foundational knowledge for more advanced topics.\n\n📚 *Would you like me to explain any specific part in more detail?*';
        break;
    }
  }
  
  // Apply custom system prompt influence
  if (systemPrompt && systemPrompt.includes('code')) {
    response += '\n\n```\n// Example implementation\nconsole.log("Example code based on discussion");\n```';
  }
  
  return response;
};

const createMessage = (text, isBot = false, conversationId = null) => {
  return {
    id: mockMessageIdCounter++,
    text,
    isBot,
    timestamp: new Date().toISOString(),
    conversationId
  };
};

// Mock API Functions (simulating real endpoints)

export const mockApiService = {
  // Simulate health check
  async checkHealth() {
    await delay(100); // Simulate network delay
    return {
      success: true,
      data: { status: 'OK', message: 'Mock AI Chatbot API is running' }
    };
  },

  // Simulate getting all conversations
  async getConversations() {
    await delay(200);
    
    const conversationsList = Array.from(mockConversations.entries()).map(([id, conv]) => ({
      id,
      title: conv.title,
      lastMessage: conv.messages[conv.messages.length - 1],
      messageCount: conv.messages.length,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }));
    
    return {
      success: true,
      data: conversationsList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    };
  },

  // Simulate creating new conversation
  async createConversation() {
    await delay(300);
    
    const conversationId = `mock_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const welcomeMessage = createMessage(
      "Hello! I'm your AI assistant. How can I help you today?",
      true,
      conversationId
    );
    
    const conversation = {
      id: conversationId,
      title: 'New Chat',
      messages: [welcomeMessage],
      createdAt: now,
      updatedAt: now
    };
    
    mockConversations.set(conversationId, conversation);
    
    return {
      success: true,
      data: conversation
    };
  },

  // Simulate getting specific conversation
  async getConversation(conversationId) {
    await delay(150);
    
    const conversation = mockConversations.get(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return {
      success: true,
      data: conversation
    };
  },

  // Simulate sending message to conversation
  async sendMessage(conversationId, message, aiConfig = {}) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message is required and must be a non-empty string');
    }
    
    let conversation = mockConversations.get(conversationId);
    
    // Create conversation if it doesn't exist
    if (!conversation) {
      const now = new Date().toISOString();
      conversation = {
        id: conversationId,
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        messages: [],
        createdAt: now,
        updatedAt: now
      };
      mockConversations.set(conversationId, conversation);
    }
    
    // Add user message
    const userMessage = createMessage(message.trim(), false, conversationId);
    conversation.messages.push(userMessage);
    
    // Update conversation title if it's the first user message
    if (conversation.messages.filter(m => !m.isBot).length === 1) {
      conversation.title = message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
    
    // Check if streaming is enabled
    const isStreaming = aiConfig && aiConfig.streamingEnabled;
    let aiMessage;
    
    if (isStreaming) {
      // For streaming, create initial message and return it
      // The actual streaming would be handled differently in real implementation
      aiMessage = createMessage('', true, conversationId);
      conversation.messages.push(aiMessage);
      
      // Simulate initial delay
      await delay(500);
      
      // Generate full response
      const fullResponse = getContextualResponse(message, aiConfig);
      
      // Update the message with full response
      aiMessage.text = fullResponse;
      aiMessage.isStreaming = false;
    } else {
      // Simulate AI processing delay
      const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
      await delay(processingTime);
      
      // Generate AI response based on configuration
      const aiResponseText = getContextualResponse(message, aiConfig);
      aiMessage = createMessage(aiResponseText, true, conversationId);
      conversation.messages.push(aiMessage);
    }
    
    // Update conversation timestamp
    conversation.updatedAt = new Date().toISOString();
    
    return {
      success: true,
      data: {
        userMessage,
        aiMessage,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          messageCount: conversation.messages.length
        }
      }
    };
  },

  // Simulate deleting conversation
  async deleteConversation(conversationId) {
    await delay(200);
    
    const deleted = mockConversations.delete(conversationId);
    
    if (!deleted) {
      throw new Error('Conversation not found');
    }
    
    return {
      success: true,
      message: 'Conversation deleted successfully'
    };
  },

  // Simulate clearing all conversations
  async clearAllConversations() {
    await delay(250);
    
    mockConversations.clear();
    mockMessageIdCounter = 1;
    
    return {
      success: true,
      message: 'All conversations cleared'
    };
  }
};

// Legacy function for backward compatibility (if needed)
export const sendMessage = async (message, aiConfig) => {
  await delay(Math.random() * 1000 + 1000); // 1-2 seconds
  return getContextualResponse(message, aiConfig);
};

export default mockApiService;