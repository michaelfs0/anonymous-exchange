let isRecording = false;
let audioBlob = null;

// DOM Elements
const textInput = document.getElementById('textInput');
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const sendButton = document.getElementById('sendButton');
const audioPreview = document.getElementById('audioPreview');
const responseContent = document.getElementById('responseContent');

// MediaRecorder setup
let mediaRecorder;
const audioChunks = [];

// Enable send button when input or recording is active
textInput.addEventListener('input', () => {
  sendButton.disabled = textInput.value.trim() === '' && !audioBlob;
});

// Start recording audio
recordButton.addEventListener('click', async () => {
  if (!navigator.mediaDevices) {
    alert('Audio recording is not supported on this device.');
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
  mediaRecorder.onstop = () => {
    audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    audioPreview.src = URL.createObjectURL(audioBlob);
    audioPreview.hidden = false;
    sendButton.disabled = false;
  };

  mediaRecorder.start();
  isRecording = true;
  recordButton.disabled = true;
  stopButton.disabled = false;
});

// Stop recording
stopButton.addEventListener('click', () => {
  if (isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    recordButton.disabled = false;
    stopButton.disabled = true;
  }
});

// Send data to server
sendButton.addEventListener('click', async () => {
  const formData = new FormData();
  if (textInput.value.trim()) {
    formData.append('type', 'text');
    formData.append('text', textInput.value.trim());
  } else if (audioBlob) {
    formData.append('type', 'audio');
    formData.append('audio', audioBlob, 'recording.mp3');
  }

  try {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    // Очистка интерфейса после отправки
    textInput.value = '';
    audioBlob = null;
    audioChunks.length = 0;
    audioPreview.src = '';
    audioPreview.hidden = true; // Убираем аудиоплеер после отправки
    sendButton.disabled = true;

    // Отображаем полученное сообщение
    if (data.received) {
      if (data.received.type === 'text') {
        responseContent.textContent = data.received.content;
      } else if (data.received.type === 'audio') {
        const audio = document.createElement('audio');
        audio.src = `/uploads/${data.received.content}`;
        audio.controls = true;
        responseContent.innerHTML = '';
        responseContent.appendChild(audio);
      }
    } else {
      responseContent.textContent = 'No messages available.';
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

