module.exports = {
  apps: [{
    name: 'thinkred-game',
    script: '/root/hermes-project/thinkred-game/server/node_modules/.bin/tsx',
    args: 'src/index.ts',
    cwd: '/root/hermes-project/thinkred-game/server',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      CLIENT_URL: 'https://game.thinkred.ru',
      JWT_SECRET: 'thinkred-game-jwt-secret-2026',
      STEPIK_CLIENT_ID: 'j1MG3FvUAmIITr9w2IAD5FfrdYsCnbDbJ1ThRqnx',
      STEPIK_CLIENT_SECRET: 'nPQenYcrRiPjcFGHwyCqmiu2yHUjrohWXkwkBWC1csdXBiSJtWf7tXaNbaSaOWeIKjSo64MiYoMfnwUSFjC8lwzHAdBS0rmdN9gWdsaVCkmPF3rZ8vhS3QYB3iQqWIDA',
      STEPIK_REDIRECT_URI: 'https://game.thinkred.ru/auth/stepik/callback',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'thinkred_game',
      DB_USER: 'username',
      DB_PASSWORD: '',
      DATABASE_URL: '',
      LOG_LEVEL: 'info',
    },
    watch: false,
    max_memory_restart: '500M',
  }]
};
