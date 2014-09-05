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
  },

  // TODO
  // pass this from the player
  componentName: {
    get: function(){
      return this.getAttribute('component-name');
    }
  }
});

prototype.readAttributeAsJson = function(name) {
  if(!this.hasAttribute(name)) { return {}; }
  return JSON.parse(this.getAttribute(name));
};

prototype.createdCallback = function() {
  var componentName = this.componentName || 'vs-texthd';
  if(componentName !== 'vs-texthd') {
    console.error('Component Launcher is not ready for anything rather than vs-texthd');
    return;
  }
  this.childComponent = document.createElement(componentName);
  this.appendChild(this.childComponent);
};

prototype.attachedCallback = function(){
  // import versal.html which has definitions for custom elements
  var link = document.createElement('link');
  link.rel = 'import';
  link.href = this.src;
  document.head.appendChild(link);

  this.initObserver();

  this.initChild();

  // necessary to remove spinner
  this.fireCustomEvent('rendered');
};

prototype.childAtSameStateAsLauncher = function(){
  return this.childComponent.getAttribute('data-config') === this.getAttribute('data-config');
};

prototype.initObserver = function(){
  var sendAttributesToPlayer = function(mutation){
    if(mutation.type === 'attributes' && mutation.attributeName === 'data-config') {
      var config = mutation.target.getAttribute('data-config');

      // return if child component is already at the correct state
      if(this.childAtSameStateAsLauncher()) {
        return;
      }

      this.fireCustomEvent('setAttributes', JSON.parse(config));
    }
  }.bind(this);

  // create an observer instance
  this.observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      sendAttributesToPlayer(mutation);
    });
  });

  // pass in the target node, as well as the observer options
  this.observer.observe(this.childComponent, { attributes: true });
};

prototype.initChild = function(){
  this.setChildEditable();
  this.setChildConfig();
};

prototype.detachedCallback = function(){
  this.observer.disconnect();
  this.removeChild(this.childComponent);
};

prototype.setChildEditable = function(){
  if(this.editable) {
    this.childComponent.setAttribute('editable', 'true');
  } else {
    this.childComponent.removeAttribute('editable');
  }
};

prototype.setChildConfig = function(){
  // return if child component is already at the correct state
  if(this.childAtSameStateAsLauncher()) {
    return;
  }

  this.childComponent.setAttribute('data-config', this.getAttribute('data-config'));
};

prototype.attributeChangedCallback = function(name){
  switch(name) {
    case 'editable':
      this.setChildEditable();
      break;
    case 'data-config':
      this.setChildConfig();
      break;
  }
};

prototype.fireCustomEvent = function(eventName, data, options) {
  options = options || {};
  var evt = new CustomEvent(eventName, { detail: data, bubbles: options.bubbles || false });
  this.dispatchEvent(evt);
};

document.registerElement('versal-component-launcher', { prototype: prototype });
