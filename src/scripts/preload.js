const { contextBridge, ipcRenderer } = require('electron');

// Exponer solo las APIs que necesites al renderizador
contextBridge.exposeInMainWorld('api', {
  sendLoginData: (loginData) => ipcRenderer.send('login', loginData)
});
