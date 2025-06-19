chrome.runtime.onMessage.addListener(async (message , sender , sendResponse) => {
    if (message.action === 'START_RECORDING') {
        try {
            console.log("inside content.js")
            const stream = await  navigator.mediaDevices.getDisplayMedia({
                video: {mediaSource : 'screen'}, 
                audio : true
            });

            // for previewing it 
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            video.style = "position:fixed;top:10px;left:10px;width:300px;z-index:9999;";
            document.appendChild(video);

            sendResponse({success : true});
        }
        catch(err) {
            console.errror('Error : ', err);
            sendResponse({
                success : false ,
                error : err.message
            });
        }
    }

    return true;
})