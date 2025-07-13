import React, { useState } from 'react';
import styles from './MessageActions.module.css';

const MessageActions = ({ 
  message, 
  onCopy, 
  onRegenerate, 
  onEdit, 
  isBot,
  isRegenerating 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(message);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && !isRegenerating) {
      onRegenerate(message);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
  };

  return (
    <div 
      className={styles.actionsContainer}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`${styles.actions} ${showActions ? styles.visible : ''}`}>
        <button
          className={styles.actionButton}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy message'}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5,15H4a2,2 0,0,1-2-2V4A2,2 0,0,1,4,2H15a2,2 0,0,1,2,2V5"></path>
            </svg>
          )}
        </button>

        {isBot && (
          <button
            className={`${styles.actionButton} ${isRegenerating ? styles.regenerating : ''}`}
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title={isRegenerating ? 'Regenerating...' : 'Regenerate response'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
            </svg>
          </button>
        )}

        {!isBot && (
          <button
            className={styles.actionButton}
            onClick={handleEdit}
            title="Edit and resend"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11,4H4A2,2,0,0,0,2,6V20a2,2,0,0,0,2,2H16a2,2,0,0,0,2-2V13"></path>
              <path d="M18.5,2.5a2.121,2.121,0,0,1,3,3L12,15,8,16,9,12Z"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageActions;