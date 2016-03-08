module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    basePath: '.',
    files: [
      './vendor/customevent-polyfill.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.5.4/webcomponents-lite.min.js',

      // Legacy launcher
      'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.6/require.min.js',
      './test_require_config.js',
      './cdn-defines.js',
      {pattern: './test_gadget/gadget.js', included: false},
      './index.html',
      {pattern: './legacy-launcher.js', included: false},
      './legacy-launcher_spec.js'
    ],
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox']
  });
};
