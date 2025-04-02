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
    Frontend <--> SocketIO

    %% Frontend major sections
    subgraph "Frontend Components"
        Pages("Pages\n- Home\n- User Profile\n- Auth\n- Chat\n- Post\n- Settings")
        CoreUI("Core UI Components\n- Header\n- Post\n- UserHeader\n- Actions\n- NotificationIcon\n- SharePostModal")
        State("State Management\n(Recoil)")
        Contexts("Context Providers\n- SocketContext\n- NotificationContext")
    end

    %% Backend major sections
    subgraph "Backend Structure"
        Routes("Routes\n- User\n- Post\n- Message\n- AI\n- Notification")
        Controllers("Controllers\n- User\n- Post\n- Message\n- AI\n- Notification")
        Models("Models\n- User\n- Post\n- Conversation\n- Message\n- Notification")
        Auth("Authentication\n(JWT)")
    end

    %% Message Management section
    subgraph MessageManagement["Message Management"]
        SingleMsg("Single Message\nDeletion")
        BulkMsg("Bulk Message\nClearing")
        MediaCleanup("Media Files\nCleanup")
        RTSync("Real-time\nSynchronization")
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
    Frontend --- Contexts

    Backend --- Routes
    Backend --- Controllers
    Backend --- Models
    Backend --- Auth

    Controllers --> MessageManagement
    MessageManagement --> SingleMsg
    MessageManagement --> BulkMsg
    BulkMsg --> MediaCleanup
    MessageManagement --> RTSync
    RTSync --> SocketIO
    MediaCleanup --> Cloudinary

    AI --- PostEnhance
    AI --- ContentMod
    AI --- ChatSuggestions
    AI --- ImageCaption
    AI --- Hashtags
```

## Notification System Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant NotificationContext as NotificationContext
    participant Backend as Backend API
    participant Database as Database
    participant Socket as Socket.IO

    %% Fetch Notifications
    User->>Frontend: Log in / Visit app
    Frontend->>NotificationContext: Initialize
    NotificationContext->>Backend: GET /api/v1/notifications
    NotificationContext->>Backend: GET /api/v1/notifications/unread
    Backend->>Database: Query notifications
    Database-->>Backend: Return notifications
    Backend-->>NotificationContext: Return notifications
    NotificationContext-->>Frontend: Update state with notifications

    %% Receive Real-time Notification
    Note over Backend,Socket: When a new notification is created:
    Backend->>Database: Save notification
    Backend->>Socket: Emit "newNotification"
    Socket-->>NotificationContext: Receive "newNotification"
    NotificationContext->>NotificationContext: Filter chat notifications if on chat page
    NotificationContext->>NotificationContext: Play sound if window not focused
    NotificationContext-->>Frontend: Update notification state

    %% Mark as Read
    User->>Frontend: Click notification
    Frontend->>NotificationContext: markAsRead(id)
    NotificationContext->>Backend: PUT /api/v1/notifications/mark-read/:id
    Backend->>Database: Update notification
    Database-->>Backend: Confirm update
    Backend-->>NotificationContext: Success response
    NotificationContext-->>Frontend: Update notification state

    %% Mark All as Read
    User->>Frontend: Click "Mark all read"
    Frontend->>NotificationContext: markAllAsRead()
    NotificationContext->>Backend: PUT /api/v1/notifications/mark-all-read
    Backend->>Database: Update all notifications
    Database-->>Backend: Confirm update
    Backend-->>NotificationContext: Success response
    NotificationContext-->>Frontend: Update notification state

    %% Clear All Notifications
    User->>Frontend: Click "Clear all"
    Frontend->>NotificationContext: clearAllNotifications()
    NotificationContext->>Backend: DELETE /api/v1/notifications/clear-all
    Backend->>Database: Delete notifications
    Database-->>Backend: Confirm deletion
    Backend-->>NotificationContext: Success response
    NotificationContext-->>Frontend: Clear notification state
```

## Post Sharing Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Post as Post Component
    participant ShareModal as Share Post Modal
    participant Backend as Backend API
    participant Database as Database
    participant RecipientSocket as Recipient Socket
    participant RecipientUI as Recipient UI

    %% Start sharing process
    User->>Post: Click share button
    Post->>ShareModal: Open SharePostModal
    ShareModal->>User: Display post preview

    %% Search for recipients
    User->>ShareModal: Enter search text
    ShareModal->>Backend: GET /api/v1/users/search?search=query
    Backend->>Database: Search users
    Database-->>Backend: Return matching users
    Backend-->>ShareModal: Return user list
    ShareModal->>User: Display user options

    %% Select recipient and share
    User->>ShareModal: Select user and add message
    User->>ShareModal: Click Share
    ShareModal->>Backend: POST /api/v1/messages
    Note right of ShareModal: Send recipientId, message, sharedPostId

    Backend->>Database: Create message with shared post
    Database-->>Backend: Return created message

    Backend->>Database: Update conversation
    Database-->>Backend: Return updated conversation

    Backend->>Database: Create notification
    Database-->>Backend: Return created notification

    Backend->>RecipientSocket: Emit "newMessage" event
    Backend->>RecipientSocket: Emit "newNotification" event

    RecipientSocket-->>RecipientUI: Update messages
    RecipientSocket-->>RecipientUI: Update notifications

    Backend-->>ShareModal: Return success
    ShareModal->>User: Show success toast and close
```

## Message Model with Shared Post

```mermaid
classDiagram
    class Message {
        +ObjectId _id
        +ObjectId conversationId
        +ObjectId sender
        +String text
        +Boolean seen
        +String img
        +Boolean deleted
        +ObjectId sharedPost
        +Date createdAt
        +Date updatedAt
    }

    class Post {
        +ObjectId _id
        +ObjectId postedBy
        +String text
        +String img
        +Array likes
        +Array replies
        +Date createdAt
        +Date updatedAt
    }

    class Notification {
        +ObjectId _id
        +ObjectId recipient
        +ObjectId sender
        +String type
        +ObjectId post
        +ObjectId message
        +Boolean read
        +String text
        +Date createdAt
        +Date updatedAt
    }

    Message "1" --> "0..1" Post : references
    Notification "1" --> "0..1" Post : references
    Notification "1" --> "0..1" Message : references
```

## Message Management Flow

```mermaid
sequenceDiagram
    participant User as User
    participant ChatUI as Chat Interface
    participant Backend as Backend API
    participant Database as Database
    participant Cloudinary as Cloudinary
    participant RecipientSocket as Recipient Socket
    participant RecipientUI as Recipient UI

    %% Clear All Messages Flow
    User->>ChatUI: Click trash icon
    ChatUI->>User: Show confirmation dialog
    User->>ChatUI: Confirm deletion
    ChatUI->>Backend: DELETE /api/v1/messages/clear/:otherUserId

    Backend->>Database: Find conversation
    Database-->>Backend: Return conversation

    Backend->>Database: Find all messages with images
    Database-->>Backend: Return messages

    Backend->>Cloudinary: Delete images from messages
    Cloudinary-->>Backend: Confirm image deletion

    Backend->>Database: Delete all messages from conversation
    Database-->>Backend: Confirm message deletion

    Backend->>Database: Update conversation lastMessage
    Database-->>Backend: Confirm update

    Backend->>RecipientSocket: Emit "chatCleared" event
    Backend-->>ChatUI: Return success

    ChatUI->>User: Show success notification
    RecipientSocket-->>RecipientUI: Update UI to clear messages
    RecipientUI->>RecipientUI: Show notification about cleared chat
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
- **Notification System**: Real-time notifications with context-aware filtering and management
- **Post Sharing**: Direct sharing of posts to other users' chats with optional messages
- **Message Management**: Individual message deletion and bulk conversation clearing with media cleanup
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

### Notification System

- Notifications are created for various actions (likes, replies, follows, messages, shared posts)
- Context-aware filtering hides chat notifications when on the chat page
- Real-time delivery through Socket.IO
- Comprehensive management with mark as read, mark all as read, and clear all features

### Post Sharing Flow

- Users can share posts directly to another user's chat
- Posts are embedded within messages with preview capabilities
- Shared posts maintain links to original content
- Recipients receive real-time notifications about shared posts

### Message Management System

- Individual messages can be deleted with "This message was deleted" indicator
- Entire conversations can be cleared with a single action
- All associated media files are automatically removed from Cloudinary
- Real-time synchronization ensures both users see consistent state
- Confirmation dialogs prevent accidental data loss
