const base = 'http://localhost:4323';
const paths = require('./tests/routes.json');

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx astro preview --port 4323',
      startServerReadyPattern: 'localhost:4323',
      url: paths.map((path) => `${base}${path}`),
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
