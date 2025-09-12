import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServerErrorLogger {
  constructor() {
    this.logFile = path.join(__dirname, 'error-logs.json');
    this.errors = this.loadErrors();
  }

  loadErrors() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading error logs:', error);
    }
    return [];
  }

  saveErrors() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.errors, null, 2));
    } catch (error) {
      console.error('Error saving error logs:', error);
    }
  }

  logError(error, context = {}) {
    const errorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message || error,
      stack: error.stack,
      context: {
        ...context,
        serverTime: new Date().toISOString(),
        processId: process.pid,
        nodeVersion: process.version
      },
      type: 'server_error'
    };

    this.errors.push(errorLog);
    this.saveErrors();
    
    console.error(`[ERROR LOGGED] ${errorLog.id}:`, errorLog.message);
    return errorLog;
  }

  logAuthError(email, reason, context = {}) {
    const authError = {
      id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'auth_error',
      email,
      reason,
      context: {
        ...context,
        serverTime: new Date().toISOString(),
        processId: process.pid
      }
    };

    this.errors.push(authError);
    this.saveErrors();
    
    console.error(`[AUTH ERROR LOGGED] ${authError.id}: ${email} - ${reason}`);
    return authError;
  }

  logApiError(endpoint, method, statusCode, error, context = {}) {
    const apiError = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'api_error',
      endpoint,
      method,
      statusCode,
      error: error.message || error,
      context: {
        ...context,
        serverTime: new Date().toISOString(),
        processId: process.pid
      }
    };

    this.errors.push(apiError);
    this.saveErrors();
    
    console.error(`[API ERROR LOGGED] ${apiError.id}: ${method} ${endpoint} - ${statusCode}`);
    return apiError;
  }

  getAllErrors() {
    return this.errors;
  }

  getErrorsByType(type) {
    return this.errors.filter(error => error.type === type);
  }

  getRecentErrors(limit = 50) {
    return this.errors
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  clearErrors() {
    this.errors = [];
    this.saveErrors();
    console.log('[ERROR LOGGER] All errors cleared');
  }

  logInfo(message, context = {}) {
    const infoLog = {
      id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'info',
      message,
      context: {
        ...context,
        serverTime: new Date().toISOString(),
        processId: process.pid
      }
    };

    this.errors.push(infoLog);
    this.saveErrors();
    
    console.log(`[INFO LOGGED] ${infoLog.id}:`, message);
    return infoLog;
  }
}

export default new ServerErrorLogger();
