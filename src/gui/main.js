'use strict'
const electron = require('electron');
const chokidar = require('chokidar');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

// Temporär fix
//app.on('ready', createWindow);
app.on('ready', () => {
    setTimeout(createWindow, 1000);
});

const WATCH = [
    'src/gui/ports.js',
    'src/gui/index.html',
    'src/gui/elm.js',
];

chokidar.watch(WATCH).on('change', () => {
    if(mainWindow) {
        mainWindow.reload();
    }
});
function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });
    electron.Menu.setApplicationMenu(null);
    mainWindow.loadURL(`file://${ __dirname }/index.html`);
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', () => {
    if(mainWindow === null) {
        createWindow()
    }
});
