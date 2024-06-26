// Modules to control application life and create native browser window
const { screen, app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

const Store = require('electron-store');
const store = new Store();

let splash; // Declare the splash screen variable
let mainWindow; // Declare the main window variable

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
function rc(o,w,h){
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
  const x = Math.round((screenWidth - w) / 2)
  const y = Math.round((screenHeight - h) / 2)
  o.setBounds({x, y, width: w, height: h }, true)
}
function createWindow () {
  // Create the splash screen. This will show before the main window is shown
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    backgroundColor: '#1B1A1D' // Set the background color to 1B1A1D
  });

  // setTimeout(() => {
  //   rc(splash,  800, 600)
  // }, 5000);
  // Load the splash screen html
  splash.loadFile('./src/splash/splash.html');

  // After 5 seconds, close the splash screen and open the main window
  splash.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      // Check if the splash screen still exists before trying to close it
      if (!splash.isDestroyed()) {
        splash.close();
      }

      // Create the main window after the splash screen is closed
      mainWindow = new BrowserWindow({
        width: 800,
        minWidth:800,
        height: 600,
        minHeight:600,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 10, y: 10 },
        title: "Dashmate",
        webPreferences: {
          preload: path.resolve(__dirname, 'preload.js'),
          nodeIntegration:true
        },
        backgroundColor: '#1B1A1D'
      });
      mainWindow.setMenuBarVisibility(false)

      // Load the index.html of the app.
      mainWindow.loadFile('./src/index.html');

      // Open the DevTools.
      // mainWindow.webContents.openDevTools();

      mainWindow.on('enter-full-screen', () => {
        mainWindow.setWindowButtonVisibility(true);
      });
      
      mainWindow.on('leave-full-screen', () => {
        mainWindow.setWindowButtonVisibility(true);
      });
    }, 5e3);
  });
}

app.on('ready', createWindow);

process.on('uncaughtException', error => {
	console.error('Exception:', error); 
	app.exit(1);
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) createWindow()
})

app.on('window-all-closed', function () {
  app.quit()
})


/* 

store.set('unicorn', '🦄');
console.log(store.get('unicorn'));
//=> '🦄'

Use dot-notation to access nested properties
store.set('foo.bar', true);
console.log(store.get('foo'));
//=> {bar: true}

store.delete('unicorn');
console.log(store.get('unicorn'));
//=> undefined 

*/


ipcMain.handle('get', (event, key) => {
  return store.get(key);
});

ipcMain.on('set', (event, key, value) => {
  store.set(key, value);
});

// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('node:path');

// const Store = require('electron-store');
// const store = new Store();

// // Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     minWidth:800,
//     height: 600,
//     minHeight:600,
//     titleBarStyle: 'hiddenInset',
//     trafficLightPosition: { x: 10, y: 10 },
//     title: "Dashmate",
//     webPreferences: {
//       preload: path.resolve(__dirname, 'preload.js'),
//       nodeIntegration:true
//     }
//   });

//   // and load the index.html of the app.
//   mainWindow.loadFile(path.join(__dirname, 'index.html'));

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };
// const createSplash = () => {
//   // Create the browser window.
//   const splashWindow = new BrowserWindow({
//     width: 400,
//     height: 300,
//     resizable: false,
//     frame: false,
//     trafficLightPosition: { x: 10, y: 10 },
//     title: "Dashmate",
//     webPreferences: {
//       preload: path.resolve(__dirname, 'preload.js'),
//       nodeIntegration:true
//     }
//   });

//   // and load the index.html of the app.
//   splashWindow.loadFile(path.join(__dirname, 'index.html'));

//   // Open the DevTools.
//   splashWindow.webContents.openDevTools();
// };

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   createSplash();
//   setTimeout(
//     createWindow(),5e3
//   );

//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   // app.on('activate', () => {
//   //   if (BrowserWindow.getAllWindows().length === 0) {
//   //     createWindow();
//   //   }
//   // });
// });

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and import them here.


// ipcMain.handle('get', (event, key) => {
//   return store.get(key);
// });

// ipcMain.on('set', (event, key, value) => {
//   store.set(key, value);
// });``