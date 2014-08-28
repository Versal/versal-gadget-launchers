/* global _ */

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
    get: function(){
      return this.getAttribute('editable') == 'true';
    }
  },

  config: {
    get: function(){
      return this.readAttributeAsJson('data-config');
    }
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
  // a temp memory to avoid sending duplicated messages
  this._previousMessages = {};
};

prototype.attachedCallback = function(){
  this.el = document.createElement('div');
  this.el.src = this.src;

  this.childComponent = document.createElement('vs-texthd');
  this.el.appendChild(this.childComponent);
  this.appendChild(this.el);

  //relative paths is always relative to the main document!
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = 'http://localhost:3000/api/gadgets/local/texthd/0.0.1/vs-texthd/dist/vs-texthd.html';
  document.head.appendChild(link);

  this.initObserver();

  // necessary to remove spinner
  this.fireCustomEvent('rendered');
};

prototype.initObserver = function(){
  var sendAttributesToPlayer = function(mutation){
    if(mutation.type === 'attributes') {
      var newConfig = mutation.target.getAttribute('data-config');

      // Player needs those events, until we have mutation observers in place
      this.fireCustomEvent('setAttributes', JSON.parse(newConfig));
    }
  }.bind(this);

  // necessary to avoid infinite loop
  var sendAttributesToPlayerThrottled = _.throttle(sendAttributesToPlayer, 200);

  // select the target node
  var target = this.childComponent;

  // create an observer instance
  this.observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      sendAttributesToPlayerThrottled(mutation);
    });
  });

  // configuration of the observer:
  var config = { attributes: true };

  // pass in the target node, as well as the observer options
  this.observer.observe(target, config);
};

prototype.detachedCallback = function(){
  this.observer.disconnect();
  this.removeChild(this.el);
};

prototype.attributeChangedCallback = function(name, oldAttribute, newAttribute){
  switch(name) {
    case 'editable':
      this.sendMessageToChild('editableChanged', { editable: this.editable });
      break;

    case 'data-config':
      this.sendMessageToChild('attributesChanged', this.config);
      break;

    default:
      break;
  }
};

var _updateChildAttributes = function(message, childComponent){
  switch (message.event) {
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

    default:
      break;
  }
};

prototype.sendMessageToChild = function(eventName, data) {
  if (JSONDeepEquals(this._previousMessages[eventName], data)) return;

  var message = { event: eventName };
  if(data) { message.data = data; }

  //trigger message on the component directly
  if(this.el && this.childComponent) {
    _updateChildAttributes(message, this.childComponent);
    this.log('↘', message.event, message.data);
    this._previousMessages[eventName] = data;
  } else {
    // TODO
    // should we wait and send the message again?
  }
};

prototype.fireCustomEvent = function(eventName, data, options) {
  options = options || {};
  var evt = new CustomEvent(eventName, { detail: data, bubbles: options.bubbles || false });
  this.dispatchEvent(evt);
};

document.registerElement('versal-component-launcher', { prototype: prototype });
