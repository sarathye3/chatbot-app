// React hooks for message service state management

import { useState, useEffect, useCallback, useRef } from 'react';
import messageService from '../services/messageService';
import backendChecker from '../services/backendChecker';
import userPreferences from '../services/userPreferences';

// Main hook for message service functionality
export const useMessageService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize service listeners
  useEffect(() => {
    // Update status on mount
    const updateStatus = () => {
      if (isMountedRef.current) {
        setStatus(messageService.getStatus());
      }
    };

    updateStatus();

    // Listen to message service events
    const unsubscribeMessageService = messageService.addListener((event) => {
      if (!isMountedRef.current) return;

      switch (event.type) {
        case 'processing_started':
          setIsLoading(true);
          setError(null);
          break;
          
        case 'message_success':
          setIsLoading(false);
          setCurrentProvider(event.provider);
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: event.result.text,
            provider: event.provider,
            timestamp: event.result.timestamp,
            isUser: false
          }]);
          break;
          
        case 'message_error':
          setIsLoading(false);
          setError(event.error);
          break;
          
        case 'provider_switched':
          setCurrentProvider(event.to);
          break;
          
        default:
          break;
      }
      
      updateStatus();
    });

    // Listen to backend status changes
    const unsubscribeBackend = backendChecker.addStatusListener((backendStatus) => {
      if (isMountedRef.current) {
        updateStatus();
      }
    });

    return () => {
      unsubscribeMessageService();
      unsubscribeBackend();
    };
  }, []);

  // Send message function
  const sendMessage = useCallback(async (message, options = {}) => {
    if (!message || !message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    // Add user message to the list
    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);

    try {
      await messageService.sendMessage(message, options);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling is done in the event listener
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    messageService.clearHistory();
  }, []);

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.isUser);

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.text);
    }
  }, [messages, sendMessage]);

  return {
    // State
    isLoading,
    error,
    messages,
    status,
    currentProvider,
    
    // Actions
    sendMessage,
    clearMessages,
    retryLastMessage,
    
    // Utilities
    clearError: () => setError(null)
  };
};

// Hook for backend status monitoring
export const useBackendStatus = () => {
  const [status, setStatus] = useState(backendChecker.getCurrentStatus());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = backendChecker.addStatusListener((newStatus) => {
      setStatus(newStatus);
    });

    // Start periodic checking
    backendChecker.startPeriodicCheck();

    return () => {
      unsubscribe();
      backendChecker.stopPeriodicCheck();
    };
  }, []);

  const checkNow = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await backendChecker.checkAvailability();
      setStatus(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    status,
    isChecking,
    checkNow
  };
};

// Hook for user preferences management
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(userPreferences.getPreferences());

  useEffect(() => {
    const unsubscribe = userPreferences.addListener((newPreferences) => {
      setPreferences(newPreferences);
    });

    return unsubscribe;
  }, []);

  const updatePreference = useCallback((key, value) => {
    return userPreferences.updatePreference(key, value);
  }, []);

  const updatePreferences = useCallback((updates) => {
    return userPreferences.updatePreferences(updates);
  }, []);

  const resetToDefaults = useCallback(() => {
    return userPreferences.resetToDefaults();
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetToDefaults,
    
    // Convenience methods
    setFallbackProvider: useCallback((provider) => {
      return userPreferences.setFallbackProvider(provider);
    }, []),
    
    toggleAutoFallback: useCallback(() => {
      return userPreferences.toggleAutoFallback();
    }, []),
    
    updateAISettings: useCallback((settings) => {
      return userPreferences.updateAISettings(settings);
    }, [])
  };
};

// Hook for service diagnostics
export const useServiceDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await messageService.getDiagnostics();
      setDiagnostics(result);
      return result;
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testAllServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await messageService.testAllServices();
      return result;
    } catch (error) {
      console.error('Failed to test services:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    diagnostics,
    isLoading,
    runDiagnostics,
    testAllServices
  };
};

// Hook for managing loading states across multiple operations
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isLoading: (key) => loadingStates[key] || false
  };
};