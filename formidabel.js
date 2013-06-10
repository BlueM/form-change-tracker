
/**
 * JavaScript library for enhancing HTML form user experience
 *
 * Tracks edits in XHTML forms in order to provide visual feedback of change items (by
 * changing labels' CSS classes) and enabling/disabling the reset button automatically.
 * The form's clean/dirty state can also be queries from outside, for instance for
 * getting the user's confirmation for abandoning a dirty form.
 * Additionally, using bindElement(), provides managing dependencies between form elements.
 *
 * @param selector    HTML element ID of the form to be observed.
 * @param classname   Optional CSS classname that should be added to any
 *                    <label> element whose form element has been changed.
 *
 * @requires jQuery v1.6 or later
 * @license http://www.opensource.org/licenses/bsd-license.php BSD License
 * @link    https://bitbucket.org/BlueM/formidabel
 */
function Formidabel(selector, classname) {

    "use strict";

    this.origVals    = {};
    this.chngVals    = {};
    this.form        = $(selector);
    this.resetButton = this.form.find('input[type="reset"]').eq(0);
    this.classname   = classname;

    var thisInstance = this;

    this.form.find('input, textarea, select').each(function() {
        var eventName = Formidabel.eventNameByType(this);
        var theName   = this.name;

        if (theName && eventName) {

            thisInstance.origVals[theName] = Formidabel.elementValue(this);

            $(this).bind(eventName, function(event) {
                var formItem = event.target;
                var currVal  = Formidabel.elementValue(formItem);
                var theName  = formItem.name;
                var theId    = $(this).attr('id');
                var labelElement = $('label[for="' + theId + '"]');
                if (labelElement.length) {
                    labelElement = labelElement[0];
                } else {
                    labelElement = null;
                }

                if (thisInstance.origVals[theName] !== currVal) {
                    // Element was changed
                    thisInstance.markElementAsChanged(theName, labelElement);
                } else {
                    // This element is unchanged >> check others
                    thisInstance.chngVals[theName] = false;
                    thisInstance.markFormAsDirty(thisInstance.formContainsEdits());
                    if (labelElement) {
                        $(labelElement).removeClass(classname);
                    }
                }
            });
        }
    });

    this.markFormAsDirty(false);
};

/**
 * Notifies change of an element to Formidabel. This method is usually not needed, but only in special
 * cases like having a JS WYSIWYG editor in the form, whose edit state cannot be tracked by Formidabel.
 *
 * @param nameValue    Value of form element's "name" attribute
 * @param labelElement Element's <labelElement> (HTML object, not jQuery object)
 */
Formidabel.prototype.markElementAsChanged = function (nameValue, labelElement) {
    "use strict";
    this.markFormAsDirty(true);
    this.chngVals[nameValue] = true;
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
        $('label').each(function () {
            $(this).removeClass(cssClass);
        });
    }
};

/**
 * Returns whether any observed elements were changed
 *
 * @return true, if at least 1 element was changed, false otherwise
 * @type {Boolean}
 */
Formidabel.prototype.formContainsEdits = function () {
    "use strict";
    for (var theName in this.origVals) {
        if (this.chngVals[theName]) {
            return true; // This one changed
        }
    }
    return false;
};

/**
 * Returns the name of the event to be observed based on the element type
 *
 * @param element Element type
 *
 * @return {String} String such as "click" or "keyup"
 */
Formidabel.eventNameByType = function (element) {
    "use strict";
    if (!element ||
        !element.type) {
        return '';
    }
    switch (element.type.toLowerCase()) {
        case 'text':
        case 'password':
        case 'textarea':
            return 'keyup';
        case 'checkbox':
        case 'radio':
            return 'click';
        case 'file':
        case 'select':
        case 'select-one':
        case 'select-multiple':
            return'change';
    }
    return '';
}

/**
 * Binds an element's visibility or "disabled" status to another input
 * element or triggers a function that may operate on that element. To ease
 * setting the inital state, upon page loading the actions is performed as
 * well. Optional 4th argument: A callback which will be executed to
 * determine whether the source element's status/value evaluates to true or
 * false. If not given, Formidabel.boolValue() will be used.
 *
 * @param target  Selector for the target element
 * @param source  Selector for the source element
 * @param type    One of the strings "enable", "disable", "show"
 *                or "hide" or a function that will called with the
 *                controlled elements as 1st and the controlling
 *                element as 2nd argument. In case of some other
 *                argument, an an alert() will be displayed.
 */
Formidabel.bindElement = function (target, source, type) {

    "use strict";

    source = $(source);
    target = $(target);

    var eventName = Formidabel.eventNameByType(source.get(0));

    if (!eventName) {
        alert('Unable to bind ' + source);
        return;
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
                if (val) {
                    target.removeAttr('disabled');
                } else {
                    target.attr('disabled', 'disabled');
                }
                break;
            case 'disable':
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
    source.trigger('load'); // Trigger faked event
};

/**
 * Returns whether the contents/state of the given element evaluates
 * to true, i.e.: contains value, is checked, has selection etc.
 *
 * @param elmnt     HTML form element (not jQuery element)
 * @return {String} In case of radio buttons, returns the value of the selected
 *                  radio button. For a checkbox, it returns either an empty string
 *                  (not checked) or checkbox's value. For a multiple-select, it
 *                  will return the serialized currently selected value. For other
 *                  types, will return whatever is returned from jQuery's .val().
 * @todo Inline
 */
Formidabel.boolValue = function (elmnt) {
    "use strict";
    if (elmnt.type === "radio" || elmnt.type === "checkbox") {
        return Boolean($(elmnt).prop('checked'));
    }
    if (elmnt.type === "select-multiple") {
        return Boolean($(elmnt).val());
    }
    return Boolean($(elmnt).val());
};

/**
 * Returns the value of the given element
 *
 * @param elmnt     HTML form element (not jQuery element)
 * @return {String} In case of radio buttons, returns the value of the
 *                  selected radio button. For a checkbox, it returns
 *                  either an empty string (not checked) or checkbox's
 *                  value. For a multiple-select, it will return the
 *                  serialized currently selected value. For other types,
 *                  will return whatever is returned from jQuery's .val().
 */
Formidabel.elementValue = function (elmnt) {
    "use strict";
    if (elmnt.type === "radio") {
        return $('input:radio[name=' + elmnt.name + ']:checked').val();
    }
    if (elmnt.type === "checkbox") {
        return Boolean($(elmnt).prop('checked'));
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
