# Logger Utility - Security & Environment Awareness

## Overview
Replaced `console.log` statements with a custom `Logger` utility that:
- **Development**: Shows detailed logs with all data
- **Production**: Sanitizes or hides sensitive information

## Environment Control
Set `NODE_ENV` in your `.env` file:
```env
# Development (shows detailed logs)
NODE_ENV=development

# Production (sanitizes sensitive data)
NODE_ENV=production
```

## Logger Methods

### `Logger.dev(message, data?)`
- **Development only** - completely silent in production
- Use for debugging information that shouldn't be in production
- Examples: token verification, event emissions, cache hits

```typescript
Logger.dev('🔐 Protected route - verifying token: POST /api/routes');
Logger.dev('📦 Weather cache hit for 4.04,9.71');
```

### `Logger.auth(message, identifier?)`
- Shows simplified message in production
- Shows detailed info in development
- Use for authentication-related logs

```typescript
// Dev: "🔐 Token verified for user: user@example.com"
// Prod: "🔐 Token verified for user"
Logger.auth('Token verified for user', decoded.email);
```

### `Logger.event(event, data?)`
- **Development only** - silent in production
- Use for event emissions
- Replaced all `console.log('📡 Event emitted...')`

```typescript
Logger.event('route.search.started', { userId, from, to });
```

### `Logger.info(message, data?)`
- Shows in both environments
- **Production**: Automatically sanitizes sensitive fields (email, userId, password, token, preferences)
- Use for general information logs

```typescript
Logger.info('Route search completed', { from, to, duration });
```

### `Logger.success(message)`
- Simple success messages
- Shows in both environments

```typescript
Logger.success('Using: Douala, Littoral, Cameroon');
```

### `Logger.warn(message, data?)`
- Warning messages
- Shows in both environments

```typescript
Logger.warn('⚠️ Failed to fetch preferences, using defaults');
```

### `Logger.error(message, error?)`
- Error messages with full details (needed for debugging)
- Shows in both environments

```typescript
Logger.error('❌ Failed to fetch weather:', error.message);
```

## What Changed

### Files Updated:
1. **`src/utils/logger.util.ts`** - New logger utility
2. **`src/gateway/middleware/auth.gateway.ts`** - Auth logging
3. **`src/events/eventBus.ts`** - Event emissions
4. **`src/services/email.service.ts`** - Email logs
5. **`src/services/weather.service.ts`** - Weather logs
6. **`src/services/map-api.service.ts`** - Map API logs
7. **`src/services/route.service.ts`** - Route logs
8. **`src/gateway/middleware/rateLimit.gateway.ts`** - Rate limit logs

### Sensitive Data Removed from Production:
- ✅ User emails
- ✅ User IDs
- ✅ Full preference objects
- ✅ Token details
- ✅ Event payloads with sensitive data
- ✅ Detailed coordinates

### Still Visible in Production:
- ✅ Request/Response logs (the box format)
- ✅ Error messages
- ✅ Route names (e.g., "Douala, Littoral, Cameroon")
- ✅ Success/warning messages without sensitive data

## Example Production Logs

**Before:**
```
🔐 Protected route - verifying token: POST /api/routes/search
✅ Token verified for user: lumnchifor030@gmail.com
📡 Event emitted: route.search.started {
  userId: '8269e047-f605-499d-b735-f7b4eab94f6d',
  from: '{"address":"Douala"}',
  to: '{"address":"Yaoundé"}'
}
```

**After (Production):**
```
🔐 Token verified for user
✅ Using: Douala, Littoral, Cameroon
✅ Using: Yaoundé, Centre, Cameroon
```

**After (Development):**
```
🔐 Protected route - verifying token: POST /api/routes/search
🔐 Token verified for user: lumnchifor030@gmail.com
📡 Event emitted: route.search.started {
  userId: '8269e047-f605-499d-b735-f7b4eab94f6d',
  from: '{"address":"Douala"}',
  to: '{"address":"Yaoundé"}'
}
```

## Docker Environment
The Docker container uses `NODE_ENV=production` by default (inherited from `.env` file).

**Local testing with dev logs:**
```env
NODE_ENV=development
```

**Production deployment:**
```env
NODE_ENV=production
```
