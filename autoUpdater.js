const {app,autoUpdater,Menu}=require('electron')
const Child_process=require('child_process')
const path=require('path')

let state='checking'

//自動升級方安裝方法
exports.Initialize=()=>{
    if(process.mas) return

    console.log('Start checking version update')
    
    //檢查升級中
    autoUpdater.on('checking-for-update',()=>{
        state='checking'
        exports.UpdateMenu()
    })

    //有升級可用
    autoUpdater.on('update-available',()=>{
        state='checking'
        exports.UpdateMenu()
    })
    
    //升級檔已下載
    autoUpdater.on('update-downloaded',()=>{
        state='installed'
        exports.UpdateMenu()
    })

    //升級無法取得
    autoUpdater.on('update-not-available',()=>{
        state='no-update'
        exports.UpdateMenu()
    })
    
    //升級發生錯誤
    autoUpdater.on('error',()=>{
        state='no-update'
        exports.UpdateMenu()
    })

    //設定回饋網址
    autoUpdater.setFeedURL(`https://www.wikipedia.com`)
    //開始檢查並升級,會依照狀態進入上方程式
    autoUpdater.checkForUpdates()
}

//更新選單方法
exports.UpdateMenu=()=>{
    console.log('Start updating menu')
    if(process.mas) return

    //取得以設定的選單
    const menu=Menu.getApplicationMenu()
    if(!menu) return

    //逐一取出選單項目判斷
    menu.items.forEach(item=>{
        //若項目含有子項目,逐一取出判斷
        if(item.submenu){
            item.submenu.items.forEach(item=>{                
                switch(item.key){
                    //若項目key為 檢查升級 判斷state為no update時才可見
                    case 'checkForUpdate':
                        item.visible=state==='no-update'
                        break
                    //若項目key為 檢查升級中 判斷state為checking時才可見
                    case 'checkingForUpdate':
                        item.visible=state==='checking'
                        break
                    //若項目key為 重新開始升級 判斷state為installed時才可見
                    case 'restartToUpdate':
                        item.visible=state==='installed'
                        break
                }
            })
        }
    })
}

//建立捷徑方法
exports.CreateShortCut=callback=>{
    SpawnUpdate([
        '--CreateShortcut',
        path.basename(process.execPath),
        '--shortcut-locations',
        'StartMenu'
    ],callback)
}

//移除捷徑方法
exports.RemoveShortcut=callback=>{
    SpawnUpdate([
        '--RemoveShortcut',
        path.basename(process.execPath)
    ],callback)
}

//卵狀升級方法(參數,回掉函式)
const SpawnUpdate=(args,callback)=>{
    console.log('Start spawning update')
    //取得安裝檔位置
    const updateExe=path.resolve(path.dirname(process.execPath,'..','Update.exe'))
    console.log(`The updateExe path is ${updateExe}`)

    let stdout=''
    let spawned=null

    try{
        console.log('Start spawn updating')
        //以子程序安裝升級檔
        spawned=Child_process.spawn(updateExe,args)
    }
    catch(err){
        if(err&&err.stdout==null){
            err.stdout=stdout
        }
        process.nextTick(()=>callback(err))
        return
    }

    var error=null

    spawned.stdout.on('data',data=>{
        stdout+=data
    })

    spawned.on('error',processError=>{
        if(!error)error=processError
    })

    spawned.on('close',(code,signal)=>{
        if(!error&&code!==0){
            error=new Error(`Command failed: ${code} ${signal}`)
        }
        if(error&&error.code==null)error.code=code
        if(error&&error.stdout==null)error.stdout=stdout
        callback(error)
    })
}