(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory); // AMD
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(); // Node
  } else {
    root.FormChangeTracker = factory(); // Browser globals
  }
}(this, function () {
  "use strict";

  /**
   * Constructor function for FormChangeTracker
   *
   * @param options Optional options object, with supported properties "selector",
   *        "classname", "confirm"
   * @constructor
   */
  var FormChangeTracker = function (options) {

    this.observedControls = [];

    options = FormChangeTracker.getOptions(options);

    this.form = document.querySelector(options.selector);

    if (!this.form) {
      throw new Error('Selector does not match: ' + options.selector);
    }

    if ('form' !== this.form.tagName.toLowerCase()) {
      throw new Error(
        'The selector is expected to select a <form> element, but selected <' +
        this.form[0].tagName.toLowerCase() + '>'
      );
    }

    this.origVals = {};
    this.chngVals = {};
    this.resetButton = this.form.querySelector('input[type="reset"]');
    this.classname = options.classname;

    if (this.resetButton) {
      this.resetButton.addEventListener('click', function (e) {
        if (this.isDirty()) {
          e.preventDefault();
          options.confirm(
            function () {
              this.form.reset();
              this.markFormAsDirty(false);
            }.bind(this)
          );
        }
      }.bind(this));
    }

    this.eventListener = this.handleEvent.bind(this);

    var controls = this.form.querySelectorAll('input, textarea, select');
    for (var i = 0, ii = controls.length; i < ii; i ++) {
      var control = controls[i];
      var eventName = FormChangeTracker.eventNameByType(control);
      if (control.name && eventName) {
        this.origVals[control.name] = FormChangeTracker.controlValue(control);
        control.addEventListener(eventName, this.eventListener);
        this.observedControls.push([control, eventName]);
      }
    }

    this.markFormAsDirty(false);
  };

  /**
   * Stops observing events of all controls currently observed
   */
  FormChangeTracker.prototype.unbind = function() {
    this.observedControls.forEach(
      function (observed) {
        observed[0].removeEventListener(observed[1], this.eventListener);
      }.bind(this)
    );
    this.observedControls = [];
  };

  /**
   * @param options
   * @returns {{}}
   */
  FormChangeTracker.getOptions = function(options) {
    if (options && 'object' !== typeof options) {
      console.error('Argument passed to FormChangeTracker must be an options object. Will fall back to defaults.');
      options = {};
    }

    options = options || {};
    options.selector = options.selector || 'form';
    options.classname = options.classname || 'control-changed';

    if (options.confirm &&
      'function' !== typeof options.confirm) {
      console.error('options.confirm must be a function. Will fall back to default.');
      options.confirm = null;
    }

    if (!options.confirm) {
      options.confirm = function (callback) {
        if (confirm('Are you sure you want to reset the form and lose unsaved changes?')) {
          callback();
        }
      };
    }

    return options;
  };

  /**
   * To be invoked when the event occurred on the observed control
   *
   * Will check if control's value was changed from its original value or
   * changed back to its original value, and performs the necessary actions.
   *
   * @param event
   */
  FormChangeTracker.prototype.handleEvent = function (event) {
    var control = event.target;
    var i, ii, label, radioButtons;

    if ('radio' === control.type) {
      // Reset other radio buttons in this form having the same name
      radioButtons = this.form.querySelectorAll('input[type=radio][name=' + control.name + ']');
      for (i = 0, ii = radioButtons.length; i < ii; i ++) {
        radioButtons[i].classList.remove(this.classname);
        label = FormChangeTracker.findLabel(radioButtons[i]);
        if (label) {
          label.classList.remove(this.classname);
        }
      }
    }

    var labelElement = FormChangeTracker.findLabel(control);

    if (this.origVals[control.name] === FormChangeTracker.controlValue(control)) {
      // This control is unchanged
      this.chngVals[control.name] = false;
      this.markFormAsDirty(this.isDirty());
      control.classList.remove(this.classname);
      if (labelElement) {
        labelElement.classList.remove(this.classname);
      }
    } else {
      // Control was changed
      this.markControlAsChanged(control, labelElement);
    }
  };

  /**
   * Method that should be called with false as argument, if you reset the form
   *
   * @param isDirty
   */
  FormChangeTracker.prototype.markFormAsDirty = function (isDirty) {
    if (isDirty) {
      if (this.resetButton) {
        this.resetButton.removeAttribute('disabled');
      }
    } else {
      if (this.resetButton) {
        this.resetButton.setAttribute('disabled', 'disabled');
      }
      this.chngVals = {};
      var labels = this.form.querySelectorAll('label');
      for (var i = 0, ii = labels.length; i < ii; i ++) {
      	labels[i].classList.remove(this.classname)
      }
    }
  };

  /**
   * Returns whether any observed controls were changed
   *
   * @returns {boolean}
   */
  FormChangeTracker.prototype.isDirty = function () {
    for (var theName in this.origVals) {
      if (this.origVals.hasOwnProperty(theName)) {
        if (this.chngVals[theName]) {
          return true; // This one changed
        }
      }
    }
    return false;
  };

  /**
   * Notifies change of a control to FormChangeTracker
   *
   * This method is usually not needed, but only in special cases like having a
   * JS WYSIWYG editor in the form, whose edit state cannot be tracked by FormChangeTracker.
   *
   * @param control
   * @param labelElement
   */
  FormChangeTracker.prototype.markControlAsChanged = function (control, labelElement) {
    this.markFormAsDirty(true);
    this.chngVals[control.name] = true;

    control.classList.add(this.classname);

    if (labelElement) {
      labelElement.classList.add(this.classname);
    }
  };

  /**
   * Returns the name of the event to be observed based on the control type
   *
   * @param control
   *
   * @returns {String|null}
   */
  FormChangeTracker.eventNameByType = function (control) {
    switch (control.type) {
      case 'color':
      case 'date':
      case 'email':
      case 'month':
      case 'number':
      case 'password':
      case 'search':
      case 'tel':
      case 'text':
      case 'textarea':
      case 'time':
      case 'url':
      case 'week':
        return 'input';
      case 'checkbox':
      case 'radio':
        return 'click';
      case 'file':
      case 'select':
      case 'select-multiple':
      case 'select-one':
        return 'change';
      case 'button':
      case 'hidden':
      case 'reset':
      case 'range':
        // On IE11, "range" will trigger "change", but not "input"
        if (-1 === navigator.userAgent.indexOf('MSIE')) {
          return 'input';
        }
        return 'change';
      case 'submit':
        // Ignore
        return null;
      default:
        console.warn('Unsupported type: ' + control.type);
        return null;
    }
  };

  /**
   * Returns a scalar representation of the control suitable for tracking value changes
   *
   * @param control
   * @returns {*}
   */
  FormChangeTracker.controlValue = function (control) {
    if ('radio' === control.type) {
      return +control.checked;
    }
    if ('checkbox' === control.type) {
      if (control.indeterminate) {
        return 2;
      }
      return +control.checked;
    }
    if ('select' === control.type ||
      'select-multiple' === control.type) {
      var indexes = [];
      for (var i = 0, ii = control.length; i < ii; i++) {
        // Workaround due to IE11's missing support for select.selectedOptions
        if (control.options[i].selected) {
          indexes.push(i);
        }
      }
      return indexes.join('-');
    }
    return control.value;
  };

  /**
   * Returns a the <label> element corresponding to the given
   * control, or null, if there is none
   *
   * @param control
   * @returns {Element|null}
   */
  FormChangeTracker.findLabel = function (control) {
    var id = control.getAttribute('id');
    if (id) {
      return document.querySelector('label[for="' + id + '"]');
    }
    return null;
  };

  return FormChangeTracker;
}));
