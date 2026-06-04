const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Get the path to store data persistently
function getDataPath() {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'tracker-data.json');
}

// Load data from file
function loadData() {
    const dataPath = getDataPath();
    try {
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('Error loading data:', err);
    }
    return { clients: [], tasks: [] };
}

// Save data to file
function saveData(data) {
    const dataPath = getDataPath();
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 800,
        minHeight: 500,
        title: "Ryan's Tracker",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#1a1a2e',
        show: false
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

// IPC handlers for data persistence
ipcMain.handle('load-data', () => {
    return loadData();
});

ipcMain.handle('save-data', (event, data) => {
    saveData(data);
    return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
