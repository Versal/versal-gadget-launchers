describe('legacy iframe launcher', function(){
  var launcher = null;
  var legacyLauncher = null;

  var fixtureAttributes = {
    'data-environment': {
      "assetUrlTemplate": "https://stack.versal.com/api2/assets/<%= id %>",
      "baseUrl": "/base/versal-gadget-launchers/legacy-launcher/test_gadget",
      "cssClassName": "gadget-foo-bar-0_0_0",
      "editingAllowed": true
    },
    'data-config': {
      "foo": "bar"
    }
  };

  beforeEach(function(done){
    launcher = document.createElement('versal-iframe-launcher');
    launcher.setAttribute('src', '/base/versal-gadget-launchers/legacy-iframe-launcher/versal.html');

    launcher.addEventListener('rendered', function(){
      legacyLauncher = launcher.iframe.contentWindow.document.querySelector('versal-legacy-launcher');
      done();
    });

    Object.keys(fixtureAttributes).forEach(function(key){
      launcher.setAttribute(key, JSON.stringify(fixtureAttributes[key]));
    });

    document.body.appendChild(launcher);
  });

  afterEach(function(){
    document.body.removeChild(launcher);
  });

  it('creates legacy launcher behind the scenes', function(){
    expect(legacyLauncher).to.exist();
  });

  it('legacy launcher has all the required attributes', function(){
    expect(legacyLauncher.getAttribute('gadget-base-url')).to.eq('/base/versal-gadget-launchers/legacy-launcher/test_gadget');
    expect(legacyLauncher.getAttribute('gadget-css-class-name')).to.eq('gadget-foo-bar-0_0_0');
    expect(legacyLauncher.getAttribute('editing-allowed')).to.eq('true');
    expect(legacyLauncher.getAttribute('data-config')).to.eql('{"foo":"bar"}');
  });

  describe('changing attributes of iframe launcher must change attributes of nested legacy launcher', function(){
    it('toggleEdit', function(done){
      launcher.setAttribute('editable', 'true');
      // We must clear the stack so mutation observers have a chance to fire
      setTimeout(function(){
        expect(legacyLauncher.getAttribute('editable')).to.eq('true');
        done();
      }, 1);
    });

    it('data-config', function(done){
      launcher.setAttribute('data-config', '{"x":"y"}');
      // We must clear the stack so mutation observers have a chance to fire
      setTimeout(function(){
        expect(legacyLauncher.getAttribute('data-config')).to.eql('{"x":"y"}');
        done();
      }, 1);
    });

    it('data-userstate', function(done){
      launcher.setAttribute('data-userstate', '{ "a": 1 }');
      // We must clear the stack so mutation observers have a chance to fire
      setTimeout(function(){
        expect(legacyLauncher.getAttribute('data-userstate')).to.eql('{"a":1}');
        done();
      }, 1);
    });
  });
});
