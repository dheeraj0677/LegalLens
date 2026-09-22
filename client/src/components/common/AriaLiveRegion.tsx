import React from 'react';

interface AriaLiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Dedicated accessibility component that dynamically announces asynchronous status updates
 * (such as scanning in progress, document analysis complete, errors) to screen readers.
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message = '',
  politeness = 'polite',
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {message}
    </div>
  );
};

export default AriaLiveRegion;
