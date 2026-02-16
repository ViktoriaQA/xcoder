// Load environment variables FIRST
import dotenv from 'dotenv';
console.log('CWD:', process.cwd());
dotenv.config();

// Then load the server
import app from './server';

export default app;