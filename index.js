var _patch = function(to, from) {
  Object.keys(from).forEach(function(key){
    to[key] = from[key];
  });
  return to;
};

var _clone = function(obj) {
  var clone = {};
  Object.keys(obj).forEach(function(key){
    clone[key] = obj[key];
  });
  return clone;
};

var prototype = Object.create(HTMLElement.prototype, {
  src: {
    get: function(){ return this.getAttribute('src') || 'about:blank'; }
  },

  editable: {
    get: function(){ return this.getAttribute('editable') == 'true'; }
  },

  debug: {
    get: function(){ return this.hasAttribute('debug'); }
  },

  env: {
    get: function(){ return this.readAttributeAsJson('env'); }
  }
});

prototype.readAttributeAsJson = function(name) {
  if(!this.hasAttribute(name)) { return {}; }
  return JSON.parse(this.getAttribute(name));
};

prototype.log = function(dir, event, data) {
  if(this.debug) { console.log(dir, event, data); }
};

prototype.attachedCallback = function(){
  this.iframe = document.createElement('iframe');
  this.iframe.src = this.src;
  this.iframe.addEventListener('message', this.handleMessage.bind(this));

  this.appendChild(this.iframe);
};

prototype.detachedCallback = function(){
  this.removeChild(this.iframe);
};

prototype.attributeChangedCallback = function(name, old, current){
  if(this.iframe){
    switch(name) {
      case 'src':
        this.iframe.src = this.src;
        break;

      case 'editable':
        this.sendMessage('editableChanged', { editable: this.editable });
        break;

      default:
        if(name.indexOf('data-') == 0) {
          var attr = {};
          attr[name.slice(5)] = current;
          this.sendMessage('attributesChanged', attr);
        }
    };
  };
};

prototype.handleMessage = function(event) {
  if(event.detail.event) {
    var eventName = event.detail.event;
    var data = event.detail.data;

    this.log('↖', eventName, data);

    var handler = this.messageHandlers[eventName];
    if(handler) {
      handler.call(this, data);
    } else {
      console.error('Unknown event received: ' + eventName);
      this.fireCustomEvent('error', {message: 'Unknown event received: ' + eventName});
    }
  }
};

prototype.sendMessage = function(eventName, data) {
  var message = { event: eventName };
  if(data) { message.data = data; }
  if(this.iframe && this.iframe.contentWindow) {
    this.iframe.contentWindow.postMessage(message, '*');
    this.log('↘', message.event, message.data);
  }
};

prototype.fireCustomEvent = function(eventName, data) {
  var evt = new CustomEvent(eventName, { detail: data, bubbles: true });
  this.dispatchEvent(evt);
};

prototype.messageHandlers = {
  startListening: function(){
    this.sendMessage('environmentChanged', this.env);
    this.sendMessage('attributesChanged', _clone(this.dataset));
    this.sendMessage('editableChanged', { editable: this.editable });
    this.sendMessage('attached');
  },

  setHeight: function(data){
    var height = Math.min(data.pixels, 720);
    this.iframe.style.height = height + 'px';
  },

  setAttributes: function(attrs){
    this.fireCustomEvent('setAttributes', attrs);
  },

  setLearnerState: function(attrs) {
    this.fireCustomEvent('setLearnerState', userstate);
  },

  getPath: function(data) {
    console.warn('getPath/setPath are obsolete');
    var assetUrlTemplate = this.env && this.env.assetUrlTemplate;
    if(assetUrlTemplate) {
      var url = assetUrlTemplate.replace('<%= id %>', data.assetId );
      this.sendMessage('setPath', { url: url});
    }
  },

  setPropertySheetAttributes: function(data) { this.fireCustomEvent('setPropertySheetAttributes', data); },
  setEmpty: function(data) { this.fireCustomEvent('setEmpty', data); },
  track: function(data) { this.fireCustomEvent('track', data); },
  error: function(data) { this.fireCustomEvent('error', data); },
  changeBlocking: function(data) { this.fireCustomEvent('changeBlocking', data); },
  requestAsset: function(data) { this.fireCustomEvent('requestAsset', data); }
};

window.addEventListener('message', function(event){
  var iframes = document.querySelectorAll('versal-iframe-launcher > iframe');
  Array.prototype.forEach.call(iframes, function(iframe){
    if(iframe.contentWindow == event.source) {
      iframe.dispatchEvent(new CustomEvent('message', { detail: event.data }));
    }
  });
});

document.registerElement('versal-iframe-launcher', { prototype: prototype });
