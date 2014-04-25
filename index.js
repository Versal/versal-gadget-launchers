var patch = function(a, b) {
  Object.keys(b).forEach(function(key){
    a[key] = b[key];
  });
  return a;
};

var P = Object.create(HTMLElement.prototype, {
  editable: {
    get: function(){ return this.getAttribute('editable') == 'true'; }
  },

  env: {
    get: function(){ return this.readAttributeAsJson('data-environment'); }
  },

  config: {
    get: function(){ return this.readAttributeAsJson('data-config'); }
  },

  userstate: {
    get: function(){ return this.readAttributeAsJson('data-userstate'); }
  }
});

P.readAttributeAsJson = function(name) {
  if(!this.hasAttribute(name)) { return {}; };
  return JSON.parse(this.getAttribute(name));
};

P.attachedCallback = function(){
  console.log('attached');
  this.iframe = document.createElement('iframe');
  this.iframe.src = this.getAttribute('src');
  this.iframe.addEventListener('message', this.handleMessage.bind(this));

  this.appendChild(this.iframe);
};

P.attributeChangedCallback = function(name, old, value){
  switch(name) {
    case 'editable':
      this.sendMessage('editableChanged', { editable: this.editable });
      // Compat
      this.sendMessage('setEditable', { editable: this.editable });
      break;

    case 'data-config':
      this.sendMessage('attributesChanged', this.config);
      break;

    case 'data-userstate':
      this.sendMessage('learnerStateChanged', this.userstate);
      break;
  }
};

P.handleMessage = function(e){
  if(e.detail.event) {
    var event = e.detail.event;
    var data = e.detail.data;

    console.log('↖', event, data);

    var handler = this.messageHandlers[event];
    if(handler) {
      handler.call(this, data);
    } else {
      console.error('Unknown event received: ' + event);
      this.fireEvent('error', {message: 'Unknown event received: ' + event});
    }
  }
};

P.sendMessage = function(event, data){
  var message = { event: event };
  if(data) { message.data = data; }
  if(this.iframe && this.iframe.contentWindow) {
    this.iframe.contentWindow.postMessage(message, '*');
    console.log('↘', message.event, message.data);
  }
};

P.fireEvent = function(event, data) {
  var evt = new CustomEvent(event, { detail: data, bubbles: true });
  this.dispatchEvent(evt);
};

P.messageHandlers = {
  startListening: function(){
    this.sendMessage('environmentChanged', this.env);
    this.sendMessage('attributesChanged', this.config);
    this.sendMessage('learnerstateChanged', this.userstate);
    this.sendMessage('editableChanged', { editable: this.editable });
    // Compat
    this.sendMessage('setEditable', { editable: this.editable });
    this.sendMessage('attached');
  },

  setHeight: function(data){
    var height = Math.min(data.pixels, 720);
    this.iframe.style.height = height + 'px';
  },

  setAttributes: function(data){
    var config = this.readAttributeAsJson('data-config');
    patch(config, data);
    this.setAttribute('data-config', JSON.stringify(config));
  },

  setLearnerState: function(data) {
    var userstate = this.readAttributeAsJson('data-userstate');
    patch(userstate, data);
    this.setAttribute('data-userstate', JSON.stringify(userstate));
  },

  getPath: function(data) {
    console.warn('getPath/setPath are obsolete');
    var assetUrlTemplate = this.env && this.env.assetUrlTemplate;
    if(assetUrlTemplate) {
      var url = assetUrlTemplate.replace('<%= id %>', data.assetId );
      this.sendMessage('setPath', { url: url});
    }
  },

  setPropertySheetAttributes: function(data) { this.fireEvent('setPropertySheetAttributes', data); },
  setEmpty: function(data) { this.fireEvent('setEmpty', data); },
  track: function(data) { this.fireEvent('track', data); },
  error: function(data) { this.fireEvent('error', data); },
  changeBlocking: function(data) { this.fireEvent('changeBlocking', data); },
  requestAsset: function(data) { this.fireEvent('requestAsset', data); }
};

window.addEventListener('message', function(e){
  var iframes = document.querySelectorAll('versal-iframe-launcher > iframe');
  Array.prototype.forEach.call(iframes, function(iframe){
    if(iframe.contentWindow == e.source) {
      iframe.dispatchEvent(new CustomEvent('message', { detail: e.data }));
    }
  });
});

document.registerElement('versal-iframe-launcher', { prototype: P });
