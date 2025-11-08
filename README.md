# 🎮 Twitch Tools Web Suite

A modern, full-stack web application for managing Twitch OAuth tokens and EventSub webhooks. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔑 **Token Manager**
- Generate **User Access Tokens** using OAuth Device Flow
- Generate **App Access Tokens** using Client Credentials Flow
- Custom **scope selection** for granular permissions
- Token validation and expiration tracking
- Token refresh functionality for user tokens
- **Show/Hide** sensitive token data (access token, refresh token)
- Secure storage with **AES-256-GCM encryption**
- **Token count tracking** per configuration
- **Configuration validation** before saving

### 📊 **Dashboard**
- **Real-time channel data** from Twitch API
- Stream status with animated **LIVE** badge
- Viewer count, followers, and subscribers metrics
- Visual stat cards with Twitch branding
- Automatic data refresh
- Channel information display

### 🧪 **API Tester**
- Test Twitch API endpoints interactively
- Support for GET, POST, PUT, PATCH, DELETE methods
- **Persistent request history** (database-backed)
- Load last 20 API calls on page open
- Token selection dropdown
- Custom request body editor
- Response display with status codes
- Error handling and display

### 🪝 **EventSub Webhook Manager**
- **Sync with Twitch** - Import existing webhooks automatically
- **Configuration selector** - Sync all configs or specific ones
- **Grouped by broadcaster** - Organize by channel/bot
- **Advanced filtering** - Search by ID, type, or status
- **Collapsible groups** - Expand/collapse broadcaster sections
- **Condition display** - See broadcaster_user_id, moderator_user_id
- **10+ event types** - stream.online, channel.follow, etc.
- Create and delete webhook subscriptions
- Monitor webhook status (enabled, pending, failed)
- Real-time sync statistics
- Cost tracking per subscription

### ⚙️ **Configuration Manager**
- Multiple Twitch client configurations per user
- **Credential validation** with Twitch API
- Visual validation feedback (success/error indicators)
- **Token count badges** - See active tokens per config
- **Safe deletion** - Prevents deletion of configs with active tokens
- Configuration naming for easy identification

### 👤 **User Management**
- Secure user registration and authentication
- **JWT-based** session management
- Personal dashboard with activity logs
- Password recovery (coming soon)

### 🎨 **Modern UI**
- Dark theme with Twitch branding (purple #9146FF)
- Fully responsive design
- Built with **Tailwind CSS 3.4.1**
- Smooth animations and transitions
- Accessible components
- Toast notifications for user feedback

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Twitch Developer Account** ([Get one here](https://dev.twitch.tv/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/twitch-tools.git
cd twitch-tools

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
cd ../server
npx prisma migrate dev
npx prisma generate

# Start development servers
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` to see the application! 🎉

---

## 📚 Documentation

Comprehensive guides for every aspect of the project:

### Getting Started
- **[📘 Getting Started Guide](docs/01-GETTING-STARTED.md)** - Installation and first steps
- **[🏗️ Architecture Overview](docs/02-ARCHITECTURE.md)** - System design and structure
- **[🗄️ Database Guide](docs/03-DATABASE.md)** - Schema, migrations, and Prisma

### Development
- **[🔌 API Reference](docs/04-API-REFERENCE.md)** - Complete API documentation
- **[⚛️ Frontend Guide](docs/05-FRONTEND-GUIDE.md)** - React components and state management
- **[🚢 Deployment Guide](docs/06-DEPLOYMENT.md)** - Production deployment instructions

---

## 📁 Project Structure

```
twitch-tools/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── docs/                     # Documentation
│   ├── 01-GETTING-STARTED.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-DATABASE.md
│   ├── 04-API-REFERENCE.md
│   ├── 05-FRONTEND-GUIDE.md
│   └── 06-DEPLOYMENT.md
│
├── token-manager/           # Legacy desktop app (Python/PyQt6)
├── webhook-manager/         # Legacy desktop app (Python/Tkinter)
├── .env.example             # Environment variables template
├── .gitignore
└── README.md                # You are here!
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP logging

### Security
- **AES-256-GCM** encryption for sensitive data
- **PBKDF2** key derivation
- **JWT** with refresh tokens
- **bcrypt** password hashing
- **Helmet** security headers
- **CORS** protection
- **Rate limiting**

---

## 💻 Development

### Server Development

```bash
cd server

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma Client
npm run prisma:studio     # Open Prisma Studio GUI
```

### Client Development

```bash
cd client

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

See `.env.example` files in the root, `server/`, and `client/` directories for all required environment variables.

**Important:**
- Generate secure random strings for `JWT_SECRET` and `ENCRYPTION_KEY`
- Never commit `.env` files to version control
- Use different secrets for development and production

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for Twitch developers and streamers
- Inspired by the need for better token and webhook management tools
- Uses the official [Twitch API](https://dev.twitch.tv/docs/api/)

---

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/twitch-tools/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/twitch-tools/discussions)
- **Email:** support@example.com

---

<div align="center">

**[⬆ back to top](#-twitch-tools-web-suite)**

Made with 💜 by developers, for developers

</div>
