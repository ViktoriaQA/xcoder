# Piston API Integration Documentation

## Overview
This document describes the integration of Piston API for code execution functionality in the OlimpX application.

## Architecture

### Components
- **Frontend**: React application with code editor
- **Backend**: Node.js/Express API server
- **Piston Service**: Code execution engine
- **Piston API**: External service for sandboxed code execution

### Flow
```
Frontend → Backend API → Piston Service → Piston API
```

## API Endpoints

### 1. Get Available Languages
```
GET /api/code-execution/languages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "javascript",
      "versions": ["18.15.0", "16.20.0"]
    }
  ],
  "message": "Список доступних мов отримано успішно"
}
```

### 2. Execute Code
```
POST /api/code-execution/execute
```

**Request:**
```json
{
  "language": "javascript",
  "version": "18.15.0",
  "code": "console.log('Hello World');",
  "stdin": "",
  "time_limit": 10000,
  "memory_limit": 134217728
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "javascript",
    "version": "18.15.0",
    "output": {
      "stdout": "Hello World\n",
      "stderr": "",
      "exit_code": 0,
      "time": 0.045,
      "memory": 28672,
      "signal": null,
      "compile_output": null
    },
    "execution_time_ms": 45,
    "memory_used_mb": 0,
    "status": "success"
  },
  "message": "Код виконано успішно"
}
```

### 3. Get Language Info
```
GET /api/code-execution/languages/:language
```

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "javascript",
    "supported": true,
    "recommended_version": "18.15.0"
  },
  "message": "Інформацію про мову отримано успішно"
}
```

## Service Classes

### PistonService
Location: `/backend/src/services/pistonService.ts`

**Methods:**
- `getAvailableLanguages()`: Fetch supported languages
- `executeCode(request)`: Execute code with given parameters
- `isLanguageSupported(language, version)`: Check language support
- `getRecommendedVersion(language)`: Get latest version

### CodeExecutionController
Location: `/backend/src/controllers/codeExecutionController.ts`

**Methods:**
- `getLanguages(req, res)`: Handle language list requests
- `executeCode(req, res)`: Handle code execution requests
- `getLanguageInfo(req, res)`: Handle language info requests

## Configuration

### Environment Variables
```bash
# Piston API URL
PISTON_API_URL=http://localhost:2000  # Development
PISTON_API_URL=http://piston:2000     # Production
```

### Default Settings
- **Timeout**: 30 seconds
- **Memory limit**: 128MB (configurable)
- **Time limit**: 10 seconds (configurable)
- **Supported languages**: JavaScript, TypeScript, Python, C++

## Error Handling

### Common Errors
1. **Piston API unavailable**
   ```json
   {
     "success": false,
     "message": "Помилка виконання коду",
     "error": "ECONNREFUSED"
   }
   ```

2. **Language not supported**
   ```json
   {
     "success": false,
     "message": "Мова ruby не підтримується"
   }
   ```

3. **Validation errors**
   ```json
   {
     "success": false,
     "message": "Помилка валідації вхідних даних",
     "errors": [
       {
         "field": "code",
         "message": "Код для виконання є обов'язковим"
       }
     ]
   }
   ```

## Security Considerations

### Input Validation
- Code length limit: 50,000 characters
- Language whitelist enforcement
- Timeout and memory limits
- Sanitization of input data

### Sandboxing
- Piston provides isolated execution environment
- No network access from executed code
- File system restrictions
- Resource limits enforced

## Performance Optimization

### Caching
- Language list cached for 5 minutes
- Version information cached per language
- Connection pooling for HTTP requests

### Rate Limiting
- Per-user rate limiting implemented
- Global rate limiting for API protection
- Queue system for high load scenarios

## Monitoring

### Metrics to Track
- Request latency
- Error rates by language
- Resource usage (CPU, memory)
- Queue depth (if implemented)

### Logging
- All code execution requests logged
- Error conditions with stack traces
- Performance metrics for optimization

## Testing

### Unit Tests
```bash
# Test PistonService
npm test -- --testPathPattern=pistonService

# Test Controller
npm test -- --testPathPattern=codeExecutionController
```

### Integration Tests
```bash
# Test full flow
npm test -- --testPathPattern=codeExecution.integration
```

### Load Testing
```bash
# Simulate concurrent executions
npm run test:load:code-execution
```

## Deployment

### Development
```bash
# Start Piston locally
docker-compose -f docker-compose.piston.yml up -d

# Start backend
cd backend && npm run dev
```

### Production
```bash
# Deploy with Docker Compose
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost:8080/api/code-execution/languages
```

## Troubleshooting

### Common Issues
1. **Connection timeout**: Check Piston container status
2. **Memory errors**: Increase memory limits
3. **Language not found**: Verify Piston runtime support
4. **Slow execution**: Check resource constraints

### Debug Commands
```bash
# Check Piston logs
docker-compose logs piston

# Test Piston directly
curl http://localhost:2000/runtimes

# Check network connectivity
docker-compose exec app ping piston
```

## Future Enhancements

### Planned Features
- Async job queue for long-running code
- Custom runtime support
- Performance analytics dashboard
- Code execution history
- Collaborative coding sessions

### Scalability Options
- Horizontal scaling of Piston instances
- Load balancing for code execution
- Geographic distribution for lower latency
- Caching of compilation results
