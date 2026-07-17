module.exports = {
  apps: [
    {
      name: 'thinkred-server',
      script: './server/dist/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_file: './server/.env',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'thinkred-migrate',
      script: './server/node_modules/.bin/tsx',
      args: 'src/database/migrate-cli.ts',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      env_file: './server/.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: false,
    },
  ],
};
