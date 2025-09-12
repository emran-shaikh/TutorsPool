module.exports = {
  apps: [{
    name: 'tutorspool-backend',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5174,
      JWT_SECRET: 'your-development-jwt-secret'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5174,
      JWT_SECRET: 'your-super-secure-production-jwt-secret-key'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
