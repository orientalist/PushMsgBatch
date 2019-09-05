const {app,autoUpdater,Menu}=require('electron')
const Child_process=require('child_process')
const path=require('path')

let state='checking'

exports.Initialize=()=>{
    if(process.mas) return

    console.log('Start checking version update')

    autoUpdater.on('checking-for-update',()=>{
        state='checking'
        exports.UpdateMenu()
    })

    autoUpdater.on('update-available',()=>{
        state='checking'
        exports.UpdateMenu()
    })
    
    autoUpdater.on('update-downloaded',()=>{
        state='installed'
        exports.UpdateMenu()
    })

    autoUpdater.on('update-not-available',()=>{
        state='no-update'
        exports.UpdateMenu()
    })

    autoUpdater.on('error',()=>{
        state='no-update'
        exports.UpdateMenu()
    })

    autoUpdater.setFeedURL(`https://www.wikipedia.com`)
    autoUpdater.checkForUpdates()
}

exports.UpdateMenu=()=>{
    console.log('Start updating menu')
    if(process.mas) return

    const menu=Menu.getApplicationMenu()
    if(!menu) return

    menu.items.forEach(item=>{
        if(item.submenu){
            item.submenu.items.forEach(item=>{
                switch(item.key){
                    case 'checkForUpdate':
                        item.visible=state==='no-update'
                        break
                    case 'checkingForUpdate':
                        item.visible=state==='checking'
                        break
                    case 'restartToUpdate':
                        item.visible=state==='installed'
                        break
                }
            })
        }
    })
}

exports.CreateShortCut=callback=>{
    SpawnUpdate([
        '--CreateShortcut',
        path.basename(process.execPath),
        '--shortcut-locations',
        'StartMenu'
    ],callback)
}

exports.RemoveShortcut=callback=>{
    SpawnUpdate([
        '--RemoveShortcut',
        path.basename(process.execPath)
    ],callback)
}

const SpawnUpdate=(args,callback)=>{
    console.log('Start spawning update')
    const updateExe=path.resolve(path.dirname(process.execPath,'..','Update.exe'))
    console.log(`The updateExe path is ${updateExe}`)

    let stdout=''
    let spawned=null

    try{
        console.log('Start spawn updating')
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