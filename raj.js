let mediaRecorder;
let audioChunks = [];
let recognition;

// Sample song database
const songDatabase = {
    "song1": "https://example.com/song1.mp3",
    "song2": "https://example.com/song2.mp3",
    "song3": "https://example.com/song3.mp3",
};

// User management
const users = {};
let currentUser = 'User1'; // Default user

// Set up event listeners
document.getElementById('sendButton').addEventListener('click', () => sendMessage(currentUser));
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage(currentUser);
    }
});

// User switching
document.querySelectorAll('.user-button').forEach(button => {
    button.addEventListener('click', (e) => {
        currentUser = e.target.dataset.username; // Get username from button
        updateCurrentUserDisplay();
    });
});

// Call button functionality
document.getElementById('callButton').addEventListener('click', function() {
    const phoneNumber = "1234567890"; // Replace with the desired phone number
    window.location.href = `tel:${phoneNumber}`;
});

// Voice recording functionality
document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopButton').addEventListener('click', stopRecording);

// Initialize voice recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('messageInput').value = transcript; // Set the input to the spoken text
        sendMessage(currentUser); // Send the message automatically
    };

    recognition.onend = function() {
        console.log('Voice recognition ended.');
    };

    recognition.onerror = function(event) {
        console.error('Recognition error:', event.error);
        alert('There was an error with voice recognition: ' + event.error);
    };

    document.getElementById('voiceButton').addEventListener('click', function() {
        recognition.start(); // Start voice recognition
        console.log('Voice recognition started. Speak now.');
    });
}

// Function to send a message
function sendMessage(user) {
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();

    if (messageText) {
        const timestamp = getCurrentTime();

        // Check for mathematical calculations
        const mathResult = evaluateMathExpression(messageText);
        if (mathResult !== null) {
            displayMessage(`Result: ${mathResult}`, user, 'received', timestamp);
            input.value = ''; // Clear input after sending
            return;
        }

        // Check for song requests
        const songUrl = songDatabase[messageText.toLowerCase()];
        if (songUrl) {
            displayAudio(songUrl, user, 'received', timestamp);
        } else {
            displayMessage(messageText, user, 'sent', timestamp);
            // Simulate AI response
            setTimeout(() => {
                const aiResponse = getAIResponse(messageText);
                displayMessage(aiResponse, user, 'received', getCurrentTime());
            }, 1000);
        }
        input.value = ''; // Clear input after sending
    }
}

// Display a message
function displayMessage(text, user, type, timestamp) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;

    // Add username
    const userElement = document.createElement('strong');
    userElement.textContent = user + ": ";
    messageElement.appendChild(userElement);

    // Add message text
    messageElement.appendChild(document.createTextNode(text));

    // Add timestamp
    const timestampElement = document.createElement('div');
    timestampElement.className = 'timestamp';
    timestampElement.textContent = timestamp;
    messageElement.appendChild(timestampElement);

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Display audio
function displayAudio(src, user, type, timestamp) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;

    // Add username
    const userElement = document.createElement('strong');
    userElement.textContent = user + ": ";
    messageElement.appendChild(userElement);

    // Add audio element
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = src;
    messageElement.appendChild(audioElement);

    // Add timestamp
    const timestampElement = document.createElement('div');
    timestampElement.className = 'timestamp';
    timestampElement.textContent = timestamp;
    messageElement.appendChild(timestampElement);

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Function to get the current date and time
function getCurrentTime() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const time = now.toLocaleTimeString([], options);
    const date = now.toLocaleDateString();
    return `${date} ${time}`;
}

// Add a way to update the current user display
function updateCurrentUserDisplay() {
    document.getElementById('currentUser').textContent = `Current User: ${currentUser}`;
}

// Voice recording functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const timestamp = getCurrentTime();
            displayAudio(audioUrl, currentUser, 'sent', timestamp);
            audioChunks = []; // Reset for the next recording
        };

        mediaRecorder.start();
        console.log("Recording started...");
    } catch (error) {
        console.error("Error accessing microphone: ", error);
        alert("Could not start recording. Please check your microphone permissions.");
    }
}

function stopRecording() {
    mediaRecorder.stop();
}

// AI response logic
function getAIResponse(userMessage) {
    const responses = {
        "hello": "Hi there! How can I assist you?",
        "how are you?": "I'm just a program, but I'm doing well!",
        "bye": "Goodbye! Have a nice day!",
        "help": "What do you need help with?",
        "default": "I'm not sure how to respond to that."
        // Add more responses as needed
    };

    const normalizedMessage = userMessage.toLowerCase();
    return responses[normalizedMessage] || responses["default"];
}

// Function to evaluate mathematical expressions
function evaluateMathExpression(expression) {
    try {
        const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
        const result = eval(sanitizedExpression);
        return (typeof result === 'number' && isFinite(result)) ? result : null;
    } catch (error) {
        return null;
    }
}
