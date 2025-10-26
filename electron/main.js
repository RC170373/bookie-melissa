const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

let mainWindow
let nextServer

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png')
  })

  // Attendre que le serveur Next.js démarre
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000')
  }, 5000)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function startNextServer() {
  const isDev = !app.isPackaged
  
  if (isDev) {
    // Mode développement
    nextServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      env: { ...process.env, PORT: '3000' }
    })
  } else {
    // Mode production
    const nextPath = path.join(process.resourcesPath, 'app')
    
    // Copier le fichier .env s'il n'existe pas
    const envPath = path.join(nextPath, '.env')
    if (!fs.existsSync(envPath)) {
      const defaultEnv = `DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_BOOKS_API_KEY="AIzaSyDMFWV7Ohdfw0sAZ7rnYPGCTPcUtkz08Ps"`
      fs.writeFileSync(envPath, defaultEnv)
    }
    
    nextServer = spawn('node', ['server.js'], {
      cwd: nextPath,
      shell: true,
      env: { ...process.env, PORT: '3000' }
    })
  }

  nextServer.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`)
  })

  nextServer.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`)
  })
}

app.on('ready', () => {
  startNextServer()
  createWindow()
})

app.on('window-all-closed', function () {
  if (nextServer) {
    nextServer.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill()
  }
})

