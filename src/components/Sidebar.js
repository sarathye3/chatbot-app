import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  conversations = [], 
  currentConversationId, 
  onSelectConversation, 
  onDeleteConversation 
}) => {
  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🤖</div>
            <h2>AI Assistant</h2>
          </div>
          <button className={styles.toggleButton} onClick={onToggle}>
            <span className={styles.hamburger}></span>
          </button>
        </div>
        
        <div className={styles.content}>
          <button className={styles.newChatButton} onClick={onNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
          
          {conversations.length > 0 && (
            <div className={styles.section}>
              <h3>Recent Conversations</h3>
              <div className={styles.conversationList}>
                {conversations
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`${styles.conversationItem} ${
                        conversation.id === currentConversationId ? styles.active : ''
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className={styles.conversationContent}>
                        <div className={styles.conversationTitle}>
                          {conversation.title}
                        </div>
                        <div className={styles.conversationMeta}>
                          {conversation.messages.length} messages • {
                            new Date(conversation.updatedAt).toLocaleDateString()
                          }
                        </div>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        title="Delete conversation"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          <div className={styles.section}>
            <h3>About</h3>
            <p>I'm your AI assistant, here to help answer questions and have conversations. Feel free to ask me anything!</p>
          </div>
          
          <div className={styles.section}>
            <h3>Features</h3>
            <ul>
              <li>Multiple conversations</li>
              <li>Real-time responses</li>
              <li>Modern interface</li>
              <li>Conversation history</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;