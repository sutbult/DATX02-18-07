'use strict'
const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

app.on('ready', createWindow);

function setupChokidar() {
    const chokidar = require('chokidar');

    const WATCH = [
        'js/**.js',
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
    mainWindow.loadURL(`file://${ __dirname }/../html/index.html`);
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
    app.quit();
});
app.on('activate', () => {
    if(mainWindow === null) {
        createWindow()
    }
});
if(isDev()) {
    setupChokidar();
}
