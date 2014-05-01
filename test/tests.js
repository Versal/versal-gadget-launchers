var expect = chai.expect;

describe('player events', function() {
  var recordedEvents, launcher;

  beforeEach(function() {
    launcher = document.createElement('versal-iframe-launcher');
    launcher.setAttribute('src', 'record_player_events.html');
    document.body.appendChild(launcher);
  });

  afterEach(function() {
    launcher.remove();
  });

  it('sends a bunch of initial events', function(done) {
    recordedEvents = [];

    window.recordPlayerEvent = function(eventMessage) {
      recordedEvents.push(eventMessage);

      if (eventMessage.event == 'scoresChanged') {
        expect(recordedEvents).to.deep.equal([
          {"event":"environmentChanged","data":{}},
          {"event":"attributesChanged","data":{}},
          {"event":"learnerStateChanged","data":{}},
          {"event":"editableChanged","data":{"editable":false}},
          {"event":"setEditable","data":{"editable":false}},
          {"event":"attached"},
          {"event":"challengesChanged","data":{}},
          {"event":"scoresChanged","data":{}}
        ]);
        delete window.recordPlayerEvent;
        done();
      }
    };
  });
});
