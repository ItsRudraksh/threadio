# Threadio Architecture Diagram

```mermaid
flowchart TD
    %% Main components with clear labels
    Frontend("Frontend\n(React.js, Chakra UI)")
    Backend("Backend\n(Express.js)")
    Database("Database\n(MongoDB Atlas)")
    AI("AI Services\n(Google Gemini AI)")
    
    %% External services
    Cloudinary("Media Storage\n(Cloudinary)")
    SocketIO("Real-time Communication\n(Socket.IO)")
    
    %% Main connections
    Frontend <--> Backend
    Backend <--> Database
    Backend <--> AI
    Backend <--> Cloudinary
    Backend <--> SocketIO
    
    %% Frontend major sections
    subgraph "Frontend Components"
        Pages("Pages\n- Home\n- User Profile\n- Auth\n- Chat\n- Post\n- Settings")
        CoreUI("Core UI Components\n- Header\n- Post\n- UserHeader\n- Actions")
        State("State Management\n(Recoil)")
    end
    
    %% Backend major sections
    subgraph "Backend Structure"
        Routes("Routes\n- User\n- Post\n- Message\n- AI")
        Controllers("Controllers")
        Models("Models\n- User\n- Post\n- Conversation\n- Message")
        Auth("Authentication\n(JWT)")
    end
    
    %% AI features section
    subgraph "AI Features"
        PostEnhance("Post Enhancement")
        ContentMod("Content Moderation")
        ChatSuggestions("Smart Reply Suggestions")
        ImageCaption("Image Caption Generation")
        Hashtags("Hashtag Suggestions")
    end
    
    %% Connect sections to main components
    Frontend --- Pages
    Frontend --- CoreUI
    Frontend --- State
    
    Backend --- Routes
    Backend --- Controllers
    Backend --- Models
    Backend --- Auth
    
    AI --- PostEnhance
    AI --- ContentMod
    AI --- ChatSuggestions
    AI --- ImageCaption
    AI --- Hashtags
```

## Architecture Overview

Threadio is built on a MERN stack architecture with integrated AI capabilities:

### Core Components
- **Frontend**: React.js with Chakra UI for responsive design
- **Backend**: Express.js server handling API requests and business logic
- **Database**: MongoDB Atlas for data persistence
- **AI**: Google Gemini AI for intelligent features

### Key Features
- **Core Social Features**: Posts, comments, likes, follows, real-time chat
- **AI-Enhanced Capabilities**: 
  - Post enhancement with suggestions
  - Content moderation for community guidelines
  - Smart reply suggestions in chat
  - Automatic image caption generation
  - Intelligent hashtag recommendations

### Data Flow
- Users interact with the React frontend
- API requests flow to the Express backend
- Data is stored in MongoDB
- AI features enhance content through Gemini AI integration
- Real-time features (chat, notifications) use Socket.IO
- Media assets are stored in Cloudinary