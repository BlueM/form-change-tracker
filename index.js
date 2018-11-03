
export default class FormChangeTracker {

    /**
     * @param options Optional options object, with supported properties "element", "selector", "classname", "confirm"
     */
    constructor(options) {
        options = this.getOptions(options);

        if (options.element) {
            this.form = options.element;
        } else {
            this.form = document.querySelector(options.selector);
            if (!this.form) {
                throw new Error(`Selector does not match: ${options.selector}`);
            }
        }

        if ('form' !== this.form.tagName.toLowerCase()) {
            throw new Error(
                'The selector is expected to select a <form> element, but actually is a ' +
                this.form[0].tagName.toLowerCase() + ' element'
            );
        }

        this.observedControls = [];
        this.origVals = {};
        this.chngVals = {};
        this.callback = options.callback;
        this.resetButton = this.form.querySelector('input[type="reset"]');
        this.classname = options.classname;

        if (this.resetButton) {
            this.resetButton.addEventListener(
                'click',
                (e) => {
                    if (this.isDirty()) {
                        e.preventDefault();
                        options.confirm(() => {
                            this.form.reset();
                            this.markFormAsDirty(false);
                        });
                    }
                }
            );
        }

        this.eventListener = this.handleEvent.bind(this);

        const controls = this.form.querySelectorAll('input, textarea, select');
        for (let i = 0, ii = controls.length; i < ii; i++) {
            const control = controls[i];
            const eventName = this.eventNameByType(control);
            if (control.name && eventName) {
                this.origVals[control.name] = FormChangeTracker.controlValue(control);
                control.addEventListener(eventName, this.eventListener);
                this.observedControls.push([control, eventName]);
            }
        }

        this.markFormAsDirty(false);
    }

    /**
     * Stops observing events of all controls currently observed
     */
    unbind() {
        this.observedControls.forEach(observed => observed[0].removeEventListener(observed[1], this.eventListener));
        this.observedControls = [];
    }

    /**
     * To be invoked when the event occurred on the observed control
     *
     * Will check if control's value was changed from its original value or
     * changed back to its original value, and performs the necessary actions.
     *
     * @param event
     */
    handleEvent(event) {
        const control = event.target;
        const labelElement = FormChangeTracker.findLabel(control);
        let i, ii, label, radioButtons;

        if ('radio' === control.type) {
            // Reset other radio buttons in this form having the same name
            radioButtons = this.form.querySelectorAll('input[type=radio][name=' + control.name + ']');
            for (i = 0, ii = radioButtons.length; i < ii; i++) {
                radioButtons[i].classList.remove(this.classname);
                label = FormChangeTracker.findLabel(radioButtons[i]);
                if (label) {
                    label.classList.remove(this.classname);
                }
            }
        }

        let changed = true;
        if (this.origVals[control.name] === FormChangeTracker.controlValue(control)) {
            // This control is unchanged
            this.chngVals[control.name] = false;
            this.markFormAsDirty(this.isDirty());
            control.classList.remove(this.classname);
            changed = false;
            if (labelElement) {
                labelElement.classList.remove(this.classname);
            }
        } else {
            // Control was changed
            this.markControlAsChanged(control, labelElement);
        }

        if (this.callback) {
            this.callback(control, changed);
        }
    }

    /**
     * Method that should be called with false as argument, if you reset the form
     *
     * @param isDirty
     */
    markFormAsDirty(isDirty) {
        if (isDirty) {
            if (this.resetButton) {
                this.resetButton.removeAttribute('disabled');
            }
        } else {
            if (this.resetButton) {
                this.resetButton.setAttribute('disabled', 'disabled');
            }
            this.chngVals = {};
            const labels = this.form.querySelectorAll('label');
            for (let i = 0, ii = labels.length; i < ii; i++) {
                labels[i].classList.remove(this.classname)
            }
        }
    }

    /**
     * Returns whether any observed controls were changed
     *
     * @returns {boolean}
     */
    isDirty() {
        for (let theName in this.origVals) {
            if (this.origVals.hasOwnProperty(theName)) {
                if (this.chngVals[theName]) {
                    return true; // This one changed
                }
            }
        }
        return false;
    }

    /**
     * Notifies change of a control to FormChangeTracker
     *
     * This method is usually not needed, but only in special cases like having a
     * JS WYSIWYG editor in the form, whose edit state cannot be tracked by FormChangeTracker.
     *
     * @param control
     * @param labelElement
     */
    markControlAsChanged(control, labelElement) {
        this.markFormAsDirty(true);
        this.chngVals[control.name] = true;

        control.classList.add(this.classname);

        if (labelElement) {
            labelElement.classList.add(this.classname);
        }
    }

    /**
     * @param options
     * @returns {{}}
     */
    getOptions(options) {
        if (options && 'object' !== typeof options) {
            console.warn('Options must be given as an object. Will fall back to defaults.');
            options = {};
        }

        options = options || {};
        options.selector = options.selector || 'form';
        options.classname = options.classname || 'control-changed';

        ['confirm', 'callback'].forEach(
            (name) => {
                if (options[name] &&
                    'function' !== typeof options[name]) {
                    console.warn(`Invalid value given: options.${name} must be a function.`);
                    options[name] = null;
                }
            }
        );

        if (!options.confirm) {
            options.confirm = function (callback) {
                if (confirm('Are you sure you want to reset the form and lose unsaved changes?')) {
                    callback();
                }
            };
        }

        return options;
    }

    /**
     * Returns the name of the event to be observed based on the control type
     *
     * @param control
     *
     * @returns {String|null}
     */
    eventNameByType(control) {
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
            case 'range':
                if (-1 !== navigator.userAgent.indexOf('MSIE')) {
                    // On IE11, "range" will trigger "change", but not "input"
                    return 'change';
                }
                return 'input';
            case 'hidden':
            case 'reset':
            case 'submit':
                // Ignore
                return null;
            default:
                console.warn(`Unsupported type: “${control.type}”`);
                return null;
        }
    }

    /**
     * Returns a scalar representation of the control suitable for tracking value changes
     *
     * @param control
     * @returns {*}
     */
    static controlValue(control) {
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
            const indexes = [];
            for (let i = 0, ii = control.length; i < ii; i++) {
                // Workaround due to IE11's missing support for select.selectedOptions
                if (control.options[i].selected) {
                    indexes.push(i);
                }
            }
            return indexes.join('-');
        }
        return control.value;
    }

    /**
     * Returns a the <label> element corresponding to the given
     * control, or null, if there is none
     *
     * @param control
     * @returns {Element|null}
     */
    static findLabel(control) {
        const id = control.getAttribute('id');
        if (id) {
            return document.querySelector('label[for="' + id + '"]');
        }
        return null;
    }
}
