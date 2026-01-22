# 🧭 WayFinder

> **Smart Commuting. Personalized Routes. Real Savings.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB)](https://reactnative.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Design Patterns](#design-patterns)
- [Multi-City Support](#multi-city-support)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Team](#team)
- [License](#license)

---

## 📱 About

**WayFinder** is an intelligent multi-modal commute planner that helps users find the most efficient, cost-effective routes based on their personal preferences and real-time conditions.

Starting in **Yaoundé, Cameroon**, and expanding to cities worldwide, WayFinder compares buses, motos, taxis, walking, and combinations to give you the best daily commute options—saving you time and money.

### The Problem

Standard map apps provide generic routes but don't consider:
- 💰 Personal budget constraints
- ❤️ Individual preferences (e.g., "I prefer motos over buses")
- 🚦 Real-time local conditions (traffic, pricing fluctuations)
- 📊 Daily cost optimization for regular commuters

### Our Solution

WayFinder provides **personalized, cost-optimized route recommendations** tailored to each user's unique needs.

---

## ✨ Features

- 🗺️ **Multi-Modal Route Comparison** - Compare bus, moto, taxi, walking options
- 💰 **Cost Analytics** - Track spending and savings over time
- 🎯 **Personalized Recommendations** - AI-powered daily suggestions
- 📍 **Favorite Locations** - Save home, work, frequently visited places
- 📊 **Trip History** - View all past trips and patterns
- 🚦 **Real-Time Traffic** - Live traffic updates and alerts
- 🌍 **Multi-City Support** - Expandable to any city
- 📴 **Offline Mode** - Access saved routes without internet
- 🔔 **Push Notifications** - Traffic alerts and price changes

---

## 🛠️ Tech Stack

### Frontend (Mobile App)

```
- React Native + TypeScript
- NativeWind (Tailwind CSS for React Native)
- React Query (Data fetching & caching)
- React Navigation
- Zustand (State management)
- React Native Maps
- Axios
```

### Backend (API Server)

```
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL Database
- JWT Authentication
- Google Maps API
- Joi/Zod Validation
```

### DevOps & Deployment

```
- Docker & Docker Compose
- VPS (DigitalOcean/AWS/Linode)
- Nginx (Reverse Proxy)
- GitHub Actions (CI/CD)
```

---

## 📁 Project Structure

```
wayfinder/
│
├── mobile/                          # React Native App
│   ├── src/
│   │   ├── api/                     # React Query hooks & API clients
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/
│   │   │   ├── route/
│   │   │   └── map/
│   │   ├── screens/                 # App screens
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── route/
│   │   │   ├── profile/
│   │   │   └── history/
│   │   ├── navigation/              # Navigation setup
│   │   ├── hooks/                   # Custom hooks
│   │   ├── types/                   # TypeScript types
│   │   ├── store/                   # State management
│   │   └── constants/               # Constants & config
│   ├── assets/
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                         # Express.js API
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   ├── services/                # Business logic
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Auth, validation, errors
│   │   ├── strategies/              # Design patterns
│   │   │   ├── optimization/        # Strategy Pattern
│   │   │   └── transport/           # Factory Pattern
│   │   ├── types/                   # TypeScript types
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # Configuration
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── shared/                          # Shared types
│   └── types/
│
├── docs/                            # Documentation
│   ├── diagrams/                    # UML diagrams
│   ├── api/                         # API docs
│   └── deployment/                  # Deployment guides
│
├── docker/                          # Docker configs
│   ├── Dockerfile.backend
│   ├── Dockerfile.mobile
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
- Node.js >= 18.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14.0
- React Native development environment
- Docker (optional, for containerized deployment)
```

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/fanyicharllson/wayfinder.git
cd wayfinder
```

#### 2. Backend Setup

```bash
cd backend
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, JWT_SECRET, GOOGLE_MAPS_API_KEY, etc.

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed

# Start development server
pnpm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Mobile App Setup

```bash
cd mobile
pnpm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
pnpm start

# Run on Android
pnpm run android

# Run on iOS
pnpm run ios

# Or use Expo Go
npx expo start
```

#### 4. Docker Setup (Optional)

```bash
# From root directory
docker-compose up --build

# Backend: http://localhost:5000
# Database: localhost:5432
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wayfinder"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Google Maps API
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS="http://localhost:19000,http://localhost:19006"

# Optional: Other APIs
WEATHER_API_KEY="your-weather-api-key"
TRAFFIC_API_KEY="your-traffic-api-key"
```

### Mobile `.env`

```env
API_BASE_URL="http://localhost:5000/api"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

---

## 📡 API Endpoints

### Authentication

```http
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/refresh-token     # Refresh JWT token
POST   /api/auth/reset-password    # Password reset
```

### Routes

```http
POST   /api/routes/search          # Search for routes
GET    /api/routes/:id             # Get route details
POST   /api/routes/compare         # Compare multiple routes
GET    /api/routes/recommendation  # Get daily recommendation
POST   /api/routes/favorite        # Save route as favorite
```

### User

```http
GET    /api/user/profile           # Get user profile
PUT    /api/user/profile           # Update profile
GET    /api/user/preferences       # Get preferences
PUT    /api/user/preferences       # Update preferences
GET    /api/user/favorites         # Get favorite locations
POST   /api/user/favorites         # Add favorite location
DELETE /api/user/favorites/:id     # Remove favorite location
```

### Trips

```http
GET    /api/trips/history          # Get trip history
POST   /api/trips                  # Save a trip
GET    /api/trips/analytics        # Get cost analytics
GET    /api/trips/:id              # Get trip details
```

Full API documentation: [/docs/api/README.md](./docs/api/README.md)

---

## 🎨 Design Patterns

### 1. Strategy Pattern (Route Optimization)

```typescript
// Different optimization strategies
interface OptimizationStrategy {
  optimize(routes: Route[], preferences: UserPreference): Route;
}

class FastestStrategy implements OptimizationStrategy { ... }
class CheapestStrategy implements OptimizationStrategy { ... }
class BalancedStrategy implements OptimizationStrategy { ... }
```

### 2. Factory Pattern (Transport Modes)

```typescript
// Create different transport mode objects
class TransportFactory {
  static create(type: 'bus' | 'moto' | 'taxi' | 'walk'): Transport {
    switch(type) {
      case 'bus': return new Bus();
      case 'moto': return new MotoTaxi();
      // ...
    }
  }
}
```

### 3. Singleton Pattern (API Clients)

```typescript
// Single instance of Google Maps client
class MapAPIClient {
  private static instance: MapAPIClient;
  
  static getInstance(): MapAPIClient {
    if (!MapAPIClient.instance) {
      MapAPIClient.instance = new MapAPIClient();
    }
    return MapAPIClient.instance;
  }
}
```

### 4. Repository Pattern (Data Access)

```typescript
// Abstract database operations
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<User>;
  // ...
}
```

### 5. Observer Pattern (Real-time Updates)

```typescript
// Notify users of traffic changes
class TrafficObserver {
  subscribers: User[] = [];
  
  notify(update: TrafficUpdate) {
    subscribers.forEach(user => user.sendNotification(update));
  }
}
```

---

## 🌍 Multi-City Support

WayFinder is designed to scale to multiple cities globally.

### Database Design

```prisma
model City {
  id          String   @id @default(uuid())
  name        String
  country     String
  coordinates Json
  isActive    Boolean  @default(false)
  
  users       User[]
  routes      Route[]
}
```

### Expansion Roadmap

- ✅ **Phase 1**: Yaoundé, Cameroon (MVP)
- 🚧 **Phase 2**: Douala, Bafoussam
- 📅 **Phase 3**: Major African cities (Lagos, Nairobi, Accra)
- 📅 **Phase 4**: Global expansion

---

## 🚢 Deployment

### VPS Deployment (Production)

#### 1. Server Setup

```bash
# SSH into your VPS
ssh root@your-server-ip

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/your-username/wayfinder.git
cd wayfinder
```

#### 2. Configure Environment

```bash
# Create production .env files
cp backend/.env.example backend/.env
nano backend/.env  # Add production credentials
```

#### 3. Deploy with Docker

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f
```

#### 4. Setup Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.wayfinder.app;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.wayfinder.app
```

### Mobile App Deployment

#### Android (Google Play Store)

```bash
cd mobile
pnpm run build:android
# Upload generated APK/AAB to Play Console
```

#### iOS (Apple App Store)

```bash
cd mobile
pnpm run build:ios
# Use Xcode to upload to App Store Connect
```

---

## 📚 Documentation

Full documentation available in `/docs`:

- **[Use Case Diagram](./docs/diagrams/use-case.md)** - System functionalities
- **[Class Diagram](./docs/diagrams/class.md)** - Object-oriented structure
- **[Sequence Diagrams](./docs/diagrams/sequence/)** - Interaction flows
- **[Activity Diagrams](./docs/diagrams/activity/)** - Process workflows
- **[Deployment Diagram](./docs/diagrams/deployment.md)** - Infrastructure
- **[API Documentation](./docs/api/)** - Endpoint details
- **[Architecture Guide](./docs/architecture.md)** - System design

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
pnpm run test:coverage     # Coverage report
```

### Mobile Tests

```bash
cd mobile
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
```

---

## 🤝 Contributing

This is an academic project for ICT University. Contributions from team members are welcome!

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint & Prettier
- Write meaningful commit messages
- Add tests for new features

---

## 👥 Team

**ICT University - Software Engineering Project 2025**

| Role | Name | GitHub |
|------|------|--------|
| CTO Lead | [FANYI CHARLLSON F] | [@fanyicharllson] |
| sCRUM Lead | [LUM NCHIFOR] | [@lumnchifor] |


**Project Supervisor**: [Engr Tekoh Palma]

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For questions or collaboration:

- **Email**: fanyicharllson.fanyi.@ictuniversity.edu.cm
- **GitHub**: [github.com/fanyicharllson/way-finder](https://github.com/your-org/wayfinder)
- **Documentation**: [docs.wayfinder.app](https://docs.wayfinder.app)

---

## 🙏 Acknowledgments

- ICT University Faculty
- Google Maps Platform
- React Native Community
- Prisma Team
- Open Source Contributors

---

<div align="center">

**Built with ❤️ in Yaoundé, Cameroon**

[⬆ Back to Top](#-wayfinder)

</div>