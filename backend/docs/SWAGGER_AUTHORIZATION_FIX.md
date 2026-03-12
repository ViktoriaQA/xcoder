# Swagger Authorization Fix for Production

## Problem
Swagger UI on production (https://olimpxx.pp.ua/api-docs) is not properly handling authorization. After clicking the authorize button and entering a token, the authenticated endpoints are not showing up or requests are failing.

## Root Cause
1. **Base URL Configuration**: Swagger UI was using multiple server URLs causing confusion
2. **CORS Issues**: Production CORS settings were blocking Swagger UI requests
3. **Authorization Persistence**: Token was not being properly persisted in Swagger UI
4. **Missing Test Endpoints**: No way to verify if authorization is working

## Solutions Implemented

### 1. Dynamic Server Configuration
Updated `/src/config/swagger.ts` to use dynamic base URL based on environment:

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://olimpxx.pp.ua' 
  : 'http://localhost:3001';

servers: [
  {
    url: baseUrl,
    description: isProduction ? 'Production server' : 'Development server'
  }
]
```

### 2. Enhanced Swagger UI Configuration
Updated `/src/server.ts` with better Swagger UI options:

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CodeArena API Documentation',
  swaggerOptions: {
    persistAuthorization: true,        // Keep token after page reload
    displayRequestDuration: true,      // Show request timing
    tryItOutEnabled: true,            // Enable "Try it out"
    docExpansion: 'none',             // Don't auto-expand sections
    requestInterceptor: (req: any) => {
      // Custom request handling if needed
      return req;
    },
    responseInterceptor: (res: any) => {
      return res;
    }
  }
}));
```

### 3. CORS Fix for Swagger Endpoints
Added special CORS handling for Swagger documentation:

```typescript
// Special CORS handling for Swagger documentation
app.use('/api-docs*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 4. Test Authorization Endpoint
Created `/src/routes/test-swagger.ts` with a simple test endpoint:

```typescript
/**
 * @swagger
 * /api/test/auth:
 *   get:
 *     tags: [Test]
 *     summary: Test authorization endpoint
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorization successful
 */
router.get('/auth', (req: AuthRequest, res) => {
  res.json({
    message: 'Authorization successful',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    },
    timestamp: new Date().toISOString()
  });
});
```

### 5. Diagnostics Endpoint
Added `/api-docs/diagnostics` endpoint for troubleshooting:

```typescript
app.get('/api-docs/diagnostics', (req, res) => {
  const diagnostics = {
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NODE_ENV === 'production' ? 'https://olimpxx.pp.ua' : 'http://localhost:3001',
    pathsCount: Object.keys((swaggerSpec as any).paths || {}).length,
    componentsCount: Object.keys((swaggerSpec as any).components?.schemas || {}).length,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    userAgent: req.get('User-Agent')
  };
  res.json(diagnostics);
});
```

## How to Use Swagger Authorization

### Step 1: Get Your JWT Token
1. Log in to the application
2. Get the JWT token from browser localStorage or network tab
3. Token format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Authorize in Swagger UI
1. Go to https://olimpxx.pp.ua/api-docs
2. Click the **Authorize** button (top right)
3. In the popup, enter: `Bearer YOUR_JWT_TOKEN`
4. Click **Authorize**
5. Close the popup

### Step 3: Test Authorization
1. Find the **Test** section in Swagger UI
2. Expand `/api/test/auth`
3. Click **Try it out**
4. Click **Execute**
5. You should see user information if authorization works

### Step 4: Use Other Endpoints
1. Now you can use any endpoint that requires authorization
2. The token will be automatically included in requests
3. Look for the 🔒 lock icon on protected endpoints

## Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: 
- Check that your token is valid and not expired
- Ensure you're using the full token including `Bearer ` prefix
- Try getting a fresh token from the application

### Issue: Endpoints Not Showing
**Solution**:
- Clear browser cache and reload Swagger UI
- Check browser console for errors
- Verify the diagnostics endpoint: `/api-docs/diagnostics`

### Issue: CORS Errors
**Solution**:
- Check that the CORS middleware is properly configured
- Verify the special CORS handling for `/api-docs*` routes
- Ensure production environment variables are set correctly

### Issue: Token Not Persisting
**Solution**:
- Enable `persistAuthorization: true` in Swagger UI options
- Clear browser localStorage and try again
- Check that cookies are not blocking localStorage

## Verification Commands

### Check Swagger JSON Specification
```bash
curl https://olimpxx.pp.ua/api-docs.json
```

### Check Diagnostics
```bash
curl https://olimpxx.pp.ua/api-docs/diagnostics
```

### Test Authorization (with token)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://olimpxx.pp.ua/api/test/auth
```

## Production Deployment Checklist

- [ ] Environment variables set correctly
- [ ] NODE_ENV=production
- [ ] CORS configuration updated
- [ ] Swagger UI configuration updated
- [ ] Test endpoints deployed
- [ ] Diagnostics endpoint accessible
- [ ] Authorization working with real tokens
- [ ] All endpoints properly documented

## Support

If authorization still doesn't work after these fixes:

1. Check the browser console for JavaScript errors
2. Verify the network requests in browser dev tools
3. Check the diagnostics endpoint for configuration info
4. Ensure the backend is running with production settings
5. Contact the development team with error details

## Future Improvements

- Add automatic token refresh in Swagger UI
- Implement role-based endpoint visibility
- Add more comprehensive test endpoints
- Create automated authorization testing
- Add performance monitoring for Swagger UI
