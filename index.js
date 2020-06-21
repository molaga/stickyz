const { app, BrowserWindow } = require('electron');

function createWindow () {
    const win = new BrowserWindow({
        width: 300,
        height: 20,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        },
    })

    win.loadURL(`file://${__dirname}/interface/dist/index.html`)
    win.setAlwaysOnTop(true, 'floating', 1)
    win.setFullScreenable(false)
    win.setVisibleOnAllWorkspaces(true);
    // win.webContents.openDevTools();
    // win.maximize()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})