import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import { release } from 'node:os';

import Store from 'electron-store';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initStorage } from './init';
import { update } from './update';
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = dirname(__filename);

// The built directory structure
//、
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.mjs');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');
const store = new Store<{ workspacePath: string }>();

ipcMain.handle('open-directory-dialog', async (event) => {
	const result = await dialog.showOpenDialog({
		properties: ['openDirectory'],
	});
	store.set('workspacePath', result.filePaths[0]);
	initStorage(ipcMain, result.filePaths[0]);
	win.webContents.send('workspace-set', result.filePaths[0]);
	return result.filePaths[0];
});
ipcMain.handle('get-workspace', async () => {
	return store.get('workspacePath');
});
if (store.get('workspacePath')) {
	initStorage(ipcMain, store.get('workspacePath'));
}

// const db = new Low(adapter);
async function createWindow() {
	const args = (process.argv || []).length > 0 ? process.argv.slice(1) : '';
	if (args.includes('--open-modal')) {
		let modalWindow = new BrowserWindow({
			parent: win,
			show: false,
			width: 600,
			height: 500,
			webPreferences: {
				preload,
			},
		});
		modalWindow.loadFile(indexHtml);

		modalWindow.once('ready-to-show', () => {
			modalWindow.show();
		});
	}
	win = new BrowserWindow({
		title: 'Main window',
		icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
		width: 1000,
		height: 700,
		webPreferences: {
			preload,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// nodeIntegration: true,

			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			// contextIsolation: false,
		},
	});

	if (url) {
		// electron-vite-vue#298
		win.loadURL(url);
		// Open devTool if the app is not packaged
		win.webContents.openDevTools();
	} else {
		win.loadFile(indexHtml);
	}

	// Test actively push message to the Electron-Renderer
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	// Make all links open with the browser, not with the application
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('https:')) shell.openExternal(url);
		return { action: 'deny' };
	});

	// Apply electron-updater
	update(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	win = null;
	if (process.platform !== 'darwin') app.quit();
});
ipcMain.on('open-modal', (event, route) => {
	let modalWindow = new BrowserWindow({
		parent: win,
		show: false,
		width: 600,
		height: 500,
		webPreferences: {
			preload,
		},
	});
	modalWindow.loadFile(indexHtml);

	modalWindow.once('ready-to-show', () => {
		modalWindow.show();
	});
});
app.on('second-instance', () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on('activate', () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
	const childWindow = new BrowserWindow({
		webPreferences: {
			preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		childWindow.loadURL(`${url}#${arg}`);
	} else {
		childWindow.loadFile(indexHtml, { hash: arg });
	}
});
