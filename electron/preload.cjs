const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("RBEditorDesktop", {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
