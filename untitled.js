
async function startRecording() {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
});
recorder = new MediaRecorder(stream);

const chunks = [];
recorder.ondataavailable = e => chunks.push(e.data);
recorder.onstop = e => {
    const blob = new Blob(chunks, { type: chunks[0].type });
    console.log(blob);
   
    stream.getVideoTracks()[0].stop();

    filename="yourCustomFileName"
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
     
    console.log (elem.href)
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
    };
    recorder.start();
}
startRecording(); //Start of the recording 



recorder.stop() // End your recording by emitting this event