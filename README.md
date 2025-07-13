# AI Chatbot Application

A modern, responsive AI chatbot interface built with React.js featuring multiple conversations, intelligent responses, and seamless API integration with automatic fallback to mock APIs.

![Chatbot Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 💬 **Modern Chat Interface**
- **Desktop-friendly design** similar to ChatGPT, Claude, or Copilot Chat
- **Responsive layout** that works on mobile, tablet, and desktop
- **Message bubbles** with user/bot avatars and timestamps
- **Smooth animations** for sending/receiving messages
- **Typing indicators** with "AI is thinking..." animation

### 🔄 **Multi-Conversation Support**
- **Multiple chat sessions** - Create separate conversations
- **Conversation history** - All chats are preserved and accessible
- **Easy switching** - Click any conversation to switch to it
- **Smart titles** - Conversations are titled based on first message
- **Delete functionality** - Remove conversations with confirmation

### 🎨 **User Experience**
- **Clean, modern design** with consistent spacing and typography
- **Status indicators** showing connection status (Connected/Mock API/Local Mode)
- **Error handling** with user-friendly messages
- **Auto-scroll** to latest messages with manual scroll-to-bottom button
- **Enter to send** messages (Shift+Enter for new lines)

### 🔌 **Smart API Integration**
- **Automatic fallback system** - Real API → Mock API → Local responses
- **Mock API simulation** - Full conversation management without backend
- **Context-aware responses** - Smart replies based on message content
- **Realistic delays** - Simulates actual AI processing time

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your API settings
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
REACT_APP_API_URL=https://your-api-domain.com/api

# App Configuration
REACT_APP_NAME=AI Chatbot
REACT_APP_VERSION=1.0.0
```

### API Endpoints

If you have a real backend, it should implement these endpoints:

```
GET    /api/health                     - Health check
GET    /api/conversations              - Get all conversations
POST   /api/conversations              - Create new conversation
GET    /api/conversations/:id          - Get specific conversation
POST   /api/conversations/:id/messages - Send message
DELETE /api/conversations/:id          - Delete conversation
DELETE /api/conversations              - Clear all conversations
```

### Expected API Response Format

```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": 1,
      "text": "Hello",
      "isBot": false,
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "aiMessage": {
      "id": 2,
      "text": "Hi there! How can I help?",
      "isBot": true,
      "timestamp": "2024-01-01T00:00:05Z"
    }
  }
}
```

## 🔧 How It Works

### Three-Tier Fallback System

1. **🟢 Connected Mode** - Uses your real API endpoints
2. **🟣 Mock API Mode** - Uses sophisticated mock functions when real API unavailable
3. **🟡 Local Mode** - Basic responses as final fallback

### Mock API Features

The built-in mock API provides:
- **In-memory conversation storage**
- **Context-aware responses** (greetings, help, thanks, etc.)
- **Realistic processing delays** (1-3 seconds)
- **Full CRUD operations** for conversations
- **20+ intelligent response templates**

## 📁 Project Structure

```
src/
├── components/
│   ├── Chat.js              # Main chat component
│   ├── Chat.module.css      # Chat styling
│   ├── Sidebar.js           # Conversation sidebar
│   └── Sidebar.module.css   # Sidebar styling
├── services/
│   ├── apiService.js        # API client with fallback logic
│   └── mockApi.js           # Mock API implementation
├── App.js                   # Main app component
└── index.js                 # App entry point
```

## 🎯 Usage

### Basic Chat
1. Type your message in the input box
2. Press Enter or click Send
3. Watch the AI respond with contextual replies

### Multiple Conversations
1. Click "New Chat" to start a fresh conversation
2. Previous conversations remain accessible in the sidebar
3. Click any conversation to switch to it
4. Use the delete button to remove conversations

### API Integration
1. Configure your API URL in `.env`
2. App automatically detects and connects to your backend
3. Falls back to mock APIs if real API is unavailable
4. Status indicator shows current connection mode

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Adding New Features

1. **New API endpoints** - Add to `apiService.js` and `mockApi.js`
2. **UI components** - Create in `components/` folder
3. **Styling** - Use CSS Modules (`.module.css`)
4. **State management** - Currently uses React hooks

## 🎨 Customization

### Theming
- Modify colors in CSS files
- Update `Chat.module.css` for main interface
- Update `Sidebar.module.css` for sidebar styling

### Response Templates
- Edit `mockResponses` array in `mockApi.js`
- Add new contextual responses in `contextualResponses`

### API Configuration
- Update `apiService.js` for new endpoints
- Modify request/response handling as needed

## 🔍 Troubleshooting

### Common Issues

**App shows "Mock API" status:**
- This is normal if no real backend is configured
- Update `REACT_APP_API_URL` in `.env` to point to your API

**Messages not sending:**
- Check browser console for errors
- Verify API endpoint responses match expected format

**Styling issues:**
- Clear browser cache
- Check for CSS module import conflicts

## 📝 API Development Guide

### Backend Requirements

Your backend should:
1. **Accept JSON requests** with `Content-Type: application/json`
2. **Return JSON responses** in the expected format
3. **Handle CORS** for browser requests
4. **Implement all required endpoints**

### Testing Your API

Use the browser developer tools to:
1. Monitor network requests
2. Check API response formats
3. Debug connection issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- [Create React App](https://github.com/facebook/create-react-app)
- [React Documentation](https://reactjs.org/)

## 📞 Support

For issues and questions:
1. Check this README
2. Review the browser console for errors
3. Open an issue in the repository

---

**Built with ❤️ using React.js**