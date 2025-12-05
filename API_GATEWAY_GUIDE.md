# API Gateway Implementation Guide 🚪

## What Was Implemented

Your WayFinder backend now has a **Lightweight API Gateway** that sits between clients and your services. It provides:

### 1. **Request Logging** 📝
- Every request gets a unique `X-Request-ID`
- Logs method, path, duration, and response status
- Helps with debugging and monitoring

### 2. **CORS Management** 🔗
- Centralized CORS configuration
- Single place to add/remove allowed origins
- Automatic preflight request handling

### 3. **Rate Limiting** ⏱️
- Different limits for different endpoints
- Auth endpoints: 5 requests/15 minutes
- API endpoints: 100 requests/minute
- Default: 30 requests/minute
- Tracks per-user (if authenticated) or per-IP

### 4. **Authentication Gateway** 🔐
- JWT verification on all protected routes
- Public routes: `/api/auth/register`, `/api/auth/login`, `/health`
- All other routes require valid JWT token
- User info extracted and attached to request

---

## Architecture

```
Request Flow:
═════════════

Client Request
       ↓
[1] requestLogger      ← Logs request with ID
       ↓
[2] corsGateway       ← Validates origin
       ↓
[3] rateLimitGateway  ← Checks rate limits
       ↓
[4] authGateway       ← Verifies JWT token
       ↓
[5] setupGatewayRoutes ← Routes to correct service
       ↓
Service Layer (Auth, Location, Preference)
       ↓
Response sent back (with Request-ID header)
```

---

## File Structure

```
backend/src/gateway/
├── index.ts                    # Main export
├── routes.ts                   # Route configuration
└── middleware/
    ├── index.ts               # Middleware exports
    ├── logger.gateway.ts      # Request logging
    ├── auth.gateway.ts        # JWT verification
    ├── rateLimit.gateway.ts   # Rate limiting
    └── cors.gateway.ts        # CORS handling
```

---

## How to Use

### In Controllers (Get User ID)

```typescript
import { getUserId, getUser } from "../../gateway";

async register(req: Request, res: Response) {
  const userId = getUserId(req);  // Get from authenticated request
  // or
  const user = getUser(req);      // Get full user object
}
```

### Add New Protected Routes

```typescript
// routes.ts - setupGatewayRoutes()
app.use("/api/newfeature", newFeatureRoutes);

// newFeatureRoutes.ts
// All routes here are automatically protected!
// authGateway middleware already verified the JWT
```

### Customize Rate Limits

```typescript
// rateLimit.gateway.ts - RATE_LIMITS object
const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },    // Increase from 5
  api: { windowMs: 60 * 1000, maxRequests: 100 },         // Increase from 100
  default: { windowMs: 60 * 1000, maxRequests: 30 },      // Increase from 30
};
```

### Add Public Routes

```typescript
// auth.gateway.ts - PUBLIC_ROUTES array
const PUBLIC_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/health",
  "/api/newpublic",  // Add your public route here
];
```

---

## Request/Response Cycle

### Example: User Registration (Public Route)

```
1. Client: POST /api/auth/register
   └─ No JWT token needed

2. Gateway Middleware:
   └─ requestLogger:    📥 Logs incoming request
   └─ corsGateway:      ✅ Allowed origin
   └─ rateLimitGateway: ✅ Within limits (auth: 5/15min)
   └─ authGateway:      🔓 Public route, skipped

3. Service:
   └─ Creates user in database
   └─ Emits USER_REGISTERED event
   └─ Event triggers listeners (email, preferences, analytics)

4. Response:
   └─ 201 { user, token }
   └─ Header: X-Request-ID: req_1701695400000_abc123def456
   └─ requestLogger: 📤 Logs response (duration, status)
```

### Example: Get User Preferences (Protected Route)

```
1. Client: GET /api/preferences
   └─ Header: Authorization: Bearer eyJhbGc...

2. Gateway Middleware:
   └─ requestLogger:    📥 Logs incoming request
   └─ corsGateway:      ✅ Allowed origin
   └─ rateLimitGateway: ✅ Within limits (api: 100/min)
   └─ authGateway:      🔐 Verifies JWT token
                        ✅ Valid token
                        Attaches user to request

3. Service:
   └─ Gets userId from (req as any).userId
   └─ Fetches preferences from database
   └─ Returns response

4. Response:
   └─ 200 { preferences }
   └─ requestLogger: 📤 Logs response
```

---

## Console Output Examples

### Server Start
```
╔═══════════════════════════════════════════════════════════╗
║                 🚀 WayFinder Backend                      ║
╚═══════════════════════════════════════════════════════════╝

🌐 Server Details:
   Port       : 3000
   Environment: development
   
📊 Features Enabled:
   ✅ API Gateway (request routing & middleware)
   ✅ Request Logging (with Request IDs)
   ✅ Authentication (JWT verification)
   ✅ Rate Limiting (per-user/IP)
   ✅ Event System (async side effects)
   ✅ Resend Email Integration

🔗 Quick Links:
   Health Check : http://localhost:3000/health
   
🚀 Ready to accept requests!

🛣️ Setting up API Gateway routes...

✅ Auth routes mounted:
   POST   /api/auth/register - Register new user
   POST   /api/auth/login    - Login user
   GET    /api/auth/me       - Get current user (protected)

✅ Preference routes mounted:
   POST   /api/preferences        - Create preferences (protected)
   GET    /api/preferences        - Get preferences (protected)
   PUT    /api/preferences        - Update preferences (protected)
   DELETE /api/preferences        - Delete preferences (protected)

✅ Location routes mounted:
   POST   /api/locations             - Create location (protected)
   GET    /api/locations             - Get all locations (protected)
   ...

═════════════════════════════════════════════════════════════
📊 API GATEWAY SUMMARY
═════════════════════════════════════════════════════════════
🔓 Public Routes  : /api/auth/register, /api/auth/login
🔐 Protected Routes: All others (require JWT token)
⏱️  Rate Limiting  :
   - Auth endpoints: 5 requests/15 minutes
   - API endpoints : 100 requests/minute
   - Other         : 30 requests/minute
📝 Logging        : All requests logged with Request ID
═════════════════════════════════════════════════════════════
```

### Request Logging

```
┌────────────────────────────────────────────────┐
│ 📥 INCOMING REQUEST                            │
├────────────────────────────────────────────────┤
│ Request ID: req_1701695400000_abc123def456    │
│ Method:     POST                               │
│ Path:       /api/auth/register                 │
│ IP:         ::1                                │
└────────────────────────────────────────────────┘

🔐 Protected route - verifying token: POST /api/preferences
✅ Token verified for user: john@example.com

┌────────────────────────────────────────────────┐
│ 📤 OUTGOING RESPONSE                           │
├────────────────────────────────────────────────┤
│ Request ID: req_1701695400000_abc123def456    │
│ Status:     ✅ 201                             │
│ Duration:   145ms                              │
│ Method:     POST                               │
│ Path:       /api/auth/register                 │
└────────────────────────────────────────────────┘
```

### Rate Limiting

```
📊 Rate limit check: 5/100 for user_123e4567
📊 Rate limit check: 6/100 for user_123e4567

⏱️ Rate limit window started for ip_127.0.0.1
   (1/5 requests in 900s)

🚫 Rate limit exceeded for ip_127.0.0.1
   (6/5 requests) - Reset in 742s

Response: 429 Too Many Requests
{
  "success": false,
  "message": "Too many authentication attempts, please try again later",
  "retryAfter": 742
}
```

---

## Health Check Response

```
GET http://localhost:3000/health

{
  "success": true,
  "message": "WayFinder API is running 🚀",
  "timestamp": "2025-12-04T10:30:45.123Z",
  "environment": "development",
  "uptime": 245.5,
  "apiGateway": {
    "status": "active",
    "features": ["request-logging", "auth-verification", "rate-limiting", "cors"]
  },
  "eventSystem": {
    "status": "active",
    "listeners": ["user", "preference", "trip"]
  },
  "endpoints": {
    "auth": "/api/auth",
    "preferences": "/api/preferences",
    "locations": "/api/locations"
  }
}
```

---

## Key Features

### 🎯 Request ID Tracking
- Every request gets unique `X-Request-ID`
- Useful for debugging and logging
- Included in response headers
- Format: `req_<timestamp>_<random>`

### 🔐 Smart Authentication
- Public routes bypass auth check
- Protected routes require valid JWT
- User info attached to request object
- Easy to access in controllers

### ⏱️ Flexible Rate Limiting
- Per-user limits (if authenticated)
- Per-IP limits (if not authenticated)
- Automatic cleanup every 30 minutes
- Configurable per route

### 📝 Comprehensive Logging
- Request method, path, IP
- Response status and duration
- Error details in development
- Status colors (✅ 2xx, ⚠️ 4xx, ❌ 5xx)

---

## Testing the Gateway

### Test Public Route (No Auth)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
```

### Test Protected Route (With Auth)
```bash
curl -X GET http://localhost:3000/api/preferences \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Test Rate Limiting
```bash
# Send 6 requests to auth endpoint (limit is 5/15min)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"User$i\",\"email\":\"user$i@test.com\",\"password\":\"123\"}"
done

# 6th request should return 429 Too Many Requests
```

### Check Health
```bash
curl http://localhost:3000/health | jq .
```

---

## What You Can Now Say in Your Assessment

> *"My API Gateway provides a single entry point for all requests. It handles cross-cutting concerns like authentication, rate limiting, and request logging in a centralized manner. Public routes (registration, login) bypass authentication, while all other routes require a valid JWT token. Rate limiting is intelligent—it tracks per-user limits for authenticated users and per-IP limits for anonymous requests. Every request gets a unique ID for tracking and debugging purposes. This architecture is scalable and production-ready."*

---

## Scalability Notes

Currently, rate limiting uses **in-memory storage** (good for single server).

To scale horizontally, replace with **Redis**:

```typescript
// Future: Replace requestCounts Map with Redis
import Redis from "ioredis";
const redis = new Redis();

// Store: await redis.incr(`ratelimit:${key}`)
// Check: await redis.get(`ratelimit:${key}`)
```

---

**API Gateway Implementation Complete!** ✅
