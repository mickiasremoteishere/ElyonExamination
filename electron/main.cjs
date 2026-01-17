// Use CommonJS require for Electron main process
const { app, BrowserWindow, screen, dialog, Menu, Tray } = require('electron');
const path = require('path');
const url = require('url');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let tray = null;

const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === '1';
const isMac = process.platform === 'darwin';

// Set application name for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.elyon.examination');
}

function createWindow() {
  // Get the primary display dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window with kiosk mode settings
  mainWindow = new BrowserWindow({
    width: width > 1920 ? 1920 : width,
    height: height > 1080 ? 1080 : height,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: !isDev,
      devTools: isDev,
      enableRemoteModule: true
    },
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    title: 'Elyon Examination System',
    icon: path.join(__dirname, '../public/logo.png'),
    show: false,
    backgroundColor: '#ffffff'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // Only show window when it's ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Prevent window close
  mainWindow.on('close', async (e) => {
    if (process.platform === 'darwin') {
      e.preventDefault();
      app.hide();
      return;
    }

    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Minimize to Tray', 'Exit'],
      title: 'Confirm',
      message: 'Are you sure you want to exit the application?',
      defaultId: 1,
      cancelId: 1,
    });

    if (response === 1) {
      mainWindow.destroy();
    } else {
      e.preventDefault();
      mainWindow.hide();
      
      // Show tray icon if not already shown
      if (!tray) {
        createTray();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent right-click context menu
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      e.preventDefault();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow localhost and file URLs, block everything else
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Disable menu bar
  Menu.setApplicationMenu(null);

  // Create system tray
  createTray();
}

function createTray() {
  if (tray) return;

  const iconPath = path.join(__dirname, isMac ? '../public/logo.icns' : '../public/logo.png');
  
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Elyon Examination',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Elyon Examination System');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Disable hardware acceleration for better compatibility
app.disableHardwareAcceleration();

// Disable GPU acceleration if needed
app.commandLine.appendSwitch('disable-software-rasterizer');

// Disable frame rate throttling
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

// Security settings
app.on('web-contents-created', (event, contents) => {
  // Disable navigation
  contents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:8080' && !parsedUrl.protocol.startsWith('file:')) {
        event.preventDefault();
      }
    } catch (e) {
      event.preventDefault();
    }
  });

  // Disable new windows
  contents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
});
