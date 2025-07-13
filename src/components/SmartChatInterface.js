// Smart Chat Interface - Example implementation using the new services

import React, { useState, useEffect } from 'react';
import { 
  useMessageService, 
  useBackendStatus, 
  useUserPreferences 
} from '../hooks/useMessageService';
import {
  MessageLoading,
  ConnectionStatus,
  ErrorDisplay,
  ProviderSwitchNotification,
  TypingIndicator,
  Toast
} from './LoadingStates';
import styles from './SmartChatInterface.module.css';

const SmartChatInterface = () => {
  // Hooks for state management
  const {
    isLoading,
    error,
    messages,
    status,
    currentProvider,
    sendMessage,
    clearMessages,
    retryLastMessage,
    clearError
  } = useMessageService();

  const { status: backendStatus, checkNow } = useBackendStatus();
  const { preferences, updatePreference, setFallbackProvider } = useUserPreferences();

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [showProviderSwitch, setShowProviderSwitch] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      addToast(`Failed to send message: ${error.message}`, 'error');
    }
  };

  // Add toast notification
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle provider switch
  const handleProviderSwitch = (provider) => {
    setFallbackProvider(provider);
    setShowProviderSwitch(false);
    addToast(`Switched to ${provider}`, 'success');
  };

  // Listen for provider changes
  useEffect(() => {
    if (currentProvider && currentProvider !== 'backend') {
      addToast(`Now using ${currentProvider} AI`, 'info');
    }
  }, [currentProvider]);

  return (
    <div className={styles.chatInterface}>
      {/* Header with connection status */}
      <div className={styles.header}>
        <h1>Smart Chat</h1>
        <div className={styles.headerControls}>
          <ConnectionStatus status={backendStatus} showDetails />
          <button 
            className={styles.checkButton}
            onClick={checkNow}
            title="Check connection"
          >
            🔄
          </button>
          <button 
            className={styles.settingsButton}
            onClick={() => setShowProviderSwitch(!showProviderSwitch)}
            title="Provider settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Provider switch dropdown */}
      {showProviderSwitch && (
        <div className={styles.providerSwitch}>
          <h3>Fallback AI Provider</h3>
          <div className={styles.providerOptions}>
            <button
              className={`${styles.providerButton} ${preferences.fallbackProvider === 'openai' ? styles.active : ''}`}
              onClick={() => handleProviderSwitch('openai')}
            >
              OpenAI ChatGPT
            </button>
            <button
              className={`${styles.providerButton} ${preferences.fallbackProvider === 'claude' ? styles.active : ''}`}
              onClick={() => handleProviderSwitch('claude')}
            >
              Anthropic Claude
            </button>
            <button
              className={`${styles.providerButton} ${preferences.fallbackProvider === 'auto' ? styles.active : ''}`}
              onClick={() => handleProviderSwitch('auto')}
            >
              Auto Select
            </button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <h2>Welcome to Smart Chat! 👋</h2>
            <p>
              I'll automatically use your server when available, or fallback to {preferences.fallbackProvider} AI.
            </p>
            <div className={styles.statusInfo}>
              <p>
                <strong>Backend:</strong> {backendStatus.isAvailable ? '✅ Connected' : '❌ Unavailable'}
              </p>
              <p>
                <strong>Fallback:</strong> {preferences.fallbackProvider} 
                {preferences.autoFallback ? ' (Auto)' : ' (Manual)'}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
          >
            <div className={styles.messageContent}>
              {message.text}
            </div>
            {!message.isUser && message.provider && (
              <div className={styles.messageProvider}>
                via {message.provider}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className={styles.loadingMessage}>
            <TypingIndicator provider={currentProvider} />
          </div>
        )}

        {/* Error display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={retryLastMessage}
            onDismiss={clearError}
          />
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className={styles.messageInput}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={styles.sendButton}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </form>

      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={clearMessages}
          className={styles.actionButton}
          disabled={messages.length === 0}
        >
          Clear Chat
        </button>
        <button
          onClick={retryLastMessage}
          className={styles.actionButton}
          disabled={messages.length === 0 || isLoading}
        >
          Retry Last
        </button>
      </div>

      {/* Toast notifications */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SmartChatInterface;