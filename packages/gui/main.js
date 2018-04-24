'use strict'
const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

// Temporär fix
//app.on('ready', createWindow);
app.on('ready', () => {
    setTimeout(createWindow, 1000);
});

function setupChokidar() {
    const chokidar = require('chokidar');

    const WATCH = [
        'ports.js',
        'index.html',
        'elm.js',
    ];
    chokidar.watch(WATCH).on('change', () => {
        if(mainWindow) {
            mainWindow.reload();
        }
    });
}
function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });
    electron.Menu.setApplicationMenu(null);
    mainWindow.loadURL(`file://${ __dirname }/index.html`);
    if(isDev()) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.custom = {
        development: isDev(),
    };
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
if(isDev()) {
    setupChokidar();
}
