This repo contains the new decoupled launcher for iframe gadgets. We are still moving things around quite a bit, so please bear with us! :-)

Below you can find the API documentation.

# Gadget API

## Player Events

Events, reported by the Player

<table>
<tr><th>Event</th> <th>Description</th></tr>

<tr>
  <td><pre>{
  event: 'environmentChanged'
  data: {
    assetUrlTemplate: '//static.versal.com/assets/<%= id %>'
  }
}</pre></td>
  <td>Sends environment variables to the gadget once immediately after receiving `startListening` from the gadget.<br/><br/> Currently there is only one environment variable: `assetUrlTemplate` Use this template to obtain asset URL by id.</td>
</tr>

<tr>
  <td><pre>{
  event: 'attributesChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Delivering the initial or updated set of attributes (PUT)</td>
</tr>

<tr>
  <td><pre>{
  event: 'learnerStateChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Delivering the initial or updated learner state (PUT)</td>
</tr>

<tr>
  <td><pre>{
  event: 'editableChanged'
  data: {
    editable: true
  }
}</pre></td>
  <td>Indicate changed editability of the gadget. Sent once before `attached` and then in response to user actions.</td>
</tr>

<tr>
  <td><pre>{
  event: 'attached'
}</pre></td>
  <td>Ready to render - sent after all 'bootstrapping' attribute events</td>
</tr>

<tr>
  <td><pre>{
  event: 'detached'
}</pre></td>
  <td>Gadget has been removed from the DOM</td>
</tr>

</table>

## Gadget Events

Events triggered by Gadgets

<table>
<tr><th>Event</th> <th>Description</th></tr>

<tr>
  <td><pre>{
  event: 'startListening'
}</pre></td>
  <td>Reports to the player, that gadget is ready to receive events. Player responds with a series of events. See below.</td>
</tr>

<tr>
  <td><pre>{
  event: 'setAttributes'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Persisting an updated set of attributes (PATCH). Player replies with the confirmation message `attributesChanged`</td>
</tr>

<tr>
  <td><pre>{
  event: 'setLearnerState'
  data: {
    foo: 'bar'
    baz: 2
  }
}</pre></td>
  <td>Persisting an updated set of learner attributes (PATCH). Player replies with the confirmation message `learnerStateChanged`</td>
</tr>

<tr>
  <td><pre>{
  event: 'setHeight'
  data: {
    pixels: 1337
  }
}</pre></td>
  <td>Adjust the height of the gadget</td>
</tr>

<tr>
  <td><pre>{
  event: 'setPropertySheetAttributes'
  data: {
    selectAmount: {
      type: 'Range',
      min: 100,
      max: 500,
      step: 20
    },
    chooseDay: {
      type: 'Select',
      options: ['Monday', 'Wednesday', 'Friday', 'Any day']
    }
  }
}</pre></td>
  <td>Define an updated property sheet schema</td>
</tr>

<tr>
  <td><pre>{
  event: 'setEmpty'
  data: {
    empty: true
  }
}</pre></td>
  <td>Set the emptiness (placeholder) status of the gadget</td>
</tr>

<tr>
  <td><pre>{
  event: 'track'
  data: {
    @type: 'video-load-time'
    duration: 1234
  }
}</pre></td>
  <td>
    Send analytics and tracking information.<br>
    @type (required) is the name of the tracking event.
  </td>
</tr>

<tr>
  <td><pre>{
  event: 'error'
  data: {
    message: 'Everything broke!'
    stacktrace: 'Line 123: ...'
  }
}</pre></td>
  <td>Throw a rendering-time error</td>
</tr>

<tr>
  <td><pre>{
  event: 'changeBlocking'
}</pre></td>
  <td>Indicate a potential change in lesson blocked-ness (e.g. after an assessment is submitted)</td>
</tr>

<tr>
  <td><pre>{
  event: 'requestAsset'
  data: {
    type: 'image'
    attribute: 'myImage'
  }
}</pre></td>
  <td>Request a new asset from a user. When delivered, it will be saved in the field given by the `attribute` property, and a corresponding `attributesChanged` event will be fired.</td>
</tr>
</table>

# Challenges API

### Player Events

Events triggered by the Player

<table>
<tr><th>Event</th> <th>Description</th></tr>
<tr>
  <td><pre>{
  event: 'challengesChanged'
  data: {
    challenges: [{...}, {...}, {...}]
  }
}</pre></td>
  <td>Delivering the initial or updated set of challenges (PATCH)</td>
</tr>

<tr>
  <td><pre>{
  event: 'scoresChanged'
  data: {
    scores: [1, 0, 1]
    totalScore: 1,
    responses: [true, true, false]
  }
}</pre></td>
  <td>Delivering the initial or updated learner scores (PATCH)</td>
</tr>

</table>

### Gadget Events

Events triggered by Gadgets

<table>
<tr><th>Event</th> <th>Description</th></tr>

<tr>
  <td><pre>{
  event: 'setChallenges'
  data: {
    challenges: [{...}, {...}, {...}]
  }
}</pre></td>
  <td>Persisting an updated set of challenges (PATCH). Player replies with the confirmation message `challengesChanged`</td>
</tr>

<tr>
  <td><pre>{
  event: 'scoreChallenges'
  data: {
    responses: [true, true, false]
  }
}</pre></td>
  <td>Performs scoring of user's responses against the current set of challenges (POST). Player replies with the confirmation message `scoresChanged`</td>
</tr>

</table>
