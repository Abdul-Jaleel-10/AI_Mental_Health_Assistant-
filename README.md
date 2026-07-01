# AI Mental Health Assistant 🧠💚

An intelligent web-based mental health support platform that combines AI-powered assistance with professional therapy resources. This application provides mood tracking, wellness checks, appointment scheduling, and emergency first-aid guidance.

## 🌟 Features

- **Mood Tracking & Analysis**: Log daily moods and track emotional patterns with visual insights
- **AI Wellness Checks**: Intelligent health questionnaires to assess mental well-being
- **Therapist Matching**: Connect with professional therapists based on your needs
- **Appointment Scheduling**: Easily book and manage therapy sessions
- **Emergency First Aid**: Quick access to mental health crisis resources and guidance
- **Voice Support**: Voice-enabled features for accessibility
- **Mood DNA Profile**: Personalized mood analysis based on your history
- **Interactive Quiz**: Educational content about mental health and wellness
- **Medicine Information**: Reference guide for mental health medications

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Responsive design and styling
- **JavaScript** - Interactive features and API integration
- **Voice APIs** - Browser-based speech recognition and synthesis

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Python Virtual Environment** - For potential ML/AI components

### Data Models
- **Appointment** - Therapy session scheduling
- **Mood** - Emotional state tracking
- **Therapist** - Professional profiles and availability
- **WellnessCheck** - Health assessment records

## 📁 Project Structure

```
mental-health-assistant/
├── backend/
│   ├── server.js           # Express server setup
│   ├── package.json        # Node dependencies
│   ├── models/             # Database models
│   │   ├── Appointment.js
│   │   ├── Mood.js
│   │   ├── Therapist.js
│   │   └── WellnessCheck.js
│   └── env/                # Python virtual environment
├── frontend/
│   ├── index.html          # Main landing page
│   ├── appointment.html    # Appointment booking
│   ├── booking.html        # Booking management
│   ├── mood.html           # Mood tracking
│   ├── mood-dna.html       # Mood analysis
│   ├── first-aid.html      # Emergency resources
│   ├── medicine.html       # Medicine information
│   ├── voice.html          # Voice features
│   ├── quiz.html           # Educational quiz
│   ├── presentation.html   # Information slides
│   ├── script.js           # Frontend JavaScript
│   ├── style.css           # Styling
│   └── assets/             # Images and media
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdul-Jaleel-10/AI_Mental_Health_Assistant-.git
   cd mental-health-assistant
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

5. **Launch the frontend**
   - Open `frontend/index.html` in your web browser
   - Or set up a simple HTTP server:
   ```bash
   cd ../frontend
   python -m http.server 3000
   ```
   - Navigate to `http://localhost:3000`

## 📱 Features in Detail

### Mood Tracking
- Log your emotional state throughout the day
- Track mood patterns over time
- Visual analytics and insights
- Identify triggers and patterns

### Wellness Checks
- AI-powered questionnaires
- Mental health assessments
- Personalized recommendations
- History tracking

### Therapist Directory
- Browse available therapists
- View specializations and availability
- Schedule appointments directly
- Manage ongoing sessions

### Emergency Resources
- Quick access to crisis hotlines
- First-aid mental health techniques
- Grounding exercises
- Emergency contacts

### Voice Features
- Hands-free mood logging
- Voice-based navigation
- Accessibility support
- Natural conversation interface

## 🔧 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/moods` | Retrieve mood history |
| POST | `/api/moods` | Log new mood entry |
| GET | `/api/therapists` | Get available therapists |
| POST | `/api/appointments` | Schedule appointment |
| GET | `/api/appointments` | View scheduled appointments |
| POST | `/api/wellness-check` | Submit wellness assessment |

## 🧪 Testing

Run the application and test each feature:
1. Navigate through different HTML pages
2. Test mood logging functionality
3. Verify appointment scheduling
4. Check voice feature compatibility

## 📊 Database Schema

### Mood Model
```javascript
{
  userId: String,
  mood: String,
  intensity: Number (1-10),
  timestamp: Date,
  notes: String,
  triggers: [String]
}
```

### Appointment Model
```javascript
{
  userId: String,
  therapistId: String,
  date: Date,
  status: String,
  notes: String
}
```

### Therapist Model
```javascript
{
  name: String,
  specialization: [String],
  availability: Object,
  rating: Number,
  bio: String
}
```

### WellnessCheck Model
```javascript
{
  userId: String,
  score: Number,
  answers: Object,
  timestamp: Date,
  recommendations: [String]
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support & Resources

- **Mental Health Crisis**: Contact local emergency services or crisis hotline
- **24/7 Support**: Resources available on the Emergency First Aid page
- **Therapist Support**: Use the therapist directory to connect with professionals

## 🎯 Future Enhancements

- [ ] Machine learning mood prediction
- [ ] Multi-language support
- [ ] Mobile app (React Native/Flutter)
- [ ] Wearable device integration
- [ ] Group therapy features
- [ ] Integration with health tracking apps
- [ ] Video call support for remote therapy
- [ ] Advanced analytics dashboard

## ⚠️ Disclaimer

This application is designed to provide support and should not replace professional mental health treatment. Always consult with a licensed healthcare provider for medical advice. In case of emergency, please contact local emergency services immediately.

---

**Made with ❤️ for mental health awareness and support**

For questions or support, please open an issue on GitHub.
