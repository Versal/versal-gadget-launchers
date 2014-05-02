describe('player events', function() {
  var recordedEvents, launcher;

  beforeEach(function() {
    launcher = document.createElement('versal-iframe-launcher');
    launcher.setAttribute('src', '/base/test/record_player_events.html');
    document.body.appendChild(launcher);
  });

  afterEach(function() {
    document.body.removeChild(launcher);
  });

  it('sends a bunch of initial events', function(done) {
    recordedEvents = [];

    window.recordPlayerEvent = function(eventMessage) {
      recordedEvents.push(eventMessage);

      if (eventMessage.event == 'attached') {
        chai.expect(recordedEvents).to.deep.equal([
          {"event":"environmentChanged","data":{}},
          {"event":"attributesChanged","data":{}},
          {"event":"learnerStateChanged","data":{}},
          {"event":"editableChanged","data":{"editable":false}},
          {"event":"setEditable","data":{"editable":false}},
          {"event":"attached"}
        ]);
        delete window.recordPlayerEvent;
        done();
      }
    };
  });
});
