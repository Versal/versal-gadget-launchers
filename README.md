# Versal Iframe Launcher

Versal iframe launcher enables web-component interface for an iframe gadget. Launcher sends `attributeChangedCallback` and `attachedCallback`, as if you were in web component. Gadget can `setAttribute` and `dispatchEvent`. All attributes, set by the gadget, are saved in launcher's dataset.

## attributes

<table>
<tr><th>name</th><th>options</th><th>decription</th></tr>
<tr><td><b>src</b></td><td>URL</td><td>Path to index.html of the gadget you want to launch.</td></tr>
<tr><td><b>editable</b></td><td>boolean</td><td>Toggle this attribute to send 'editableChanged' event to the gadget.</td></tr>
<tr><td><b>debug</b></td><td>boolean</td><td>If true, launcher will print all the events to console.</td></tr>
<tr><td><b>data-*</b></td><td>arbitrary value</td><td>All data- attributes are send to the iframe, without "data-".</td></tr>
</table>

## lifecycle

Once attached to the document, launcher creates an iframe with the specified `src` and starts to listen to `window.onmessage`. When it receives message from the contained iframe, it either takes an appropriate action, or re-triggers it as DOM event.

## supported messages

<table>
<tr><th>event</th><th>data</th><th>decription</th></tr>
<tr><td><b>setHeight</b></td><td><code>{ pixels: 200 }</code></td><td>Sets the height of contained iframe.</td></tr>
<tr><td><b>setAttributes</b></td><td><code>{ city: 'San Francisco', state: 'CA' }</code></td><td>Sets data- attributes on itself. The following attributes will be set: `data-city="San Francisco"` and `data-state="CA"`.</td></tr>
</table>


## Usage

1. Install [versal-component-runtime](https://github.com/Versal/component-runtime) and versal-iframe-launcher:
```
bower install versal-component-runtime versal-iframe-launcher
```

2. Include `versal-component-runtime` as a script in the HEAD section of your page:
```
<script src="bower_components/versal-component-runtime/dist/runtime.min.js"></script>
```

3. Link versal-iframe-launcher in the HEAD section of your page:
```
<link rel="import" href="bower_components/versal-iframe-launcher/index.html" />
```

4. Embed `<versal-iframe-launcher>` in the page like that:
```
<versal-iframe-launcher
  src="https://stack.versal.com/api2/gadgets/am/hello-world/0.1.6/index.html"
  data-config='{ "word": "test", "color": "red", "imageid": "3f6ba8d9-b464-46a9-8fa5-fec68a28a052" }'
  data-environment='{ "assetUrlTemplate": "https://static.versal.com/assets/<%= id %>'>
</versal-iframe-launcher>
```

Complete example is available at `demo.html`.

# Gadget API v0.2.1

To use Versal Gadget API first of all you have to send 'startListening' event. You can send this event after all your modules are loaded and initialized, and gadget is ready to do the job.

### startListening

    window.parent.postMessage({ event: 'startListening' });

Reports to the player, that gadget is ready to receive events. Player responds with a series of events. See below.

```
{
  event: 'startListening'
}
```

## Player Events

After receiving startListening event from the gadget, player responds with the following events:

### environmentChanged

Sends environment variables to the gadget once immediately after receiving `startListening` from the gadget.<br/><br/> Currently there is only one environment variable: `assetUrlTemplate` Use this template to obtain asset URL by id.

```
{
  event: 'environmentChanged'
  data: {
    assetUrlTemplate: '//static.versal.com/assets/<%= id %>'
  }
}
```

### attributesChanged

Delivering the initial or updated set of attributes (PUT).

```
{
  event: 'attributesChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}
```

### learnerStateChanged

Delivering the initial or updated learner state (PUT).

```
{
  event: 'learnerStateChanged'
  data: {
    foo: 'bar'
    baz: 2
  }
}
```

### editableChanged

Indicate changed editability of the gadget. Sent once before `attached` and then in response to user actions.

```
{
  event: 'editableChanged'
  data: {
    editable: true
  }
}
```

### attached

Ready to render - sent after all 'bootstrapping' attribute events.

```
{
  event: 'attached'
}
```

## Gadget commands

Commands, that gadget can trigger to inform player about changes.

### setAttributes

Persisting an updated set of attributes (PATCH). Player replies with the confirmation message `attributesChanged`.

```
{
  event: 'setAttributes'
  data: {
    foo: 'bar'
    baz: 2
  }
}
```

### setLearnerState

Persisting an updated set of learner attributes (PATCH). Player replies with the confirmation message `learnerStateChanged`.

```
{
  event: 'setLearnerState'
  data: {
    foo: 'bar'
    baz: 2
  }
}
```

### setHeight

Adjust the height of the gadget.

```
{
  event: 'setHeight'
  data: {
    pixels: 1337
  }
}
```

### setPropertySheetAttributes

Define an updated property sheet schema.

```
{
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
}
```

### setEmpty

Set the emptiness (placeholder) status of the gadget.

```
{
  event: 'setEmpty'
  data: {
    empty: true
  }
}
```

### track

Send analytics and tracking information.<br>
@type (required) is the name of the tracking event.

```
{
  event: 'track'
  data: {
    @type: 'video-load-time'
    duration: 1234
  }
}
```

### error

Throw a rendering-time error.

```
{
  event: 'error'
  data: {
    message: 'Everything broke!'
    stacktrace: 'Line 123: ...'
  }
}
```

### changeBlocking

Indicate a potential change in lesson blocked-ness (e.g. after an assessment is submitted).

```
{
  event: 'changeBlocking'
}
```

### requestAsset

Request a new asset from a user. When delivered, it will be saved in the field given by the `attribute` property, and a corresponding `attributesChanged` event will be fired.

```
{
  event: 'requestAsset'
  data: {
    type: 'image'
    attribute: 'myImage'
  }
}
```
