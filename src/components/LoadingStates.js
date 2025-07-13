// Loading and error state components

import React from 'react';
import styles from './LoadingStates.module.css';

// Message loading indicator
export const MessageLoading = ({ provider, attempt, maxAttempts }) => {
  return (
    <div className={styles.messageLoading}>
      <div className={styles.loadingDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <div className={styles.loadingText}>
        {provider && (
          <span className={styles.provider}>
            Using {provider === 'backend' ? 'Server' : provider}
          </span>
        )}
        {attempt && maxAttempts && attempt > 1 && (
          <span className={styles.retry}>
            Retry {attempt}/{maxAttempts}
          </span>
        )}
      </div>
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus = ({ status, showDetails = false }) => {
  const getStatusConfig = (status) => {
    switch (status?.status) {
      case 'connected':
        return {
          icon: '🟢',
          label: 'Connected to Server',
          className: styles.connected
        };
      case 'disconnected':
        return {
          icon: '🔴',
          label: 'Server Unavailable',
          className: styles.disconnected
        };
      case 'fallback':
        return {
          icon: '🟡',
          label: 'Using Fallback AI',
          className: styles.fallback
        };
      default:
        return {
          icon: '⚪',
          label: 'Checking Connection...',
          className: styles.checking
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`${styles.connectionStatus} ${config.className}`}>
      <span className={styles.statusIcon}>{config.icon}</span>
      <span className={styles.statusLabel}>{config.label}</span>
      {showDetails && status?.lastChecked && (
        <span className={styles.statusDetails}>
          Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

// Error display component
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true,
  showDismiss = true 
}) => {
  if (!error) return null;

  return (
    <div className={styles.errorDisplay}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorMessage}>
          <div className={styles.errorTitle}>Something went wrong</div>
          <div className={styles.errorDetails}>{error}</div>
        </div>
      </div>
      
      {(showRetry || showDismiss) && (
        <div className={styles.errorActions}>
          {showRetry && onRetry && (
            <button 
              className={styles.retryButton}
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
          {showDismiss && onDismiss && (
            <button 
              className={styles.dismissButton}
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Provider switch notification
export const ProviderSwitchNotification = ({ 
  from, 
  to, 
  reason, 
  onDismiss,
  autoHide = true 
}) => {
  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  const getReasonText = (reason) => {
    switch (reason) {
      case 'backend_unavailable':
        return 'Server is unavailable';
      case 'preferred_provider_unavailable':
        return 'Preferred AI service is unavailable';
      case 'user_switched':
        return 'You switched providers';
      default:
        return 'Provider switched';
    }
  };

  return (
    <div className={styles.switchNotification}>
      <div className={styles.switchIcon}>🔄</div>
      <div className={styles.switchContent}>
        <div className={styles.switchTitle}>AI Provider Changed</div>
        <div className={styles.switchDetails}>
          {getReasonText(reason)} - Now using {to}
        </div>
      </div>
      {onDismiss && (
        <button 
          className={styles.dismissButton}
          onClick={onDismiss}
        >
          ×
        </button>
      )}
    </div>
  );
};

// General loading spinner
export const LoadingSpinner = ({ size = 'medium', message }) => {
  return (
    <div className={`${styles.loadingSpinner} ${styles[size]}`}>
      <div className={styles.spinner}></div>
      {message && <div className={styles.spinnerMessage}>{message}</div>}
    </div>
  );
};

// Service status grid
export const ServiceStatusGrid = ({ services }) => {
  return (
    <div className={styles.serviceGrid}>
      {Object.entries(services).map(([serviceName, serviceData]) => (
        <div key={serviceName} className={styles.serviceCard}>
          <div className={styles.serviceName}>{serviceName}</div>
          <div className={`${styles.serviceStatus} ${serviceData.success ? styles.success : styles.failure}`}>
            {serviceData.success ? '✅ Available' : '❌ Unavailable'}
          </div>
          {serviceData.responseTime && (
            <div className={styles.responseTime}>
              {serviceData.responseTime}ms
            </div>
          )}
          {serviceData.error && (
            <div className={styles.serviceError}>
              {serviceData.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Typing indicator
export const TypingIndicator = ({ provider }) => {
  return (
    <div className={styles.typingIndicator}>
      <div className={styles.typingDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className={styles.typingText}>
        {provider || 'AI'} is typing...
      </span>
    </div>
  );
};

// Toast notification
export const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return { icon: '✅', className: styles.success };
      case 'error':
        return { icon: '❌', className: styles.error };
      case 'warning':
        return { icon: '⚠️', className: styles.warning };
      default:
        return { icon: 'ℹ️', className: styles.info };
    }
  };

  const config = getToastConfig(type);

  return (
    <div className={`${styles.toast} ${config.className}`}>
      <span className={styles.toastIcon}>{config.icon}</span>
      <span className={styles.toastMessage}>{message}</span>
      {onClose && (
        <button className={styles.toastClose} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};