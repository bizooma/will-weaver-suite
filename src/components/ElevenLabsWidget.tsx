import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
      };
    }
  }
}

const ElevenLabsWidget = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <elevenlabs-convai agent-id="jaUMaxEx1VzKzskPYH7w"></elevenlabs-convai>
    </div>
  );
};

export default ElevenLabsWidget;