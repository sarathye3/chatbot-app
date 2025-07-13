import React, { useRef, useState } from 'react';
import styles from './FileUpload.module.css';

const FileUpload = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/csv',
        'application/json',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please upload images, text files, or documents.');
        return;
      }

      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    }
  };

  const handlePaste = (e) => {
    if (!disabled) {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              handleFileSelect([file]);
            }
            break;
          }
        }
      }
    }
  };

  // Add paste listener to document
  React.useEffect(() => {
    const handleDocumentPaste = (e) => {
      if (!disabled) {
        handlePaste(e);
      }
    };
    
    document.addEventListener('paste', handleDocumentPaste);
    return () => {
      document.removeEventListener('paste', handleDocumentPaste);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.csv,.json,.pdf,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <button
        className={`${styles.uploadButton} ${dragActive ? styles.dragActive : ''} ${disabled ? styles.disabled : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        disabled={disabled}
        title="Upload file or paste image"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 10.5L10.5 21.5a4.95 4.95 0 1 1-7-7L14.5 3.5a3.54 3.54 0 1 1 5 5L8.5 19.5a2.12 2.12 0 1 1-3-3L16 6"/>
        </svg>
      </button>
    </>
  );
};

export default FileUpload;