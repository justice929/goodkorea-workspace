module.exports = {
  apps : [
    {
      name: 'haryul-bot',
      script: 'haryul_engine.js',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'python-backend',
      script: 'python',
      args: '../mokjang-backend/main.py',
      cwd: './'
    },
    {
      name: 'frontend',
      script: 'run_frontend.cjs',
      cwd: './'
    }
  ]
};
