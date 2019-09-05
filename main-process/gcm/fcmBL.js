const {
    BrowserWindow,
    ipcMain,
    app
}=require('electron')
const Admin=require('firebase-admin')

const ServiceAccount=require(`${__dirname}/guide-681c1-firebase-adminsdk-j9sn1-7ce1ce81d7.json`)

const AdminToken='dCB4Nn10Ejg:APA91bETAlgVosIcnUfwt3wDWub2PjL6Wh0xJVq9AdhGD7JPpGcY2FTEfNUU5jskpyeOv3eI98GB4ysXAJ4clOMF2EM7T_QRV3tK9EGHzXQdc_HH19GDClt00QVtQp-6a0cFOu5ez518'

Admin.initializeApp({
    credential:Admin.credential.cert(ServiceAccount),
    databaseURL:'https://guide-681c1.firebaseio.com'
})

app.on('browser-window-created',(event,win)=>{
    SendMessage(AdminToken,'Notification title','Notification body')
})

ipcMain.on('send-message',(token,title,message)=>{
    SendMessage(token,title,message)
})

const SendMessage=(token,title,message)=>{
    var message_notification={
        token:token,
        notification:{
            title:title,
            body:message            
        }
    }
    Admin.messaging().send(message_notification)
    .then(
        response=>{
            console.log(`gcm send message success ${response}`);
        }
    )
    .catch(
        err=>{
            console.log(`gcm send fail ${err}`)
        }
    )
}