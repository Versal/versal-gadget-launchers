/* global _ */
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
  },

  src: {
    get: function(){
      return this.getAttribute('src') || 'about:blank';
    }
  }
});

prototype.readAttributeAsJson = function(name) {
  if(!this.hasAttribute(name)) { return {}; }
  return JSON.parse(this.getAttribute(name));
};

prototype.log = function(dir, event, data) {
  if(this.debug) {
    console.log(dir, event, data);
  }
};

prototype.createdCallback = function() {
  this.el = document.createElement('div');
  this.el.src = this.src;

  // TODO
  // replace vs-texthd with a variable passed from player
  this.childComponent = document.createElement('vs-texthd');
  this.el.appendChild(this.childComponent);
  this.appendChild(this.el);
};

prototype.attachedCallback = function(){
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = this.src;
  document.head.appendChild(link);

  this.initObserver();

  this.initChild();

  // necessary to remove spinner
  this.fireCustomEvent('rendered');
};

prototype.initObserver = function(){
  var sendAttributesToPlayer = function(mutation){
    if(mutation.type === 'attributes') {
      var config = mutation.target.getAttribute('data-config');
      this.fireCustomEvent('setAttributes', JSON.parse(config));
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

prototype.initChild = function(){
  this.setChildEditable();
  this.setChildConfig();
};

prototype.detachedCallback = function(){
  this.observer.disconnect();
  this.removeChild(this.el);
};

prototype.setChildEditable = function(){
  if(this.editable) {
    this.childComponent.setAttribute('editable', 'true');
  } else {
    this.childComponent.removeAttribute('editable');
  }
};

prototype.setChildConfig = function(){
  this.childComponent.setAttribute('data-config', JSON.stringify(this.config));
};

prototype.attributeChangedCallback = function(name, oldAttribute, newAttribute){
  switch(name) {
    case 'editable':
      this.setChildEditable();
      break;
    case 'data-config':
      this.setChildConfig();
      break;
    default:
      break;
  }
};

prototype.fireCustomEvent = function(eventName, data, options) {
  options = options || {};
  var evt = new CustomEvent(eventName, { detail: data, bubbles: options.bubbles || false });
  this.dispatchEvent(evt);
};

document.registerElement('versal-component-launcher', { prototype: prototype });
