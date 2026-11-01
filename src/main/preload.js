const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cards', {
  onShow: (fn) => ipcRenderer.on('card:show', (_e, card) => fn(card)),
  done: () => ipcRenderer.send('card:done'),
  learned: (lemma) => ipcRenderer.send('card:learned', lemma),
  getState: () => ipcRenderer.invoke('state:get'),
  saveSettings: (patch) => ipcRenderer.invoke('settings:save', patch),
  unlearn: (lemma) => ipcRenderer.invoke('words:unlearn', lemma),
  onStateChanged: (fn) => ipcRenderer.on('state:changed', fn),
});
