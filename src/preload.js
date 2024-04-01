// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');
window.store = {
  get: async (key) => await ipcRenderer.invoke('get', key),
  set: (key, value) => ipcRenderer.send('set', key, value)
}

contextBridge.exposeInMainWorld(
  "store", 
  {
    get: async (key) => await ipcRenderer.invoke('get', key),
    set: (key, value) => ipcRenderer.send('set', key, value)
  }
);

console.log('🌉 Bridged window.store to main world');