module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    basePath: '..',
    files: [
      'customevent-polyfill/customevent-polyfill.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.5.4/webcomponents-lite.min.js',

      // Iframe launcher
      'versal-gadget-launchers/iframe-launcher/iframe-launcher.html',
      'versal-gadget-launchers/iframe-launcher/test/*_spec.js',
      {pattern: 'versal-gadget-launchers/iframe-launcher/iframe-launcher.js', included: false},
      {pattern: 'versal-gadget-launchers/iframe-launcher/test/test_gadget.html', included: false},

      // Component launcher
      'versal-gadget-launchers/component-launcher/component-launcher.html',
      'versal-gadget-launchers/component-launcher/test/*_spec.js',
      {pattern: 'versal-gadget-launchers/component-launcher/component-launcher.js', included: false},
      {pattern: 'versal-gadget-launchers/component-launcher/test/test_gadget.html', included: false},

      // Legacy iframe launcher
      'versal-gadget-launchers/legacy-iframe-launcher/test/*_spec.js',
      {pattern: 'versal-gadget-launchers/legacy-iframe-launcher/**/*', included: false},
      'versal-gadget-api/versal-player-api.js',

      // Legacy launcher
      'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js',
      'backbone/backbone.js',
      'jquery/dist/jquery.js',
      'requirejs/require.js',
      'versal-gadget-launchers/legacy-launcher/test_require_config.js',
      'versal-gadget-launchers/legacy-launcher/cdn-defines.js',
      {pattern: 'versal-gadget-launchers/legacy-launcher/test_gadget/gadget.css', included: false},
      {pattern: 'versal-gadget-launchers/legacy-launcher/test_gadget/gadget.js', included: false},
      'versal-gadget-launchers/legacy-launcher/legacy-launcher.html',
      {pattern: 'versal-gadget-launchers/legacy-launcher/legacy-launcher.js', included: false},
      'versal-gadget-launchers/legacy-launcher/legacy-launcher_spec.js'
    ],
    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO, // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    autoWatch: true,
    browsers: ['Firefox']
  });
};
