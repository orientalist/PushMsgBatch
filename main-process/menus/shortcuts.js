const {app,dialog,globalShortcut}=require('electron')

//捷徑頁面程序
app.on('ready',()=>{
    console.log('shortcuts app is reqdy')
    //登記快捷鍵
    globalShortcut.register('CommandOrControl+K',()=>{
        dialog.showMessageBox({
            type:'info',
            message:'Success',
            detail:'You have pressed shortcut',
            buttons:['ok']
        })
    })
})

//當程序要結束時,摧毀所有快捷鍵
app.on('will-quit',()=>{
    console.log('Will destroy all shortcuts.')
    globalShortcut.unregisterAll()
})