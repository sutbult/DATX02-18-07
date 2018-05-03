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
    const compileElm = require("./elm.js");

    function reload() {
        if(mainWindow) {
            mainWindow.reload();
        }
    }

    // Electron
    const ELECTRON_WATCH = [
        'js/*.js',
        'html/index.html',
    ];
    chokidar.watch(ELECTRON_WATCH).on('change', reload);

    // Elm
    const ELM_WATCH = [
        "**/*.elm",
    ];
    chokidar.watch(ELM_WATCH).on("change", () => {
        compileElm().then(() => {
            reload();
        }).catch(error => {
            console.error("Elm fail: %s", error);
        });
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
