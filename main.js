const { app, BrowserWindow } = require('electron')
const path = require('path')
const glob = require('glob')
const autoUpdater = require('./autoUpdater')

//判斷是否為Debug模式
const debug = /--debug/.test(process.argv[2])

console.log(`debug:${debug} argvs[2]:${process.argv[2]}`)

let mainWindow=null

//初始化方法
const Initialize = () => {
    console.log('Start initializing')
    const isMainProcess = requestSingleInstanceLock()
    //非主程序,關閉
    if (!isMainProcess) return app.quit()

    LoadPages()

    //建立主視窗方法
    var CreateWindow = () => {
        console.log('-------The app is ready-------')
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })

        mainWindow.loadFile('index.html')

        if(debug){
            require('devtron').install()
        }

        mainWindow.webContents.openDevTools()

        mainWindow.on('closed', () => {
            mainWindow = null
        })
    }

    app.on('ready', ()=>{
        CreateWindow()
        //自動升級
        autoUpdater.Initialize()
    })

    app.on('window-all-closed', () => {
        console.log('-------The app is closing-------')
        if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', () => {
        if (mainWindow === null) createWindow()
    })
}

//判斷是否為主程序
var requestSingleInstanceLock = () => {
    console.log('Checking if the peocess is main')
    console.log(`The result is ${app.requestSingleInstanceLock()}`)
    return app.requestSingleInstanceLock()
}

//載入頁面js
var LoadPages = () => {
    console.log('Start loading needed js')
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
    files.forEach(file => {
        console.log(`Start loading ${file}`)
        require(file)
    })
    //autoUpdater.UpdateMenu()
}

console.log(`The process.argv[1] is ${process.argv[1]}`)
//依照process.argv判斷要執行的程序
switch(process.argv[1]){
    case '--squirrel-install':
        autoUpdater.CreateShortCut(()=>{app.quit()})
    break
    case '--squirrel-uninstall':
        autoUpdater.RemoveShortcut(()=>{app.quit()})
    break
    case '--squirrel-obsolute':
    case '--squirrel-updated':
        app.quit()
    break
    default:
        Initialize()
}