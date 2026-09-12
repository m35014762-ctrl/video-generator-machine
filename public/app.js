document.getElementById('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('duration', document.getElementById('duration').value * 60); // Convert to seconds
    formData.append('resolution', document.getElementById('resolution').value);
    formData.append('fps', document.getElementById('fps').value);
    
    const audioFile = document.getElementById('audioFile').files[0];
    if (audioFile) {
        formData.append('audioFile', audioFile);
    }

    const selectedEffects = Array.from(document.querySelectorAll('input[name="effects"]:checked'))
        .map(el => el.value);
    formData.append('effects', JSON.stringify(selectedEffects));

    showStatus('Processing your video...', 'info');
    showProgress(true);

    try {
        const response = await fetch('/api/generate-video', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate video');
        }

        const data = await response.json();
        await pollVideoStatus(data.videoId, data.downloadUrl);
    } catch (error) {
        showProgress(false);
        showStatus('Error: ' + error.message, 'error');
        console.error('Error:', error);
    }
});

function showStatus(message, type = 'info') {
    const container = document.getElementById('statusMessage');
    container.textContent = message;
    container.className = 'status-message ' + type;
    container.style.display = 'block';
}

function showProgress(show) {
    const container = document.getElementById('progressContainer');
    container.style.display = show ? 'block' : 'none';
    if (show) {
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = 'Processing: 0%';
    }
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = 'Processing: ' + Math.floor(percent) + '%';
}

async function pollVideoStatus(videoId, downloadUrl) {
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes with 1 second intervals
    let lastPercent = 0;

    const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`/api/video-status/${videoId}`);
            const data = await response.json();

            if (data.ready) {
                clearInterval(pollInterval);
                showProgress(false);
                showResult(videoId, downloadUrl);
                document.getElementById('videoForm').reset();
                return;
            }

            // Simulate progress
            lastPercent = Math.min(lastPercent + Math.random() * 30, 95);
            updateProgress(lastPercent);

        } catch (error) {
            console.error('Polling error:', error);
        }

        if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            showProgress(false);
            showStatus('Video generation timeout', 'error');
        }
    }, 1000);
}

function showResult(videoId, downloadUrl) {
    document.getElementById('statusMessage').style.display = 'none';
    const resultContainer = document.getElementById('resultContainer');
    const resultMessage = document.getElementById('resultMessage');
    
    resultMessage.textContent = `Your video (ID: ${videoId.substring(0, 8)}) is ready to download!`;
    resultContainer.style.display = 'block';

    document.getElementById('downloadBtn').onclick = () => {
        window.location.href = downloadUrl;
    };
}
