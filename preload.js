window.addEventListener('DOMContentLoaded',()=>{
    const ReplaceText=(selector,text)=>{
        const element=document.getElementById(selector)
        if(element) element.innerText=text
    }

    ReplaceText(`spSysMsg`,'程序已準備完成')
})