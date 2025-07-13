import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './MessageRenderer.module.css';

// Fallback code component when syntax highlighter is not available
const CodeBlock = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  return (
    <pre className={styles.codeBlock}>
      {language && <div className={styles.codeLanguage}>{language}</div>}
      <code className={styles.code} {...props}>
        {children}
      </code>
    </pre>
  );
};

const MessageRenderer = ({ content, isBot }) => {
  if (!isBot) {
    // User messages - render as plain text with line breaks
    return (
      <div className={styles.messageText}>
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Bot messages - render as markdown
  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            return !inline ? (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            ) : (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className={styles.paragraph}>{children}</p>;
          },
          h1({ children }) {
            return <h1 className={styles.heading1}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 className={styles.heading2}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 className={styles.heading3}>{children}</h3>;
          },
          ul({ children }) {
            return <ul className={styles.unorderedList}>{children}</ul>;
          },
          ol({ children }) {
            return <ol className={styles.orderedList}>{children}</ol>;
          },
          li({ children }) {
            return <li className={styles.listItem}>{children}</li>;
          },
          blockquote({ children }) {
            return <blockquote className={styles.blockquote}>{children}</blockquote>;
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className={styles.link}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            return <strong className={styles.bold}>{children}</strong>;
          },
          em({ children }) {
            return <em className={styles.italic}>{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;