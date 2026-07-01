// Generate a unique session ID for this chat session
const sessionId = Math.random().toString(36).substring(7);

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize chat features
window.addEventListener('load', () => {
  checkServerConnection();
  initializeVoiceInput();
  initializeMoodTracker();
});

async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/therapists`);
    if (!response.ok) {
      throw new Error('Server response was not ok');
    }
    document.querySelector('.error-message')?.remove();
  } catch (error) {
    console.error('Server connection error:', error);
    showErrorMessage('Unable to connect to the server. Please try again later.');
  }
}

function showErrorMessage(message) {
  // Remove any existing error message
  document.querySelector('.error-message')?.remove();
  
  // Create new error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Insert after header
  const header = document.querySelector('header');
  if (header) {
    header.insertAdjacentElement('afterend', errorDiv);
  }
}

function showAIMessage(text) {
  const chatBox = document.getElementById("chat-box");
  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai-message";
  aiMsg.textContent = text;
  chatBox.appendChild(aiMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showUserMessage(text) {
  const chatBox = document.getElementById("chat-box");
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = `You: ${text}`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoadingMessage() {
  const chatBox = document.getElementById("chat-box");
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message loading-message";
  loadingMsg.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  chatBox.appendChild(loadingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return loadingMsg;
}

function showHelpResources(resources) {
  const chatBox = document.getElementById("chat-box");
  const resourcesDiv = document.createElement("div");
  resourcesDiv.className = "message help-resources";
  resourcesDiv.innerHTML = `
    <div class="resources-box">
      <h4>🆘 Help is Available</h4>
      <p>If you're in crisis, please reach out:</p>
      <ul>
        <li>Emergency: ${resources.emergencyNumber}</li>
        <li>National Suicide Prevention Lifeline: ${resources.helpline}</li>
        <li>Crisis Text Line: ${resources.crisisText}</li>
      </ul>
    </div>
  `;
  chatBox.appendChild(resourcesDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const inputField = document.getElementById("user-input");
  const message = inputField.value.trim();
  if (!message) return;

  // Show user message
  showUserMessage(message);
  
  // Show typing indicator
  const loadingMsg = showLoadingMessage();

  try {
    const response = await fetch("http://localhost:3000/api/send-message", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        message,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Remove loading message
    loadingMsg.remove();
    
    // Show AI response
    showAIMessage(data.reply);

    // If help resources are provided, show them
    if (data.needsHelp && data.helpResources) {
      showHelpResources(data.helpResources);
    }

    // Update mood tracker if sentiment is available
    if (data.sentiment) {
      updateMoodTracker(data.sentiment);
    }
  } catch (error) {
    console.error('Error:', error);
    loadingMsg.remove();
    showErrorMessage("Sorry, there was an error connecting to the server. Please try again.");
  }

  inputField.value = "";
}

// Voice input functionality
function initializeVoiceInput() {
  const voiceButton = document.createElement('button');
  voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
  voiceButton.className = 'voice-input-button';
  voiceButton.onclick = startVoiceInput;
  
  const inputGroup = document.querySelector('.input-group');
  inputGroup.appendChild(voiceButton);
}

function startVoiceInput() {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      document.querySelector('.voice-input-button').classList.add('recording');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      document.getElementById('user-input').value = text;
    };

    recognition.onend = () => {
      document.querySelector('.voice-input-button').classList.remove('recording');
    };

    recognition.start();
  } else {
    showErrorMessage("Voice input is not supported in your browser.");
  }
}

// Mood tracking functionality
function initializeMoodTracker() {
  const moodData = {
    labels: [],
    datasets: [{
      label: 'Mood Score',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  // Initialize mood chart if on mood tracking page
  const moodChart = document.getElementById('mood-chart');
  if (moodChart) {
    new Chart(moodChart, {
      type: 'line',
      data: moodData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10
          }
        }
      }
    });
  }
}

function updateMoodTracker(sentiment) {
  // Save mood data (in production, send to backend)
  const timestamp = new Date().toISOString();
  const moodScore = sentiment === 'positive' ? 8 : 
                    sentiment === 'neutral' ? 5 : 
                    sentiment === 'negative' ? 3 : 4;
                    
  console.log('Mood tracked:', { timestamp, score: moodScore, sentiment });
}
  