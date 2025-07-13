import React, { useState } from 'react';
import { useAIConfig } from '../contexts/AIConfigContext';
import styles from './AIConfigModal.module.css';

const AIConfigModal = ({ isOpen, onClose }) => {
  const {
    config,
    updateConfig,
    updateModel,
    updatePersonality,
    updateCustomSystemPrompt,
    resetToDefaults,
    getTemperatureLabel,
    availableModels,
    personalityPresets
  } = useAIConfig();

  const [activeTab, setActiveTab] = useState('model');
  const [customPrompt, setCustomPrompt] = useState(config.customSystemPrompt);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveCustomPrompt = () => {
    updateCustomSystemPrompt(customPrompt);
  };

  const tabs = [
    { id: 'model', label: 'Model', icon: '🤖' },
    { id: 'creativity', label: 'Creativity', icon: '🎨' },
    { id: 'personality', label: 'Personality', icon: '🎭' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>AI Configuration</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'model' && (
            <div className={styles.section}>
              <h3>AI Model Selection</h3>
              <p className={styles.description}>Choose the AI model that best fits your needs</p>
              
              <div className={styles.modelGrid}>
                {Object.values(availableModels).map(model => (
                  <div
                    key={model.id}
                    className={`${styles.modelCard} ${config.model === model.id ? styles.selected : ''}`}
                    onClick={() => updateModel(model.id)}
                  >
                    <div className={styles.modelHeader}>
                      <h4>{model.name}</h4>
                      <span className={styles.provider}>{model.provider}</span>
                    </div>
                    <p className={styles.modelDescription}>{model.description}</p>
                    <div className={styles.modelSpecs}>
                      <span>Max: {model.maxTokens.toLocaleString()} tokens</span>
                      {model.supportStreaming && <span>• Streaming</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'creativity' && (
            <div className={styles.section}>
              <h3>Creativity & Randomness</h3>
              <p className={styles.description}>Control how creative and varied the AI responses are</p>
              
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Temperature: {config.temperature}</span>
                  <span className={styles.temperatureLabel}>{getTemperatureLabel(config.temperature)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel}>
                  <span>Max Response Length: {config.maxTokens} tokens</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max={availableModels[config.model]?.maxTokens || 4096}
                  step="50"
                  value={config.maxTokens}
                  onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                  className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                  <span>Short</span>
                  <span>Medium</span>
                  <span>Long</span>
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.streamingEnabled}
                    onChange={(e) => updateConfig({ streamingEnabled: e.target.checked })}
                    disabled={!availableModels[config.model]?.supportStreaming}
                  />
                  <span>Enable response streaming (real-time generation)</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className={styles.section}>
              <h3>AI Personality</h3>
              <p className={styles.description}>Choose how the AI should behave and respond</p>
              
              <div className={styles.personalityGrid}>
                {Object.entries(personalityPresets).map(([key, preset]) => (
                  <div
                    key={key}
                    className={`${styles.personalityCard} ${config.personalityPreset === key ? styles.selected : ''}`}
                    onClick={() => updatePersonality(key)}
                  >
                    <h4>{preset.name}</h4>
                    <p>{preset.description}</p>
                  </div>
                ))}
              </div>

              <div className={styles.customPromptSection}>
                <h4>Custom System Prompt</h4>
                <p className={styles.description}>Define your own AI personality and behavior</p>
                <textarea
                  className={styles.customPromptTextarea}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom system prompt..."
                  rows={4}
                />
                <button
                  className={styles.saveButton}
                  onClick={handleSaveCustomPrompt}
                  disabled={!customPrompt.trim()}
                >
                  Apply Custom Prompt
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className={styles.section}>
              <h3>Advanced Settings</h3>
              <p className={styles.description}>Fine-tune AI behavior parameters</p>
              
              <div className={styles.advancedGrid}>
                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel}>
                    <span>Top P: {config.topP}</span>
                    <span className={styles.hint}>Controls diversity</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.topP}
                    onChange={(e) => updateConfig({ topP: parseFloat(e.target.value) })}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel}>
                    <span>Frequency Penalty: {config.frequencyPenalty}</span>
                    <span className={styles.hint}>Reduces repetition</span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.frequencyPenalty}
                    onChange={(e) => updateConfig({ frequencyPenalty: parseFloat(e.target.value) })}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel}>
                    <span>Presence Penalty: {config.presencePenalty}</span>
                    <span className={styles.hint}>Encourages new topics</span>
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.presencePenalty}
                    onChange={(e) => updateConfig({ presencePenalty: parseFloat(e.target.value) })}
                    className={styles.slider}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={resetToDefaults}>
            Reset to Defaults
          </button>
          <div className={styles.footerActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={onClose}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfigModal;