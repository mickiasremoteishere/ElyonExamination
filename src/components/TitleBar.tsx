import React from 'react';
import { X, Square, Minus } from 'lucide-react';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electron?.send('minimize-window');
  };

  const handleMaximize = () => {
    window.electron?.send('maximize-window');
  };

  const handleClose = () => {
    window.electron?.send('close-window');
  };

  return (
    <div className="title-bar" style={{
      WebkitAppRegion: 'drag',
      height: '30px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      padding: '0 10px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{ flex: 1, WebkitAppRegion: 'drag' }}></div>
      <button
        onClick={handleMinimize}
        className="title-bar-button"
        style={{ WebkitAppRegion: 'no-drag' }}
        aria-label="Minimize"
      >
        <Minus size={16} />
      </button>
      <button
        onClick={handleMaximize}
        className="title-bar-button"
        style={{ WebkitAppRegion: 'no-drag' }}
        aria-label="Maximize"
      >
        <Square size={14} />
      </button>
      <button
        onClick={handleClose}
        className="title-bar-button"
        style={{ WebkitAppRegion: 'no-drag' }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default TitleBar;
