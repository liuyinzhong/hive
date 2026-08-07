import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { app, BrowserWindow } from 'electron';

const mainDirectory = path.dirname(fileURLToPath(import.meta.url));
const appRoot = app.isPackaged
  ? process.resourcesPath
  : path.resolve(mainDirectory, '..');

if (!app.isPackaged && process.argv[1] && !path.isAbsolute(process.argv[1])) {
  process.argv[1] = path.resolve(appRoot, process.argv[1]);
}

let mainWindow;
let viteServer;

async function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 900,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1440,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(appRoot, 'dist', 'index.html'));
  } else {
    const url = viteServer?.resolvedUrls?.local[0];
    if (!url) {
      throw new Error('Vite development server did not provide a local URL.');
    }
    await mainWindow.loadURL(url);
  }
}

async function start() {
  if (!app.isPackaged) {
    const { createServer } = await import('vite');
    viteServer = await createServer({
      clearScreen: false,
      mode: 'development',
      root: appRoot,
    });
    await viteServer.listen();
  }

  await app.whenReady();
  await createWindow();
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

app.on('before-quit', () => {
  void viteServer?.close();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

start().catch((error) => {
  console.error(error);
  app.quit();
});
