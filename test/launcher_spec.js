describe('iframe launcher', function() {
  var launcher;

  beforeEach(function() {
    launcher = document.createElement('versal-iframe-launcher');
    launcher.setAttribute('src', '/base/test/test_gadget.html');
    launcher.setAttribute('env', '{"test": "initial-environment"}');
    launcher.setAttribute('data-foo', 'bar');
    document.body.appendChild(launcher);
  });

  afterEach(function() {
    document.body.removeChild(launcher);
  });

  describe('player events', function() {

    it('sends a bunch of initial events upon "startListening"', function(done) {
      var recordedEvents = [];

      window.recordPlayerEvent = function(eventMessage) {
        recordedEvents.push(eventMessage);

        if (eventMessage.event == 'attached') {
          chai.expect(recordedEvents).to.deep.equal([
            {event: 'environmentChanged', data: {test: 'initial-environment'}},
            {event: 'attributesChanged', data: {foo: 'bar'}},
            {event: 'editableChanged', data: {editable: false}},
            {event: 'attached'}
          ]);
          delete window.recordPlayerEvent;
          done();
        }
      };
    });

    it('sends attributesChanged when attribute has changed', function(done) {
      window.recordPlayerEvent = function(eventMessage) {
        if (eventMessage.event == 'attached') {
          launcher.setAttribute('data-baz', 'buzz');
        }
        if (eventMessage.event == 'attributesChanged' &&
              eventMessage.data.baz == 'buzz') {
          done();
        }
      };
    });

    it('sends editableChanged when editable changes', function(done) {
      window.recordPlayerEvent = function(eventMessage) {
        if (eventMessage.event == 'attached') {
          launcher.setAttribute('editable', true);
        }
        if (eventMessage.event == 'editableChanged' &&
              eventMessage.data.editable === true) {
          done();
        }
      };
    });
  });

  describe('gadget events', function() {

    beforeEach(function(done){
      window.recordPlayerEvent = function(eventMessage) {
        if (eventMessage.event == 'attached') {
          done();
        }
      };
    });

    it('sets an attribute upon receiving setAttributes', function(done) {
      var observer = new MutationObserver(function(mx) {
        chai.expect(launcher.getAttribute('data-test2')).to.equal('new-config');
        done();
      });
      observer.observe(launcher, {attributes: true});

      launcher.children[0].contentWindow.sendGadgetEvent(
        {event: 'setAttributes', data: {test2: 'new-config'}});
    });

    it('fires an event upon receiving setLearnerState', function(done) {
      var observer = new MutationObserver(function() {
        chai.expect(launcher.getAttribute('data-test2')).to.equal('new-userstate');
        done();
      });
      observer.observe(launcher, {attributes: true, subtree: true});

      launcher.children[0].contentWindow.sendGadgetEvent(
        {event: 'setLearnerState', data: {test2: 'new-userstate'}});
    });

    it('updates height when receiving setHeight', function(done) {
      var observer = new MutationObserver(function() {
        chai.expect(launcher.clientHeight).to.eq(137);
        observer.disconnect();
        done();
      });
      observer.observe(launcher, {attributes: true, subtree: true});

      launcher.children[0].contentWindow.sendGadgetEvent(
        {event: 'setHeight', data: {pixels: 137}});
    });

    it('caps height at 720 pixels', function(done) {
      var observer = new MutationObserver(function() {
        chai.expect(launcher.clientHeight).to.eq(720);
        observer.disconnect();
        done();
      });
      observer.observe(launcher, {attributes: true, subtree: true});

      launcher.children[0].contentWindow.sendGadgetEvent(
        {event: 'setHeight', data: {pixels: 1337}});
    });

    it('passes on some events that are handled by the player', function(done) {
      eventList = ['setPropertySheetAttributes', 'setEmpty', 'track', 'changeBlocking', 'requestAsset'];
      eventsFired = 0;
      eventList.forEach(function(eventName) {
        // count every event being fired, until we've had them all
        launcher.addEventListener(eventName, function() {
          if (++eventsFired == eventList.length) done();
        });
      });

      // send all events
      eventList.forEach(function(eventName) {
        launcher.children[0].contentWindow.sendGadgetEvent({event: eventName});
      });
    });

    it('passes on error events', function(done) {
      previousOnError = window.onerror;
      window.onerror = function() {
        window.onerror = previousOnError;
        done();
      };
      launcher.children[0].contentWindow.sendGadgetEvent({event: 'error'});
    });
  });
});
