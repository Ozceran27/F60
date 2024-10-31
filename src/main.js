const { app, BrowserWindow, screen } = require("electron");
const path = require("path");
const axios = require("axios");

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = Math.floor(width * 0.7);
    const windowHeight = Math.floor(height * 0.7);
    const minWidth = Math.floor(width * 0.5);
    const minHeight = Math.floor(height * 0.5);

    const mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: minWidth,
        minHeight: minHeight,
        maximizable: true,
        webPreferences: {
            preload: path.join(__dirname, "scripts/preload.js"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: true,
        },
        icon: path.join(__dirname, "../assets/logo.ico"),
    });

    mainWindow.loadFile("src/login.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
