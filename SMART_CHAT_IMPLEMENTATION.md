# Smart Chat Implementation Guide

This guide explains how to implement client-side logic in a React app to check backend server availability and use fallback AI APIs with user preferences.

## 🚀 Features Implemented

- ✅ Backend availability checking with periodic monitoring
- ✅ Fallback AI API integrations (OpenAI ChatGPT, Anthropic Claude)
- ✅ User preference management with localStorage persistence
- ✅ Unified message service with automatic fallback logic
- ✅ React hooks for easy state management
- ✅ Loading and error state UI components
- ✅ Toast notifications and status indicators
- ✅ Retry logic and connection diagnostics

## 📁 File Structure

```
src/
├── services/
│   ├── backendChecker.js      # Backend availability monitoring
│   ├── fallbackAI.js          # OpenAI & Claude API integrations
│   ├── userPreferences.js     # User settings management
│   └── messageService.js      # Unified message handling with fallback
├── hooks/
│   └── useMessageService.js   # React hooks for state management
├── components/
│   ├── LoadingStates.js       # Loading/error UI components
│   ├── LoadingStates.module.css
│   ├── SmartChatInterface.js  # Complete chat implementation example
│   └── SmartChatInterface.module.css
└── SMART_CHAT_IMPLEMENTATION.md  # This documentation
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in your project root:

```env
# Backend Configuration
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api

# AI API Keys (add at least one for fallback functionality)
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here
REACT_APP_CLAUDE_API_KEY=your-claude-api-key-here
```

### Install Dependencies

```bash
npm install
# No additional dependencies required - uses native fetch API
```

## 🎯 Quick Start Usage

### Basic Implementation

```jsx
import React from 'react';
import { useMessageService } from './hooks/useMessageService';
import { MessageLoading, ErrorDisplay } from './components/LoadingStates';

function MyChatComponent() {
  const {
    isLoading,
    error,
    messages,
    sendMessage,
    clearError
  } = useMessageService();

  const handleSendMessage = async (text) => {
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div>
      {/* Messages */}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.isUser ? 'You' : 'AI'}:</strong> {msg.text}
        </div>
      ))}
      
      {/* Loading state */}
      {isLoading && <MessageLoading />}
      
      {/* Error handling */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onDismiss={clearError}
          onRetry={() => handleSendMessage('retry')}
        />
      )}
      
      {/* Input form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.target.message.value;
        if (input.trim()) {
          handleSendMessage(input);
          e.target.reset();
        }
      }}>
        <input name="message" placeholder="Type message..." />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

### Advanced Implementation with All Features

See `SmartChatInterface.js` for a complete implementation that includes:
- Connection status monitoring
- Provider switching
- User preferences
- Toast notifications
- Retry logic
- Dark theme support

## 🔧 Service Configuration

### Backend Checker Configuration

```javascript
import backendChecker from './services/backendChecker';

// Configure check interval (default: 30 seconds)
backendChecker.checkInterval = 15000; // 15 seconds

// Configure timeout (default: 5 seconds)
backendChecker.timeoutDuration = 3000; // 3 seconds

// Start monitoring
backendChecker.startPeriodicCheck();

// Listen to status changes
const unsubscribe = backendChecker.addStatusListener((status) => {
  console.log('Backend status:', status);
});
```

### User Preferences Configuration

```javascript
import userPreferences from './services/userPreferences';

// Set fallback AI provider
userPreferences.setFallbackProvider('openai'); // 'openai', 'claude', or 'auto'

// Configure AI settings
userPreferences.updateAISettings({
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful assistant.'
});

// Enable/disable auto fallback
userPreferences.toggleAutoFallback();
```

## 🎨 UI Components

### Available Components

1. **MessageLoading** - Shows typing indicator with provider info
2. **ConnectionStatus** - Displays backend connection status
3. **ErrorDisplay** - Error messages with retry/dismiss options
4. **ProviderSwitchNotification** - Notifies when AI provider changes
5. **LoadingSpinner** - General loading indicator
6. **ServiceStatusGrid** - Grid showing all service statuses
7. **TypingIndicator** - AI typing animation
8. **Toast** - Notification messages

### Example Usage

```jsx
import {
  ConnectionStatus,
  ErrorDisplay,
  Toast
} from './components/LoadingStates';

function MyComponent() {
  const { status } = useBackendStatus();
  
  return (
    <div>
      <ConnectionStatus status={status} showDetails />
      <ErrorDisplay 
        error="Connection failed" 
        onRetry={() => console.log('retry')}
      />
      <Toast 
        message="Settings saved!" 
        type="success" 
        onClose={() => console.log('closed')}
      />
    </div>
  );
}
```

## 🔌 API Integration Details

### Message Service Flow

1. **Check Backend** - Test if your server is available
2. **Try Backend** - Send message to your server API
3. **Fallback AI** - If backend fails, use configured AI provider
4. **Retry Logic** - Automatic retries with exponential backoff
5. **Error Handling** - Graceful error states with user actions

### Backend API Expected Format

Your backend should handle POST requests to `/api/chat/message`:

```javascript
// Request format
{
  "message": "User's message text",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "systemPrompt": "You are a helpful assistant."
  }
}

// Expected response format
{
  "text": "AI response text",
  "metadata": {
    "model": "your-model-name",
    "tokens": 150
  }
}
```

### Fallback AI Configuration

The system supports:
- **OpenAI**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Claude**: Haiku, Sonnet, Opus
- **Auto**: Automatically selects best available provider

## 📱 React Hooks Reference

### useMessageService()

Main hook for chat functionality:

```javascript
const {
  isLoading,           // boolean - message being processed
  error,               // string - current error message
  messages,            // array - conversation messages
  status,              // object - service status info
  currentProvider,     // string - current AI provider
  sendMessage,         // function - send new message
  clearMessages,       // function - clear conversation
  retryLastMessage,    // function - retry failed message
  clearError          // function - dismiss current error
} = useMessageService();
```

### useBackendStatus()

Monitor backend connection:

```javascript
const {
  status,              // object - connection status
  isChecking,          // boolean - currently checking
  checkNow            // function - manual check
} = useBackendStatus();
```

### useUserPreferences()

Manage user settings:

```javascript
const {
  preferences,         // object - current preferences
  updatePreference,    // function - update single setting
  updatePreferences,   // function - update multiple settings
  resetToDefaults,     // function - reset all settings
  setFallbackProvider, // function - set AI provider
  toggleAutoFallback   // function - toggle auto fallback
} = useUserPreferences();
```

## 🔍 Error Handling Patterns

### Automatic Retry Logic

```javascript
// The service automatically retries failed requests
const retrySettings = {
  maxRetries: 3,
  retryDelay: 1000 // milliseconds, increases with each attempt
};
```

### Manual Error Handling

```javascript
try {
  await sendMessage("Hello");
} catch (error) {
  if (error.message.includes('Backend')) {
    // Backend-specific error
    console.log('Server is down, using fallback');
  } else if (error.message.includes('API key')) {
    // AI API configuration error
    console.log('Please configure AI API keys');
  } else {
    // General error
    console.log('Unknown error:', error.message);
  }
}
```

## 🎨 Styling and Theming

The components support dark theme via CSS custom properties:

```css
[data-theme="dark"] .component {
  background: #2d3748;
  color: #e2e8f0;
}
```

Apply dark theme by setting the `data-theme` attribute:

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

## 🚀 Production Deployment

### Security Considerations

1. **API Keys**: Store in environment variables, not in client code
2. **CORS**: Configure your backend to allow requests from your domain
3. **Rate Limiting**: Implement rate limiting for AI API calls
4. **Validation**: Validate and sanitize user inputs

### Performance Optimization

1. **Debouncing**: Add input debouncing for real-time features
2. **Caching**: Cache AI responses for repeated questions
3. **Lazy Loading**: Load AI providers only when needed
4. **Connection Pooling**: Reuse connections when possible

### Monitoring

```javascript
// Get comprehensive diagnostics
const diagnostics = await messageService.getDiagnostics();
console.log('Service status:', diagnostics);

// Test all services
const testResults = await messageService.testAllServices();
console.log('Service tests:', testResults);
```

## 🤝 Contributing

To extend this implementation:

1. **Add New AI Providers**: Extend `fallbackAI.js` with new providers
2. **Custom UI Components**: Create new components in `LoadingStates.js`
3. **Enhanced Preferences**: Add new settings in `userPreferences.js`
4. **Advanced Features**: Extend `messageService.js` with new capabilities

## 📝 License

This implementation is provided as a comprehensive example for educational and development purposes. Feel free to adapt and modify for your specific needs.