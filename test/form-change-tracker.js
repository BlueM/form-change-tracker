var assert = require('assert');
var FormChangeTracker = require('../form-change-tracker');

describe('FormChangeTracker', function () {

  before(
    function() {
      document = {
        querySelector: function () {
          return {
            tagName:'FORM',
            querySelector: function () {
            },
            querySelectorAll: function () {
              return [];
            }
          };
        }
      };
    }
  );

  describe('The observed event', function () {
    it('for an unknown control type is none, and a warning is written to console', function() {
      var oldConsole = console;
      var warning = false;
      console.warn = function() {
        warning = true;
      };
      var event = FormChangeTracker.eventNameByType({type: 'nosuchtype'});
      assert.equal(event, null);
      assert.equal(warning, true);
      console = oldConsole;
    });
    it('for a “hidden” or “reset” or “submit” element is: none', function() {
      ['hidden', 'reset', 'submit'].forEach(
        function(type) {
          var event = FormChangeTracker.eventNameByType({type: type});
          assert.equal(null, event);
        }
      );
    });
    it('for a “file”, “select”, “select-multiple” or “select-one” is: “change”', function() {
      ['file', 'select', 'select-multiple', 'select-one'].forEach(
        function(type) {
          var event = FormChangeTracker.eventNameByType({type: type});
          assert.equal('change', event);
        }
      );
    });
    it('for a “checkbox” or “radio” element is: “click”', function() {
      ['checkbox', 'radio'].forEach(
        function(type) {
          var event = FormChangeTracker.eventNameByType({type: type});
          assert.equal('click', event);
        }
      );
    });
    it('for a “color”, “date”, “email”, “month”, “number”, “password”, “range”, “search”, “tel”, “text”, “textarea”, “time”, “url” or “week” element is: “input”', function() {
      ['color', 'date', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'textarea', 'time', 'url', 'week'].forEach(
        function(type) {
          "use strict";
          var event = FormChangeTracker.eventNameByType({type: type});
          assert.equal('input', event);
        }
      );
    });
  });

  describe('Marking a control as changed', function () {
    it('marks the form as dirty, marks the control as changed and adds the CSS class to the label', function() {
      var f = new FormChangeTracker();
      var dirty = false, controlClassAdded = false, labelClassAdded = false;
      var c = {
        name: 'foobar',
        classList: {
          add : function() {
            controlClassAdded = true;
          }
        }
      };
      var l = {classList: {
        add : function() {
          labelClassAdded = true;
        }
      }};
      f.markFormAsDirty = function() {
        dirty = true;
      };
      f.markControlAsChanged(c, l);
      assert.equal(true, dirty);
      assert.equal(true, controlClassAdded);
      assert.equal(true, labelClassAdded);
      assert.equal(true, f.chngVals.foobar);
    });
  });

  describe('Marking the form as dirty or clean', function () {
    it('enables the reset button if marked as dirty', function() {
      var f = new FormChangeTracker();
      var enabled = false;
      f.resetButton = {
        removeAttribute: function(name) {
          assert.equal('disabled', name);
          enabled = true;
        }
      };
      f.markFormAsDirty(true);
      assert.equal(true, enabled);
    });
    it('disables the reset button if marked as clean and removes the CSS class from all labels', function() {
      var f = new FormChangeTracker();
      var disabled = false, classRemoved = false;
      f.form.querySelectorAll = function() {
        // Return label spy
        return [{
          classList: {
            remove: function() {
              classRemoved = true;
            }
          }
        }];
      };
      f.resetButton = {
        setAttribute: function(arg1, arg2) {
          assert.equal('disabled', arg1);
          assert.equal('disabled', arg2);
          disabled = true;
        }
      };
      f.markFormAsDirty(false);
      assert.equal(true, disabled);
      assert.equal(true, classRemoved);
    });
  });

  describe('Options', function () {
    it('are set to default values when no options are passed', function () {
      var defaults = FormChangeTracker.getOptions();
      assert('object' === typeof defaults);
      assert(defaults.selector && 'form' === defaults.selector);
      assert(defaults.classname && 'control-changed' === defaults.classname);
      assert(defaults.confirm && 'function' === typeof defaults.confirm);
    });
    it('passed to FormChangeTracker are used if valid', function () {
      var confirm = function() { };
      var defaults = FormChangeTracker.getOptions(
        {selector: '#form', classname: 'changed', confirm: confirm}
      );
      assert('object' === typeof defaults);
      assert(defaults.selector && '#form' === defaults.selector);
      assert(defaults.classname && 'changed' === defaults.classname);
      assert(defaults.confirm && confirm === defaults.confirm);
    });
    it('need to be an object', function () {
      var oldConsole = console;
      var called = 0;
      console.error = function(msg) {
        assert(-1 !== msg.indexOf('must be an options object'));
        called ++;
      };
      var defaults = FormChangeTracker.getOptions('#form');
      assert(1 === called);
      console = oldConsole;
    });
    it('need to pass a function as confirmation function', function () {
      var oldConsole = console;
      var called = 0;
      console.error = function(msg) {
        assert(-1 !== msg.indexOf('must be a function'));
        called ++;
      };
      var defaults = FormChangeTracker.getOptions({confirm: 'Confirm?'});
      assert(1 === called);
      console = oldConsole;
    });
  });

  describe('The form “dirty” state', function () {
    it('is initially false', function () {
      var f = new FormChangeTracker({});
      assert.equal(false, f.isDirty());
    });
    it('is true if an element is changed', function () {
      var f = new FormChangeTracker({});
      f.origVals = {foo: 'x', bar: 'y'};
      f.chngVals = {foo: true};
      assert.equal(true, f.isDirty());
    });
  });

  describe('The label for a given control', function() {
    it('is returned as null if it can’t be located', function() {
      "use strict";
      var controlStub = {
        getAttribute: function(arg) {
        }
      };
      assert.equal(null, FormChangeTracker.findLabel(controlStub));
    });
  });

  describe('The element value', function () {
    it('of an input[type=text] is its @value', function () {
      // var f = new FormChangeTracker({});
      assert.equal('Foo', FormChangeTracker.controlValue({value: 'Foo'}));
    });
    it('of an input[type=radio] is the numerical representation of its @checked attribute', function () {
      // var f = new FormChangeTracker({});
      assert.equal(1, FormChangeTracker.controlValue({type: 'radio', checked: true}));
      assert.equal(0, FormChangeTracker.controlValue({type: 'radio', checked: false}));
    });
    it('of a select or select-multiple is the concatenated string of the selectedOptions indexes', function () {
      // var f = new FormChangeTracker({});
      assert.equal('1', FormChangeTracker.controlValue({
        type: 'select',
        length: 3,
        options: [
            {selected: false},
            {selected: true},
            {selected: false},
        ]
      }));
      assert.equal('2-4', FormChangeTracker.controlValue({
        type: 'select-multiple',
        length: 5,
        options: [
            {selected: false},
            {selected: false},
            {selected: true},
            {selected: false},
            {selected: true},
        ]
      }));
    });
    it('of an input[type=checkbox] is the numerical representation of its @checked attribute', function () {
      // var f = new FormChangeTracker({});
      assert.equal(1, FormChangeTracker.controlValue({type: 'checkbox', checked: true}));
      assert.equal(0, FormChangeTracker.controlValue({type: 'checkbox', checked: false}));
      assert.equal(2, FormChangeTracker.controlValue({type: 'checkbox', indeterminate: true}));
    });
  });
});
