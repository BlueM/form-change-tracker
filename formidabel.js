/*! Formidabel | (c) 2009-2014 Carsten Bluem | https://bitbucket.org/BlueM/formidabel */

/**
 * JavaScript library for enhancing HTML form user experience
 *
 * Tracks edits in XHTML forms in order to provide visual feedback of change items (by
 * changing labels' CSS classes) and enabling/disabling the reset button automatically.
 * The form's clean/dirty state can also be queries from outside, for instance for
 * getting the user's confirmation for abandoning a dirty form.
 * Additionally, using bindElement(), provides managing dependencies between form elements.
 *
 * @param selector      Either selector for the form to be observed or a jQuery object,
 *                      which is expected to
 * @param [classname]   CSS classname that should be added to any <label> element whose
 *                      form element has been changed. If not given, "changed" is used as
 *                      default value.
 * @param noAutoConfirm Pass true to suppress the automatic reset confirmation
 *                      Formidabel will display when resetting a dirty form.
 *
 * @requires jQuery v1.6 or later
 * @license http://www.opensource.org/licenses/bsd-license.php BSD License
 */
function Formidabel(selector, classname, noAutoConfirm) {

    "use strict";

    this.form = $(selector);

    if (this.form.length !== 1) {
        throw new Error(
            'The selector must select 1 element, but selects ' + this.form.length
        );
    }

    if ('form' !== this.form[0].tagName.toLowerCase()) {
        throw new Error(
            'The selector is expected to select a <form> element, but selected <' +
            this.form[0].tagName.toLowerCase() + '>'
        );
    }

    this.origVals    = {};
    this.chngVals    = {};
    this.resetButton = this.form.find('input[type="reset"]').eq(0);
    this.classname   = classname || 'changed';
    var thisInstance = this;

    if (!noAutoConfirm) {
        this.resetButton.on(
            'click',
            function(e) {
                if (!thisInstance.isDirty() || confirm(Formidabel.confirmString())) {
                    thisInstance.form.get(0).reset();
                    thisInstance.markFormAsDirty(false);
                } else {
                    e.preventDefault();
                }
            }
        );
    }

    this.form.find('input, textarea, select').each(function() {
        var eventName = Formidabel.eventNameByType(this);
        var theName   = this.name;
        if (theName && eventName) {
            thisInstance.origVals[theName] = thisInstance.elementValue(this);
            $(this).bind(eventName, function() {
                thisInstance.handleEvent(this);
            });
        }
    });

    this.markFormAsDirty(false);
}

/**
 * To be invoked when the event occurred on the element. Will check if the element's
 * value was changed from its original value or changed back to its original value, and
 * perform the necessary actions.
 *
 * @param element The element on which the event was observed
 */
Formidabel.prototype.handleEvent = function (element) {

    var theClassname = this.classname;
    if (element.type == 'radio') {
        $(element.form).find('input:radio[name=' + element.name + ']').each(
            function () {
                Formidabel.findLabel(this).removeClass(theClassname);
            }
        );
    }

    var labelElement = Formidabel.findLabel(element);

    if (this.origVals[element.name] !== this.elementValue(element)) {
        // Element was changed
        this.markElementAsChanged(element, labelElement);
    } else {
        // This element is unchanged >> check others
        this.chngVals[element.name] = false;
        this.markFormAsDirty(this.isDirty());
        if (labelElement) {
            $(labelElement).removeClass(this.classname);
        }
    }

};

/**
 * Notifies change of an element to Formidabel. This method is usually not needed, but
 * only in special cases like having a JS WYSIWYG editor in the form, whose edit state
 * cannot be tracked by Formidabel.
 *
 * @param element      The form element
 * @param labelElement Element's <labelElement> (HTML object, not jQuery object)
 */
Formidabel.prototype.markElementAsChanged = function (element, labelElement) {
    "use strict";
    this.markFormAsDirty(true);
    this.chngVals[element.name] = true;
    if (labelElement) {
        $(labelElement).addClass(this.classname);
    }
};

/**
 * Method that should be called with false as argument, if you reset the form
 *
 * @param isDirty
 */
Formidabel.prototype.markFormAsDirty = function (isDirty) {
    "use strict";
    if (isDirty) {
        this.resetButton.removeAttr('disabled');
    } else {
        this.resetButton.attr('disabled', 'disabled');
        this.chngVals = {};
        var cssClass  = this.classname;
        $(this.form).find('label').each(function () {
            $(this).removeClass(cssClass);
        });
    }
};

/**
 * Alias for isDirty()
 *
 * @return true, if at least 1 element was changed, false otherwise
 * @deprecated Will be replaced by isDirty()
 * @type {Boolean}
 */
Formidabel.prototype.formContainsEdits = function () {
    return this.isDirty();
};

/**
 * Returns whether any observed elements were changed
 *
 * @return true, if at least 1 element was changed, false otherwise
 * @type {Boolean}
 */
Formidabel.prototype.isDirty = function () {
    "use strict";
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
 * Returns the value of the given element
 *
 * @param elmnt     HTML form element (not jQuery element)
 * @return {String} In case of radio buttons, returns the value of the selected radio
 *                  button. For a checkbox, returns either an empty string (not checked)
 *                  or the checkbox's value. For a multiple-select, it will return the
 *                  serialized currently selected value. For other types, will return
 *                  whatever is returned from jQuery's .val() method.
 */
Formidabel.prototype.elementValue = function (elmnt) {
    "use strict";
    if (elmnt.type === "radio") {
        var checked = $(elmnt.form).find('input:radio[name=' + elmnt.name + ']:checked');
        return checked.length ? checked.eq(0).val() : '';
    }
    if (elmnt.type === "checkbox") {
        return $(elmnt).prop('checked') ? $(elmnt).val() : '';
    }
    if (elmnt.type === "select-multiple") {
        var value = $(elmnt).val();
        if (value) {
            return jQuery.param($(elmnt).serializeArray());
        }
        return '';
    }
    return $(elmnt).val();
};

/**
 * Returns the name of the event to be observed based on the element type
 *
 * @param element The element
 *
 * @return {String} String such as "click" or "keyup". If an unknown element type
 *                  is encountered, returns an empty string.
 */
Formidabel.eventNameByType = function (element) {
    "use strict";
    switch (element.type) {
        case 'email':
        case 'number':
        case 'password':
        case 'search':
        case 'tel':
        case 'text':
        case 'textarea':
        case 'url':
            return 'keyup';
        case 'checkbox':
        case 'radio':
            return 'click';
        case 'file':
        case 'select':
        case 'select-one':
        case 'select-multiple':
            return'change';
        default:
            return '';
    }
};

/**
 * Binds an element's visibility or "disabled" status to another input element or
 * triggers a function that may operate on that element.
 *
 * To set the initial state and keep a consistent state after a reset, binding will be
 * performed upon page loading and after a "onreset" event on the form.
 * An optional 4th argument can be given, which is expected to be a callback which will
 * be executed to determine whether the source element's status/value evaluates to true
 * or false. If not given, Formidabel.boolValue() will be used.
 *
 * @param target  Selector for the target element(s)
 * @param source  Selector for the source element. If the selector matches multiple
 *                elements, only the first one will be used.
 * @param type    One of the strings "enable", "enable!", "disable", "disable!" (= when
 *                with exclamation mark, will also clear the element when it's disabled),
 *                "show" or "hide" or a function that will be called with the controlled
 *                elements as 1st and the controlling element as 2nd argument. In case of
 *                some other argument, an alert() will be displayed.
 *
 * @deprecated Will be removed
 */
Formidabel.bindElement = function (target, source, type) {

    "use strict";

    source = $(source);
    target = $(target);

    var eventName = Formidabel.eventNameByType(source.get(0));

    if (!eventName) {
        throw new Error('Unable to bind ' + source);
    }

    var callback = arguments.length == 4 ? arguments[3] : null;

    var act = function (e) {
        var val = null;
        if (callback) {
            val = callback();
        } else {
            val = Formidabel.boolValue(this);
        }
        switch (e.data.type) {
            case 'enable':
            case 'enable!':
                if (val) {
                    target.removeAttr('disabled');
                } else {
                    target.attr('disabled', 'disabled');
                }
                break;
            case 'disable':
            case 'disable!':
                if (val) {
                    target.attr('disabled', 'disabled');
                } else {
                    target.removeAttr('disabled');
                }
                break;
            case 'show':
                if (val) {
                    target.show();
                } else {
                    target.hide();
                }
                break;
            case 'hide':
                if (val) {
                    target.hide();
                } else {
                    target.show();
                }
                break;
            default:
                if ('function' == typeof e.data.type) {
                    e.data.type(target, source);
                } else {
                    alert('Unknown operation type "' + e.data.type + '"');
                }
        }
    };

    source.bind('load ' + eventName, {target: target, type: type}, act);

    var onResetAction = function() {
        source.trigger('load');
    };

    source.closest('form').on(
        'reset',
        function () {
            window.setTimeout(onResetAction, 100);
        }
    );

    source.trigger('load'); // Trigger faked event
};

/**
 * Returns whether the contents/state of the given element evaluates
 * to true, i.e.: contains value, is checked, has selection etc.
 *
 * @param elmnt      HTML form element (not jQuery element)
 * @return {Boolean} For radio buttons and checkboxes, returns a Boolean depending on
 *                   the "checked" state. For other types, will rely on jQuery's .val()
 *                   method, typecasted to a Boolean.
 */
Formidabel.boolValue = function (elmnt) {
    "use strict";
    if (elmnt.type === 'radio') {
        return Boolean($(elmnt).prop('checked'));
    }
    if (elmnt.type === 'checkbox') {
        return Boolean($(elmnt).prop('checked'));
    }
    return Boolean($(elmnt).val());
};

/**
 * Returns a string asking to confirm discarding changes in the form
 *
 * The string depends on the browser's language. Currentl supported: "de" and "en",
 * with English being the fallback language.
 *
 * @returns {string}
 */
Formidabel.confirmString = function() {
    var lang = navigator.language;
    if (!lang) {
        lang = window.clientInformation.browserLanguage; // IE
    }
    switch (lang.substr(0, 2)) {
        case 'de':
            return 'Sind Sie sicher, dass Sie das Formular zurücksetzen möchten?\nDie ungesicherten Änderungen werden dabei verloren gehen.\n';
        default:
            return 'Are you sure you want to reset the form?\nUnsaved changes will be lost.\n';
    }
};

/**
 * Returns a jQuery element, which is either empty or contains the <label> whose @for
 * value matches the given element's @id value
 *
 * @param element The element
 * @returns jQuery
 */
Formidabel.findLabel = function (element) {
    var id = element.getAttribute('id');
    if (id) {
        return $('label[for="' + id + '"]');
    }
    return $();
};
