import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import Sidebar from './Sidebar';
import MessageRenderer from './MessageRenderer';
import MessageActions from './MessageActions';
import ThemeToggle from './ThemeToggle';
import FileUpload from './FileUpload';
import AIConfigModal from './AIConfigModal';
import { useAIConfig } from '../contexts/AIConfigContext';
import messageService from '../services/messageService';
import backendChecker from '../services/backendChecker';
import { ConnectionStatus, ErrorDisplay, Toast } from './LoadingStates';

const Chat = () => {
  const { config } = useAIConfig();
  const [conversations, setConversations] = useState(new Map());
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [apiStatus, setApiStatus] = useState('unknown');
  const [regeneratingMessageId, setRegeneratingMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get current conversation's messages
  const messages = currentConversationId ? 
    conversations.get(currentConversationId)?.messages || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Initialize conversation on component mount
  useEffect(() => {
    initializeChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Check backend availability using the new backend checker
      const status = await backendChecker.checkAvailability();
      
      if (status.isAvailable) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
        addToast('Backend unavailable - will use AI fallback when needed', 'info');
      }
      
      // Create initial conversation (will use appropriate API)
      await createNewConversation();
      
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setApiStatus('disconnected');
      setError('Failed to initialize chat service.');
      
      // Final fallback to completely local state
      const offlineConvId = `offline_${Date.now()}`;
      const offlineConversation = {
        id: offlineConvId,
        title: 'Local Chat',
        messages: [{
          id: 1,
          text: "Hello! I'm your AI assistant. I'm currently running in local mode with basic responses.",
          isBot: true,
          timestamp: new Date()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setConversations(new Map([[offlineConvId, offlineConversation]]));
      setCurrentConversationId(offlineConvId);
    } finally {
      setIsInitializing(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setError(null);
      
      // Create new conversation locally (backend API not needed for conversation management)
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const conversation = {
        id: conversationId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setConversations(prev => new Map(prev).set(conversation.id, conversation));
      setCurrentConversationId(conversation.id);
      
      return conversation.id;
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      setError('Failed to create new chat. Please try again.');
      throw err;
    }
  };

  // Toast notification helpers
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // Clear file upload and editing states
    setUploadedFile(null);
    setEditingMessage(null);

    try {
      // Add user message to conversation immediately
      const userMessage = {
        id: Date.now(),
        text: messageText,
        isBot: false,
        timestamp: new Date()
      };

      setConversations(prev => {
        const updatedConversations = new Map(prev);
        const currentConv = updatedConversations.get(currentConversationId);
        if (currentConv) {
          const updatedConv = {
            ...currentConv,
            messages: [...currentConv.messages, userMessage],
            updatedAt: new Date().toISOString()
          };
          updatedConversations.set(currentConversationId, updatedConv);
        }
        return updatedConversations;
      });

      // Use smart message service (handles backend checking and AI fallback)
      const response = await messageService.sendMessage(messageText, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        systemPrompt: config.systemPrompt,
        model: config.model
      });

      // Add AI response to conversation
      const aiMessage = {
        id: Date.now() + 1,
        text: response.text,
        isBot: true,
        timestamp: new Date(),
        provider: response.provider
      };

      setConversations(prev => {
        const updatedConversations = new Map(prev);
        const currentConv = updatedConversations.get(currentConversationId);
        if (currentConv) {
          const updatedConv = {
            ...currentConv,
            messages: [...currentConv.messages, aiMessage],
            updatedAt: new Date().toISOString()
          };
          updatedConversations.set(currentConversationId, updatedConv);
        }
        return updatedConversations;
      });

      // Update API status and current provider
      setCurrentProvider(response.provider);
      setApiStatus(response.provider === 'backend' ? 'connected' : 'fallback');
      
      // Show toast notification for AI fallback
      if (response.provider !== 'backend') {
        addToast(`Using ${response.provider} AI`, 'info');
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(`Failed to send message: ${err.message}`);
      
      // Re-add the user input to the input field
      setInputValue(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Create a new conversation without clearing existing ones
      await createNewConversation();
      
      setInputValue('');
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create new chat:', err);
      setError('Failed to create new chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setError(null);
    setSidebarOpen(false);
  };

  const deleteConversation = async (conversationId) => {
    try {
      // Conversation deletion is handled locally
      // Backend sync would happen here if needed
      
      setConversations(prev => {
        const updated = new Map(prev);
        updated.delete(conversationId);
        return updated;
      });
      
      // If we deleted the current conversation, switch to another one or create new
      if (conversationId === currentConversationId) {
        const remainingConversations = Array.from(conversations.keys()).filter(id => id !== conversationId);
        if (remainingConversations.length > 0) {
          setCurrentConversationId(remainingConversations[0]);
        } else {
          // Create a new conversation if no others exist
          await createNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCopyMessage = (message) => {
    console.log('Copied message:', message.text);
  };

  const handleRegenerateMessage = async (message) => {
    if (!currentConversationId || regeneratingMessageId) return;
    
    setRegeneratingMessageId(message.id);
    setError(null);

    try {
      // Find the user message that prompted this bot response
      const currentConv = conversations.get(currentConversationId);
      const messageIndex = currentConv.messages.findIndex(m => m.id === message.id);
      const userMessage = currentConv.messages[messageIndex - 1];
      
      if (userMessage && !userMessage.isBot) {
        // Send the same user message again to get a new response using smart message service
        const response = await messageService.sendMessage(userMessage.text, {
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          systemPrompt: config.systemPrompt,
          model: config.model
        });
        
        const aiMessage = {
          id: Date.now(),
          text: response.text,
          isBot: true,
          timestamp: new Date(),
          provider: response.provider
        };
        
        // Replace the old bot message with the new one
        setConversations(prev => {
          const updatedConversations = new Map(prev);
          const conv = updatedConversations.get(currentConversationId);
          if (conv) {
            const updatedMessages = [...conv.messages];
            updatedMessages[messageIndex] = aiMessage;
            const updatedConv = {
              ...conv,
              messages: updatedMessages,
              updatedAt: new Date().toISOString()
            };
            updatedConversations.set(currentConversationId, updatedConv);
          }
          return updatedConversations;
        });
        
        // Update current provider
        setCurrentProvider(response.provider);
        setApiStatus(response.provider === 'backend' ? 'connected' : 'fallback');
      }
    } catch (err) {
      console.error('Failed to regenerate message:', err);
      setError('Failed to regenerate response. Please try again.');
    } finally {
      setRegeneratingMessageId(null);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setInputValue(message.text);
  };

  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setInputValue(prev => prev + `\n[File: ${file.name}]`);
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        onNewChat={handleNewChat}
        conversations={Array.from(conversations.values())}
        currentConversationId={currentConversationId}
        onSelectConversation={switchToConversation}
        onDeleteConversation={deleteConversation}
      />
      
      <div className={styles.mainContent}>
        <div className={styles.chatHeader}>
          <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
            <span className={styles.hamburger}></span>
          </button>
          <div className={styles.headerTitle}>
            <h1>Chat</h1>
            {apiStatus === 'connected' && (
              <span className={styles.statusIndicator}>
                <span className={styles.statusDot}></span>
                Connected to Server
              </span>
            )}
            {apiStatus === 'fallback' && currentProvider && (
              <span className={`${styles.statusIndicator} ${styles.fallback}`}>
                <span className={styles.statusDot}></span>
                Using {currentProvider} AI
              </span>
            )}
            {apiStatus === 'mock' && (
              <span className={`${styles.statusIndicator} ${styles.mock}`}>
                <span className={styles.statusDot}></span>
                Mock AI
              </span>
            )}
            {apiStatus === 'disconnected' && (
              <span className={`${styles.statusIndicator} ${styles.offline}`}>
                <span className={styles.statusDot}></span>
                Local Mode
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.settingsButton} 
              onClick={() => setIsAIConfigOpen(true)}
              title="AI Configuration"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-5L19 3.5M5 19.5L7.5 17M19 20.5L16.5 18M5 4.5L7.5 7"/>
              </svg>
            </button>
            <ThemeToggle />
            <button className={styles.newChatButtonHeader} onClick={handleNewChat} disabled={isLoading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          className={styles.messagesContainer}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          <div className={styles.messagesInner}>
            {isInitializing ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Connecting to chat service...</p>
              </div>
            ) : (
              messages.map((message, index) => (
              <div
                key={message.id}
                className={`${styles.messageWrapper} ${
                  message.isBot ? styles.botMessage : styles.userMessage
                } ${styles.fadeIn}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={styles.messageContent}>
                  <div className={styles.avatar}>
                    {message.isBot ? '🤖' : '👤'}
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.messageBubble}>
                      <MessageRenderer 
                        content={message.text} 
                        isBot={message.isBot} 
                      />
                    </div>
                    <div className={styles.messageFooter}>
                      <div className={styles.timestamp}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <MessageActions
                        message={message}
                        isBot={message.isBot}
                        onCopy={handleCopyMessage}
                        onRegenerate={handleRegenerateMessage}
                        onEdit={handleEditMessage}
                        isRegenerating={regeneratingMessageId === message.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )))}
            
            {isLoading && !isInitializing && (
              <div className={`${styles.messageWrapper} ${styles.botMessage} ${styles.fadeIn}`}>
                <div className={styles.messageContent}>
                  <div className={styles.avatar}>🤖</div>
                  <div className={styles.messageBody}>
                    <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className={styles.typingText}>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showScrollButton && (
          <button className={styles.scrollButton} onClick={scrollToBottom}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l3 3 7-7M7 6l3 3 7-7" />
            </svg>
          </button>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        <div className={styles.inputContainer}>
          {uploadedFile && (
            <div className={styles.filePreview}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{uploadedFile.name}</span>
                <span className={styles.fileSize}>
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                className={styles.removeFile}
                onClick={() => {
                  setUploadedFile(null);
                  setInputValue(prev => prev.replace(`\n[File: ${uploadedFile.name}]`, ''));
                }}
              >
                ×
              </button>
            </div>
          )}
          
          <div className={styles.inputWrapper}>
            <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
              className={styles.messageInput}
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={styles.sendButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <AIConfigModal 
        isOpen={isAIConfigOpen}
        onClose={() => setIsAIConfigOpen(false)}
      />
      
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

export default Chat;