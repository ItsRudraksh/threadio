# **Threadio**

Threadio is a modern social media application designed for real-time interactions, allowing users to create and engage with posts, chat in real time, and manage their accounts. Built using the MERN stack, Threadio provides a seamless and interactive user experience with additional features like real-time chat, media handling, customizable themes, and AI-powered capabilities that enhance content creation and user interactions.

## **Features**

- 📝 Create and manage posts
- 🗑️ Delete posts
- ❤️ Like and unlike posts
- 💬 Comment on posts
- 👥 Follow and unfollow users
- ❄️ Freeze your account
- 🌓 Dark and light mode
- 📱 Fully responsive design
- 💬 Real-time chat with image support
- 👀 Seen/unseen status for messages
- 🗑️ Delete messages with "This message was deleted" indicator
- 🔍 Context menu for message actions
- 🚫 Account deletion with Cloudinary cleanup
- 🔊 Notification sounds
- 🔏 Two Factor Authentication
- 🤔 Forgot Password Functionality
- ✅ Proper Email Password Validations
- 🔔 Comprehensive notification management
- 🔄 Post sharing to direct messages
- 🧠 Context-aware notification display

## **AI Features**

- 🧠 AI-powered post enhancement
- 🔍 Content moderation using AI
- 💡 Smart chat suggestions using the "/ai" command
- 🤖 AI-powered reply suggestions in chat
- 📷 Automatic image caption generation
- 🏷️ Smart hashtag suggestions

## **Cloud Storage**

- 📁 Organized media storage in Cloudinary
  - Profile pictures stored in `threadio/profileimages`
  - Message images stored in `threadio/messageimages`
  - Post images stored in `threadio/postimages`
- 🗑️ Automatic cleanup of deleted images
- 🔄 Profile picture updates replace old images

## **Technologies Used**

- **Frontend**: React.js, Chakra UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Real-Time Communication**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **File Handling**: Cloudinary
- **AI Processing**: Google Gemini AI
- **State Management**: Recoil

## **Installation**

### **Prerequisites**

Ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher) or Yarn

### **Clone the Repository**

```bash
git clone https://github.com/ItsRudraksh/threadio.git
cd threadio
```

### **Setup Backend**

1. **Navigate to Root Directory:**

   ```bash
   cd threadio
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` File**

   Add your environment variables, including MongoDB URI, JWT secret, Cloudinary credentials, and Gemini AI API key:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_USER=your_email_for_notifications
   EMAIL_PASS=your_email_password
   NODE_ENV=development
   ```

4. **Start the Server:**

   ```bash
   npm run dev
   ```

### **Setup Frontend**

1. **Navigate to Frontend Directory:**

   ```bash
   cd client
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Start the Client:**

   ```bash
   npm run dev
   ```

## **Deployment**

1. **Deploy Backend:**

   - Use platforms like Heroku, AWS or Render.

2. **Deploy Frontend:**
   - Use Vercel or Netlify for frontend deployment.

## **Contributing**

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## **Recent Updates**

- **Post Sharing**: Share posts directly to chat conversations with personalized messages
- **Enhanced Notifications**: Clear all notifications with a single click
- **Smart Notification Display**: Chat notifications are filtered when viewing the chat page
- **Message Deletion**: Messages can now be deleted with a "This message was deleted" indicator
- **Context Menu**: Added a 3-dot menu for message actions
- **AI Chat Suggestions**: Type `/ai` to get context-aware message suggestions
- **Cloudinary Organization**: Media files are now organized in specific folders
- **Account Management**: Account deletion with proper cleanup of all associated media
- **Improved Error Handling**: Better error reporting for AI features

## **Acknowledgments**

- [React.js](https://react.dev/)
- [Chakra UI](https://v2.chakra-ui.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
- [Socket.io](https://socket.io/)
- [Cloudinary](https://cloudinary.com/)
- [JWT](https://jwt.io/)
- [Google Gemini AI](https://deepmind.google/technologies/gemini/)

---
