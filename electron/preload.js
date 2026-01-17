// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const { contextBridge, ipcRenderer } = require('electron');

// White-list for valid channels for "send"
const validSendChannels = [
  'app-version',
  'app-name',
  'app-path',
  'check-updates',
  'minimize-window',
  'maximize-window',
  'close-window',
  'open-dev-tools'
];

// White-list for valid channels for "receive"
const validReceiveChannels = [
  'app-version',
  'app-name',
  'app-path',
  'update-available',
  'update-downloaded',
  'update-error'
];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Send messages to main process
  send: (channel, data) => {
    // Only allow valid channels
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Attempted to send on invalid channel: ${channel}`);
    }
  },
  
  // Receive messages from main process
  receive: (channel, func) => {
    // Only allow valid channels
    if (validReceiveChannels.includes(channel)) {
      // Strip event as it includes `sender` and is a security risk
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`Attempted to receive on invalid channel: ${channel}`);
    }
  },
  
  // Remove event listeners
  removeListener: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener);
  },
  
  // Platform detection
  platform: process.platform,
  
  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV,
    ELECTRON_MODE: true
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getName: () => ipcRenderer.invoke('get-app-name'),
    getPath: (name) => ipcRenderer.invoke('get-path', name)
  },
  
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
  },
  
  // Security functions
  security: {
    // Add any security-related functions here
    isDevMode: () => process.env.NODE_ENV === 'development',
    isPackaged: () => ipcRenderer.invoke('is-packaged')
  }
});

// Add any other contextBridge methods or polyfills you need
// This is a good place to add any Node.js functionality that needs to be exposed to the renderer
// in a secure way.
