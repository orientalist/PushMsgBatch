const{
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    app
}=require('electron')

//建立快速選單(右鍵產生)
const menu=new Menu()
menu.append(new MenuItem({label:'Hello'}))
menu.append(new MenuItem({type:'separator'}))
menu.append(new MenuItem({label:'Electron',type:'checkbox',checked:true}))

app.on('browser-window-created',(event,win)=>{
    //當主視窗載入,將menu附加入視窗
    console.log(`${win} created`)
    win.webContents.on('context-menu',(e,params)=>{
        console.log('Start pupup menu')
        menu.popup(win,params.x,params.y)
    })
})

//ipcMain用以向主程序發送web page渲染進程的同步/異步消息
ipcMain.on('show-context-menu',(event)=>{
    console.log(`show-content-menu trigger,event: ${event.sender}`)
    const win=BrowserWindow.fromWebContents(event.sender)
    console.log(`win: ${win}`)
    console.log(`Popup win to ${win}`)
    menu.popup(win)
})