import React from 'react';
import styles from './AISuggestion.module.css';

const AISuggestion = ({ title, content, actionText, onAction }) => {
  return (
    <div className={styles.aiSuggestion} data-aos="fade-up">
      <div className={styles.aiSuggestionHeader}>
        <div className={styles.aiIcon}>
          <i className="bi bi-robot"></i>
        </div>
        <div className={styles.aiTitle}>{title}</div>
      </div>
      <div className={styles.aiContent} dangerouslySetInnerHTML={{ __html: content }} />
      <button className={styles.aiAction} onClick={onAction}>
        {actionText}
      </button>
    </div>
  );
};

export default AISuggestion;