const {app,dialog,globalShortcut}=require('electron')

app.on('ready',()=>{
    console.log('shortcuts app is reqdy')
    globalShortcut.register('CommandOrControl+K',()=>{
        dialog.showMessageBox({
            type:'info',
            message:'Success',
            detail:'You have pressed shortcut',
            buttons:['ok']
        })
    })
})

app.on('will-quit',()=>{
    console.log('Will destroy all shortcuts.')
    globalShortcut.unregisterAll()
})