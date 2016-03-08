module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    basePath: '..',
    files: [
      'customevent-polyfill/customevent-polyfill.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.5.4/webcomponents-lite.min.js',

      // Legacy launcher
      'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.6/require.min.js',
      'versal-legacy-launcher/legacy-launcher/test_require_config.js',
      'versal-legacy-launcher/legacy-launcher/cdn-defines.js',
      {pattern: 'versal-legacy-launcher/legacy-launcher/test_gadget/gadget.js', included: false},
      'versal-legacy-launcher/legacy-launcher/legacy-launcher.html',
      {pattern: 'versal-legacy-launcher/legacy-launcher/legacy-launcher.js', included: false},
      'versal-legacy-launcher/legacy-launcher/legacy-launcher_spec.js'
    ],
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox']
  });
};
