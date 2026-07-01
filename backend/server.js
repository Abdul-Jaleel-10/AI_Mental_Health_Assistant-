// backend/server.js
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 5000;

// // Dummy AI response endpoint
// app.post("/api/send-message", (req, res) => {
//   const { message } = req.body;
//   const reply = `AI: I understand you're feeling "${message}". Let's talk more.`;
//   res.json({ reply });
// });

// app.get("/", (req, res) => {
//   res.send("Mental Health Assistant API is live!");
// });

// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Ollama } = require('ollama');

// Check if API key is present
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

const app = express();

// Updated CORS configuration
app.use(cors({
  origin: ['http://127.0.0.1:5501', 'http://localhost:5501', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// MongoDB Connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  
  // Verify connection by checking if we can access collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:', collections.map(c => c.name));
    }
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if we can't connect to MongoDB
});

// Add connection event handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }, 5000);
});

// Import models
const Therapist = require('./models/Therapist');
const Appointment = require('./models/Appointment');
const Mood = require('./models/Mood');
const WellnessCheck = require('./models/WellnessCheck');

// Initialize Gemini AI with safety settings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.0-pro",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

// Store chat history (in memory for now - in production use a database)
const chatHistory = new Map();

// Initialize Ollama
const ollama = new Ollama({
  host: 'http://localhost:11434' // Default Ollama host
// Helper function to analyze sentiment
async function analyzeSentiment(message) {
  try {
    const prompt = `Analyze the emotional sentiment in this message and categorize it (positive, negative, neutral, or concerning). Message: "${message}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().toLowerCase();
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return "neutral";
  }
}

// Helper function to generate appropriate response based on sentiment
async function generateResponse(message, sentiment, sessionId) {
  const history = chatHistory.get(sessionId) || [];
  const contextPrompt = `
You are an empathetic and professional mental health assistant. Your goal is to provide supportive, understanding responses while encouraging healthy coping mechanisms.

Previous conversation context:
${history.slice(-3).map(msg => msg.role + ': ' + msg.content).join('\n')}

Current user message: "${message}"
Detected sentiment: ${sentiment}

Respond in a way that:
1. Shows empathy and understanding
2. Validates their feelings
3. Offers gentle guidance or coping strategies when appropriate
4. Encourages professional help if the content is concerning
5. Maintains a supportive and non-judgmental tone
6. Asks relevant follow-up questions to better understand their situation

Response:`;

  try {
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Response generation error:", error);
    return "I'm here to support you. Would you like to tell me more about how you're feeling?";
  }
}

// Chat endpoint with enhanced features
app.post("/api/send-message", async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    console.log("Received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Analyze sentiment
    const sentiment = await analyzeSentiment(message);
    console.log("Detected sentiment:", sentiment);

    // Generate AI response
    const aiResponse = await generateResponse(message, sentiment, sessionId);

    // Update chat history
    if (!chatHistory.has(sessionId)) {
      chatHistory.set(sessionId, []);
    }
    chatHistory.get(sessionId).push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );

    // If history gets too long, keep only last 10 messages
    if (chatHistory.get(sessionId).length > 20) {
      chatHistory.set(sessionId, chatHistory.get(sessionId).slice(-20));
    }

    // Check for concerning content
    const needsHelp = sentiment.includes('concerning') || 
                     message.toLowerCase().includes('suicide') || 
                     message.toLowerCase().includes('hurt myself');

    res.json({ 
      reply: aiResponse,
      sentiment: sentiment,
      needsHelp: needsHelp,
      helpResources: needsHelp ? {
        emergencyNumber: '911',
        helpline: '1-800-273-8255',
        crisisText: 'Text HOME to 741741'
      } : null
    });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ 
      error: "AI Service Error", 
      details: error.message 
    });
  }
});

// Mood tracking endpoint
app.post("/api/track-mood", async (req, res) => {
  try {
    const { mood, intensity, notes, userId } = req.body;
    
    // Create a new mood entry
    const moodEntry = new Mood({
      userId,
      mood,
      intensity,
      notes,
      timestamp: new Date()
    });

    // Save to database
    const savedMood = await moodEntry.save();
    
    res.json({ 
      success: true,
      data: savedMood
    });
  } catch (error) {
    console.error('Error tracking mood:', error);
    res.status(500).json({ 
      error: "Failed to track mood",
      details: error.message 
    });
  }
});

// Wellness check endpoint
app.post("/api/wellness-check", async (req, res) => {
  try {
    const { answers, userId } = req.body;
    
    // Create a new wellness check entry
    const wellnessCheck = new WellnessCheck({
      userId,
      answers,
      timestamp: new Date()
    });

    // Save to database
    const savedCheck = await wellnessCheck.save();
    
    res.json({ 
      success: true,
      data: savedCheck
    });
  } catch (error) {
    console.error('Error processing wellness check:', error);
    res.status(500).json({ 
      error: "Failed to process wellness check",
      details: error.message 
    });
  }
});

// API Routes

// Get all therapists
app.get('/api/therapists', async (req, res) => {
  try {
    const therapists = await Therapist.find({ active: true });
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get appointments for a therapist
app.get('/api/appointments/:therapistId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      therapistId: req.params.therapistId,
      status: { $ne: 'cancelled' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add sample therapist data
app.post('/api/seed-therapists', async (req, res) => {
  try {
    const sampleTherapists = [
      {
        name: "Dr. Sarah Johnson",
        specialization: "Anxiety & Depression",
        experience: "15 years",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        availability: ["Monday", "Wednesday", "Friday"]
      },
      {
        name: "Dr. Michael Chen",
        specialization: "Stress Management",
        experience: "12 years",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        availability: ["Tuesday", "Thursday", "Saturday"]
      },
      {
        name: "Dr. Emily Rodriguez",
        specialization: "Relationship Counseling",
        experience: "10 years",
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        availability: ["Monday", "Tuesday", "Thursday"]
      }
    ];

    await Therapist.insertMany(sampleTherapists);
    res.status(201).json({ message: 'Sample therapists added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("CORS enabled for frontend");
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
