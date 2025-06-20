// Declare stream and recorder in a scope accessible by both startRecording and stopBtn event listener
let stream;
let recorder;

async function startRecording() {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        // Listen for the 'inactive' event on the stream itself
        // When the user clicks 'Stop sharing' from the browser's ui
        stream.oninactive = () => {
            console.log("MediaStream became inactive.    Stopping  recorder if active.");
            if (recorder && recorder.state === 'recording') {
                recorder.stop(); // Manually stop the recorder if the stream becomes inactive
            } else {
                // If the recorder is already stopped or not recording, but stream went inactive,
                // it implies the recording was implicitly stopped (e.g., user closed shared window)
                // In this case, if chunks exist, we might still want to process them
                if (chunks.length > 0) {
                     console.log("Stream inactive, recorder not recording. Processing existing chunks.");
                     // Manually trigger the processing logic as if onstop fired
                     processRecordedData(chunks);
                } else {
                    console.warn("Stream became inactive but no chunks were recorded or recorder was not active.");
                    // Optionally alert the user that recording stopped unexpectedly without data
                    alert("Recording stopped.");
                }
            }
        };

        recorder = new MediaRecorder(stream);

        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);

        recorder.onstop = e => {
            console.log("Recorder onstop event fired.");
            processRecordedData(chunks);
        };

        recorder.onerror = event => {
            console.error("MediaRecorder error:", event.error);
            alert("Recording error: " + event.error.name + " - " + event.error.message);
            // handle error state or cleanup
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };

        recorder.start();
        console.log("Recording started.");

    } catch (err) {
        console.error("Error starting recording:", err);
        alert("Failed to start recording. Please ensure you grant screen sharing permissions.");
    }
}

// Unified function to process recorded data, called by both onstop and oninactive handler
function processRecordedData(recordedChunks) {
    if (recordedChunks.length === 0) {
        console.warn("No data chunks available to create video.");
        alert("Recording stopped, but no video data was captured. This can happen if you immediately stop sharing.");
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        return;
    }

    const blob = new Blob(recordedChunks, { type: recordedChunks[0].type });
    console.log("Blob created:", blob);

    // Stop the stream tracks to release resources
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // Create a blob URL for the video
    const videoBlobUrl = window.URL.createObjectURL(blob);
    console.log("Video Blob URL:", videoBlobUrl);

    // Create an HTML string that embeds the video
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <link href="index.css" rel="stylesheet">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recorded Video Playback</title>
            <style>
                body {
                    background-color: #333;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    color: white; /* For better visibility of text */
                }
                video {
                    max-width: 80vw;
                    max-height: 50vh;
                    border: 2px solid black;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
            </style>
        </head>
        <body>
            <video controls   src="${videoBlobUrl}"></video>
            <script>
                // Revoke object URLs when the page is unloaded to free memory
                window.addEventListener('beforeunload', () => {
                    console.log('Revoking video object URL:', '${videoBlobUrl}');
                    window.URL.revokeObjectURL('${videoBlobUrl}');
                });
                window.addEventListener('unload', () => {
                     console.log('Revoking video object URL on unload:', '${videoBlobUrl}');
                     window.URL.revokeObjectURL('${videoBlobUrl}');
                });
            </script>
        </body>
        </html>
    `;

    // Create a blob for the HTML content
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    // Create a URL for the HTML blob
    const htmlBlobUrl = window.URL.createObjectURL(htmlBlob);
    console.log("HTML Blob URL:", htmlBlobUrl);

    // Open the HTML blob URL in a new tab
    chrome.tabs.create({ url: htmlBlobUrl }, (tab) => {
        if (chrome.runtime.lastError) {
            console.error("Error opening new tab:", chrome.runtime.lastError.message);
            alert("Failed to open video in a new tab. Check console for details.");
        } else {
            console.log("Opened video in new tab:", tab.url);
        }
    });

    // Optionally close the current record.html tab
    // window.close();
}


// Event listener for the stop button
document.getElementById("stop").addEventListener("click", () => {
    if (recorder && recorder.state === 'recording') {
        recorder.stop();
        console.log("Recorder stopped by button.");
    } else {
        console.log("Recorder not active or already stopped. Stream state:", stream ? stream.active : 'N/A');
        // If the recorder is not active, but the stream is, it means the user might have clicked "Stop sharing"
        if (stream && stream.active) {
            alert("Please use the 'Stop RECORDING' button in the extension. Clicking 'Stop sharing' from the browser bar may cause issues with data saving.");
        }
    }
});


// Call startRecording to initiate the process when record.html loads
startRecording();