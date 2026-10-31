import React from 'react';

interface LiveAnnouncerProps {
  message: string;
  assertiveMessage?: string;
}

/**
 * Centralized Live Region following Modern Web Accessibility guidelines
 */
export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message, assertiveMessage }) => {
  return (
    <>
      {/* Polite Region for standard step updates */}
      <div
        id="a11y-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>

      {/* Assertive Region for critical errors or alerts */}
      {assertiveMessage && (
        <div
          id="a11y-announcer-assertive"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {assertiveMessage}
        </div>
      )}
    </>
  );
};
