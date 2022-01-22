module.exports = {
  apps: [
    {
      name: 'node-zero-ws',
      script: 'dist/main.js',
      error_file: '.logs/err.log',
      out_file: '.logs/out.log',
      log_file: './logs/combined.log',
      env_local: {
        NODE_ENV: 'local',
        PORT: 5010,
        CONFIG_FOLDER: '../config',
      },
      env_dev: {
        NODE_ENV: 'dev',
        PORT: 5010,
        CONFIG_FOLDER: '../config',
      },
      env_prod: {
        NODE_ENV: 'prod',
        PORT: 5010,
        CONFIG_FOLDER: '../config',
      },
    },
  ],
};
