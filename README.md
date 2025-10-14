# 🎨 Skribble Clone - Multiplayer Drawing Game

A real-time multiplayer drawing and guessing game built with React, TypeScript, Node.js, and Socket.io. Players take turns drawing words while others guess what's being drawn!

## ✨ Features

### 🎮 Core Gameplay
- **Real-time Multiplayer**: Up to multiple players can join a room simultaneously
- **Turn-based Drawing**: Players take turns being the artist while others guess
- **Word Assignment**: Random words are assigned to the drawer from a curated list
- **Scoring System**: Points awarded based on correct guesses and drawing speed
- **Round Management**: Multiple rounds with automatic progression
- **Time Limits**: Each round has a countdown timer for added excitement

### 🎯 Interactive Drawing
- **HTML5 Canvas**: Smooth drawing experience with mouse/touch support
- **Color Palette**: 15 different colors to choose from
- **Brush Sizes**: 6 different brush sizes (1px to 16px)
- **Clear Canvas**: Option to clear and restart drawing
- **Real-time Sync**: Drawing actions are synchronized across all players instantly

### 💬 Communication
- **Live Chat**: Real-time chat system for communication
- **Guess Integration**: Chat messages are automatically checked as guesses
- **System Messages**: Automated messages for game events and notifications
- **Player Status**: Visual indicators for drawing turn and game state

### 🔐 User Management
- **Authentication**: JWT-based user authentication system
- **User Profiles**: Username and unique ID system
- **Room Creation**: Host can create private rooms with custom names
- **Room Joining**: Players can join existing rooms with room codes
- **Host Controls**: Room host can start games and manage settings

## 💡 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation and routing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **TypeScript** - Type-safe server development
- **JWT** - JSON Web Token authentication
- **MongoDB/Mongoose** - Database and ODM (models defined)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GodCoder077/Skribble.git
cd Skribble
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

### Environment Setup

1. **Backend Environment**
Create a `.env` file in the `server` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/skribble
NODE_ENV=development
```

2. **Frontend Environment**
Create a `.env` file in the `client` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Running the Application

1. **Start the Backend Server**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

## 🎯 How to Play

### For Room Host:
1. **Register/Login** with your credentials
2. **Create a Room** with a custom room name
3. **Wait for Players** to join your room
4. **Start the Game** when you have at least 2 players
5. **Take Turns Drawing** when it's your turn

### For Players:
1. **Register/Login** with your credentials
2. **Join a Room** using the room name
3. **Wait for Host** to start the game
4. **Guess the Word** when others are drawing
5. **Draw Your Word** when it's your turn

### Game Rules:
- Each player gets a turn to draw a randomly assigned word
- Other players guess what's being drawn by typing in chat
- Points are awarded for correct guesses and successful drawings
- Game continues for multiple rounds with different drawers
- Player with the highest score at the end wins!

## 🏗️ Project Structure

```
Skribble_Clone/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── DrawingCanvas.tsx    # Canvas drawing component
│   │   │   ├── Navbar.tsx           # Navigation component
│   │   │   └── ProtectedRoutes.tsx  # Route protection
│   │   ├── context/        # React context providers
│   │   │   ├── AuthContext.tsx      # Authentication state
│   │   │   └── RoomContext.tsx      # Room/game state
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useHook.tsx          # Socket and game logic
│   │   ├── pages/          # Main application pages
│   │   │   ├── DashBoard.tsx        # Room management
│   │   │   ├── GameRoom.tsx         # Main game interface
│   │   │   ├── LoginPage.tsx        # User authentication
│   │   │   └── RegisterPage.tsx     # User registration
│   │   ├── services/       # External service integrations
│   │   │   └── SocketService.tsx    # Socket.io client wrapper
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   │   ├── AuthController.ts    # Authentication logic
│   │   │   └── RoomController.ts    # Room management
│   │   ├── db/            # Database configuration
│   │   │   ├── init.ts             # Database initialization
│   │   │   └── models/             # Data models
│   │   │       ├── RoomSchema.ts   # Room data structure
│   │   │       └── UserSchema.ts   # User data structure
│   │   ├── middlewares/    # Express middlewares
│   │   │   └── middleware.ts       # Authentication middleware
│   │   ├── routes/         # API route definitions
│   │   │   ├── authRoutes.ts       # Authentication routes
│   │   │   └── roomRoutes.ts       # Room management routes
│   │   ├── Sockets.ts      # Socket.io event handlers
│   │   └── index.ts        # Server entry point
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Room Management
- `POST /api/rooms/create` - Create new game room
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms/:id/join` - Join existing room

## 🌐 Socket Events

### Client → Server
- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `leaveRoom` - Leave current room
- `startGame` - Start the game (host only)
- `drawingAction` - Send drawing data
- `sendMessage` - Send chat message

### Server → Client
- `roomCreated` - Room creation confirmation
- `roomJoined` - Room join confirmation
- `playerJoined` - New player joined notification
- `playerLeft` - Player left notification
- `gameStarted` - Game start notification
- `roundStarted` - New round started
- `yourTurn` - Player's turn to draw
- `drawingAction` - Receive drawing data
- `messageReceived` - Receive chat message
- `gameEnded` - Game completion

## 🎨 Features in Detail

### Drawing System
- Smooth line drawing with configurable brush sizes and colors
- Real-time synchronization of drawing actions across all clients
- Canvas clearing functionality for starting fresh
- Mouse and touch device support

### Game State Management
- Comprehensive state tracking for rooms, players, and game progress
- Turn rotation system ensuring fair play
- Automatic round progression and game completion
- Score calculation and leaderboard tracking

### Real-time Communication
- Instant message delivery with Socket.io
- Drawing action broadcasting with minimal latency
- Player status updates and notifications
- Connection state management and reconnection handling

## 🔄 Development Workflow

### Available Scripts

**Frontend (client/)**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend (server/)**
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript
npm start            # Start production server
```

## 🐛 Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Ensure backend server is running on port 5000
   - Check CORS settings in server configuration
   - Verify frontend environment variables

2. **Canvas Not Working**
   - Check browser compatibility (HTML5 Canvas support)
   - Ensure drawing permissions are properly set
   - Verify socket events are being transmitted

3. **Authentication Issues**
   - Check JWT secret configuration
   - Verify token storage in client
   - Ensure middleware is properly configured

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the client application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for production backend URL

### Backend Deployment (Heroku/Railway)
1. Build the server application: `npm run build`
2. Configure production environment variables
3. Set up MongoDB connection for production
4. Deploy to your chosen platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**GodCoder077**
- GitHub: [@GodCoder077](https://github.com/GodCoder077)
**RAGHUTTAMA-DEV**
- GitHub: [@RAGHUTTAMA-DEV](https://github.com/RAGHUTTAMA-DEV)


## 🙏 Acknowledgments

- Inspired by the original Skribbl.io game
- Built with modern web technologies for optimal performance
- Designed for seamless multiplayer experience

---

**Enjoy drawing and guessing with friends! 🎨✨**
