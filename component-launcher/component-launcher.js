var patch = function(to, from) {
  Object.keys(from).forEach(function(key){
    to[key] = from[key];
  });
  return to;
};

var JSONDeepEquals = function(o1, o2) {
  if (typeof o1 !== "object" || typeof o1 !== typeof o2 || o1 == null || o2 == null) {
    return o1 === o2;
  }

  var k1 = Object.keys(o1).sort();
  var k2 = Object.keys(o2).sort();
  if (k1.length != k2.length) return false;

  for (var i=0; i<k1.length; i++) {
    if (!JSONDeepEquals(o1[k1[i]], o2[k2[i]])) return false;
  }
  return true;
};

var prototype = Object.create(HTMLElement.prototype, {
  editable: {
    get: function(){ return this.getAttribute('editable') == 'true'; }
  },

  config: {
    get: function(){ return this.readAttributeAsJson('data-config'); }
  }
});

prototype.readAttributeAsJson = function(name) {
  if(!this.hasAttribute(name)) { return {}; }
  return JSON.parse(this.getAttribute(name));
};

prototype.log = function(dir, event, data) {
  if(this.debug) { console.log(dir, event, data); }
};

prototype.createdCallback = function() {
  this._previousMessages = {};
};

prototype.attachedCallback = function(){
  this.iframe = document.createElement('div');
  this.iframe.innerHTML = '<vs-texthd></vs-texthd>';
  this.iframe.src = this.src;
  this.addEventListener('message', this.handleMessage.bind(this));

  this.appendChild(this.iframe);

  //relative paths is always relative to the main document!
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = 'http://localhost:3000/api/gadgets/local/texthd/0.0.1/vs-texthd/dist/vs-texthd.html';
  document.head.appendChild(link);

  this.fireCustomEvent('rendered');
};

prototype.detachedCallback = function(){
  this.removeChild(this.iframe);
  window.clearTimeout(this._attributesChangedTimeout);
  window.clearTimeout(this._learnerStateChangedTimeout);
};

prototype.attributeChangedCallback = function(name, oldAttribute, newAttribute){
  switch(name) {
    case 'editable':
      this.sendMessage('editableChanged', { editable: this.editable });
      break;

    case 'data-config':
      window.clearTimeout(this._attributesChangedTimeout);
      this._attributesChangedTimeout = window.setTimeout((function() {
        this.sendMessage('attributesChanged', this.config);
      }).bind(this));
      break;

    default:
      break;
  }
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
      this.error({message: 'Unknown event received: ' + eventName});
    }
  }
};

var updateChildAttributes = function(message, childComponent){
  switch (message.event) {
    case 'environmentChanged':
      childComponent.setAttribute('data-environment', JSON.stringify(message.data));
      break;

    //special case
    case 'editableChanged':
      if(message.data.editable) {
        childComponent.setAttribute('editable', 'true');
      } else {
        childComponent.removeAttribute('editable');
      }
      break;

    case 'attributesChanged':
      childComponent.setAttribute('data-config', JSON.stringify(message.data));
      break;

    case 'learnerStateChanged':
      childComponent.setAttribute('data-userstate', JSON.stringify(message.data));
      break;

    default:
      break;
  }
};

prototype.sendMessage = function(eventName, data) {
  if (!this._listening) return;
  if (JSONDeepEquals(this._previousMessages[eventName], data)) return;

  var message = { event: eventName };
  if(data) { message.data = data; }
  if(this.iframe && this.iframe.contentWindow) {
    this.iframe.contentWindow.postMessage(message, '*');
    this.log('↘', message.event, message.data);
    this._previousMessages[eventName] = data;
  }

  //trigger message on the component directly
  var childComponent;
  if(this.iframe) {
    childComponent = this.iframe.querySelector('vs-texthd');
    updateChildAttributes(message, childComponent);
    this.log('↘', message.event, message.data);
  } else {
    // TODO
    // should we wait and send the message again
  }
};

prototype.fireCustomEvent = function(eventName, data, options) {
  options = options || {};
  var evt = new CustomEvent(eventName, { detail: data, bubbles: options.bubbles || false });
  this.dispatchEvent(evt);
};

prototype.messageHandlers = {
  startListening: function(){
    this._listening = true;
    this.sendMessage('environmentChanged', this.env);
    this.sendMessage('attributesChanged', this.config);
    this.sendMessage('learnerStateChanged', this.userstate);
    this.sendMessage('editableChanged', { editable: this.editable });
  },

  setAttributes: function(data){
    var config = this.readAttributeAsJson('data-config');
    patch(config, data);
    this.setAttribute('data-config', JSON.stringify(config));

    // Player needs those events, until we have mutation observers in place
    this.fireCustomEvent('setAttributes', config);
  }
};

document.registerElement('versal-component-launcher', { prototype: prototype });
