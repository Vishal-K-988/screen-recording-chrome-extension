let mediaRecorder;
let recordedChunks = [];

const capturedLogs = [];
const originalConsoleLog = console.log;

console.log = function (...args) {
  const time = Date.now();
  capturedLogs.push({ type: 'log', args, time });
  originalConsoleLog.apply(console, args);
};

function showLoader(message = "Preparing your recording...") {
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
      <h2>${message}</h2>
      <p>Just a moment...</p>
    </div>`;
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8'
    });

    let isRecordingStopped = false;
    let resolveAllChunksFlushed;
    const allChunksFlushed = new Promise(resolve => {
      resolveAllChunksFlushed = resolve;
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log('🧱 Chunk received:', event.data.size);
      }

      // Resolve only after last chunk is processed
      if (isRecordingStopped) {
        resolveAllChunksFlushed();
      }
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 MediaRecorder onstop triggered");
      isRecordingStopped = true;
    };

    mediaRecorder.start(5000); // chunk every 5 seconds
    console.log("🎬 Recording started");

    document.getElementById('stopBtn').addEventListener('click', async () => {
      console.log("🔴 Stop button clicked");
      showLoader();

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Stop recorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

      // ✅ Wait until onstop + final chunk is flushed
      await allChunksFlushed;

      // Final double-check pause
      await new Promise(r => setTimeout(r, 300));

      if (recordedChunks.length === 0) {
        alert("⚠️ No data was recorded. Try again.");
        window.close();
        return;
      }

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const videoWindow = window.open();
      videoWindow.document.write(`
        <video controls autoplay style="width: 100%; height: 100%;">
          <source src="${url}" type="video/webm">
          Your browser does not support the video tag.
        </video>
      `);

      setTimeout(() => window.close(), 1000);
    });

  } catch (err) {
    console.error("Recording error:", err);
    alert("Error: " + err.message);
    window.close();
  }
}

startRecording();
