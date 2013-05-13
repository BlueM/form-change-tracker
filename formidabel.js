/**
 * FORMIDABEL
 * Class for tracking edits in XHTML forms. It will automatically enable
 * and disable the reset button (should be disabled initially in the
 * XHTML form) and optionally add CSS classes to labels of changed
 * elements. Additionally, using bindElement(), provides managing
 * dependencies between form elements.
 *
 * @requires jQuery v1.3 or later.
 * @author Carsten Bluem <carsten@bluem.net>
 */
var Formidabel = new function() {

    this.origVals    = {};
    this.chngVals    = {};
    this.inited      = false;
    this.resetButton = null;
    this.labelPrefix = '';

    /**
	 * Starts tracking of changes in forms.
	 * Usage: below your form, call Formidabel.init(arg1, arg2, arg3)
     *
	 * @param {String} formid HTML element ID of the form to be observed.
	 * @param {String} classname Optional CSS classname that should be added to any
	 *                           <label> element whose form element has been changed.
	 * @param {String} labelPrefix Optional string that's used as prefix for (all!)
	 *                             element names to construct the element IDs (i.e.: if
	 *                             the element name is "foo" and its ID is "form_foo",
	 *                             set arg3 to "foo_").
	 */
	this.init = function(formid, classname, labelPrefix) {

		this.form = $('#' + formid);
		this.resetButton = this.form.find('input[type="reset"]').eq(0);
		this.classname = classname;
		this.inited = true;

        if (labelPrefix) {
            this.labelPrefix = labelPrefix;
        }

		this.form.find('input, textarea, select').each(function() {
			var eventName = Formidabel.eventNameByType($(this).attr('type'));
			var theName = $(this).attr('name');

			if (theName && eventName) {
				Formidabel.origVals[theName] = Formidabel.elementValue(this);
				$(this).bind(eventName, function(event) {
					var formItem = event.target;
					var currVal = Formidabel.elementValue(formItem);
					var theName = formItem.name;

					var labelElement = $('label[for="' + Formidabel.labelPrefix + theName.replace(/\[\]/, '') + '"]');
					if (labelElement.length) {
						labelElement = labelElement[0];
					} else {
						labelElement = null;
					}

					if (Formidabel.origVals[theName] != currVal) {
						// Element was changed
						Formidabel.markElementAsChanged(theName, labelElement);
					} else {
						// This element is unchanged >> check others
						Formidabel.chngVals[theName] = false;
						Formidabel.markFormAsDirty(Formidabel.formContainsEdits());
						if (labelElement) {
							$(labelElement).removeClass(Formidabel.classname);
						}
					}
				});
			}
		});

		Formidabel.markFormAsDirty(false);
		try {
			Formidabel.form.find(':input').eq(0).focus();
		} catch(e) {
			window.setTimeout('Formidabel.form.elements[0].focus()', 100);
		}
	};

	/**
	 * Notifies change of an element to Formidabel
	 * @param {String} ename Value of form element's "name" attribute
	 * @param {Object} label Element's <label> (HTML object, not jQuery object)
	 */
	this.markElementAsChanged = function(ename, label) {
		Formidabel.markFormAsDirty(true);
		Formidabel.chngVals[ename] = true;
		if (label) {
			$(label).addClass(Formidabel.classname);
		}
	};

	/**
	 * Returns the value of the given element
	 * @param {Object} elmnt HTML form element (not jQuery element)
	 * @return {String} In case of radio buttons, returns the value of the
	 *                  selected radio button. For a checkbox, it returns
	 *                  either an empty string (not checked) or checkbox's
	 *                  value. For a multiple-select, it will return the
	 *                  serialized currently selected value. For other types,
	 *                  will return whatever is returned from jQuery's .val().
	 */
	this.elementValue = function(elmnt) {
		if (elmnt.type === "radio") {
			return $('input:radio[name=' + elmnt.name + ']:checked').val();
		}
		if (elmnt.type === "checkbox") {
			return $(elmnt).attr('checked') ? $(elmnt).val() : '';
		}
		if (elmnt.type === "select-multiple") {
			if ($(elmnt).val()) {
				return jQuery.param($(elmnt).val());
			}
			return '';
		}
		return $(elmnt).val();
	};

	/**
	 * Returns whether the contents / state of the given element evaluates
	 * to true, i.e.: contains value, is checked, has selection etc.
	 * @param elmnt     HTML form element (not jQuery element)
	 * @return {String} In case of radio buttons, returns the value of the selected
	 *                  radio button. For a checkbox, it returns either an empty string
	 *                  (not checked) or checkbox's value. For a multiple-select, it
	 *                  will return the serialized currently selected value. For other
	 *                  types, will return whatever is returned from jQuery's .val().
     */
    this.boolValue = function(elmnt) {
		if (elmnt.type === "radio" || elmnt.type === "checkbox") {
			return Boolean($(elmnt).attr('checked'));
		}
		if (elmnt.type === "select-multiple") {
			return Boolean($(elmnt).val());
		}
		return Boolean($(elmnt).val());
	};

	/**
	 * Method that should be called with false as argument, if you reset the form
     *
     * @param boolVal
     */
    this.markFormAsDirty = function(boolVal) {
		if (boolVal) {
			this.resetButton.removeAttr('disabled');
		} else {
			this.resetButton.attr('disabled', 'disabled');
            this.chngVals = {};
			$('label').each(function() {
				$(this).removeClass(Formidabel.classname);
			});
		}
	};

	/**
	 * Returns whether any observed elements were changed
	 * @return true, if at least 1 element was changed, false otherwise
	 * @type {Boolean}
	 */
	this.formContainsEdits = function() {
		if (this.inited) {
			for (var theName in this.origVals) {
				if (this.chngVals[theName]) {
					return true; // This one changed
				}
			}
		}
		return false;
	};

	/**
	 * Binds an element's visibility or "disabled" status to another input
	 * element or triggers a function that may operate on that element. To
	 * ease setting the inital state, upon page loading the actions is
	 * performed as well!
	 * @param target Either HTML element ID of the element to be
	 *               controlled, or the jQuery object for that element.
	 * @param source Either HTML element ID of the controlling
	 *               element, or the jQuery object for that element.
	 * @param type   One of the strings "enable", "disable", "show"
	 *               or "hide" or a function that will called with the
	 *               controlled elements as 1st and the controlling
	 *               element as 2nd argument. In case of some other
	 *               argument, an an alert() will be displayed.
	 */
	this.bindElement = function(target, source, type) {

		if ('string' == typeof source) {
			source = $('#' + source);
		}

		if ('string' == typeof target) {
			target = $('#' + target);
		}

		var eventName = Formidabel.eventNameByType(source.attr('type'));

		if (!eventName) {
			alert('Unable to bind ' + source.attr('type'));
		}

		var act = function(e) {
			var val = Formidabel.boolValue(this);
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
	 * Returns the name of the event to be observed based on the element type
     *
	 * @param {String} type Element type
	 * @return {String} String such as "click" or "keyup"
	 */
	this.eventNameByType = function(type) {
		switch (type) {
			case 'textarea':
			case 'text':
			case 'password':
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
	};
};
