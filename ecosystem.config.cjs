module.exports = {
  apps: [
    {
      name: "salon-elen-fe",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      time: true,
      kill_timeout: 10000,
      listen_timeout: 10000,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
};
