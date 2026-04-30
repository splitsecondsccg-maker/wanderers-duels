module.exports = {
  webServer: { command: 'npm run serve', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI, timeout: 120000 },
  use: { baseURL: 'http://127.0.0.1:5173', screenshot: 'only-on-failure' },
  reporter: [['list']]
};
