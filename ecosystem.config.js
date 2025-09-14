module.exports = {
  apps: [
    {
      name: 'moredoc-webserver',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
