module.exports = {
  apps: [{
    name: 'tadabburquran',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/var/www/tadabburquran',
    env: {
      PORT: 3002,
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production'
    },
    max_restarts: 5,
    restart_delay: 3000
  }]
}
