# Overview

`form-change-tracker` is a small (roughly 1.5 kB gzipped), dependency-free JavaScript browser library for keeping track of the state (pristine vs. changed) of controls in a DOM-based form.

Using this state (i.e.: via CSS class names added or removed from controls and their associated `<label>` elements), you can provide visual feedback regarding which controls have changed and which have not. Of course, it will detect if an element is first changed and then changed back to its initial value. Additionally, `form-change-tracker` automatically manages disabling or enabling a reset button, if there is one in the form. 

This library is probably not what you need in a project where you already are using some SPA framework (React, Angular, Vue or the like), but is a nice addition for “classical” mainly server-driven applications.

The library comes in UMD flavour, so you can …

* use it directly (`<script>` tag in the browser)
* use it via the AMD module format (Require.js)
* use it via the CommonJS module format (Node.js)

Currently, this library has a version number < 1, so it will probably change. Specifically, I intend to extract the control-tracking part and make the action(s) to perform when change is observed extendable.

## Browser support

This library will work (at least) on:

* Google Chrome Desktop and Android (no particularly new version required)
* Firefox Desktop and Android (no particularly new version required)
* Safari Desktop and iOS (no particularly new version required)
* Microsoft IE11
* Microsoft Edge (no particularly new version required)

## Historical background

`form-change-tracker` is the rewrite of a library called “Formidabel” (an old-fashioned German word which means something like “excellent”), which basically did the same, but required jQuery. Formidabel itself was the port of an older (started circa 2009), Prototype-based codebase from Prototype to jQuery.

As I hardly use jQuery anymore – due to ES 2015, Fetch API etc. –, removing the dependency on jQuery was only natural. As I chose to make it available via npm, the name had to change from “Formidabel” to something less ambiguous, and so `form-change-tracker` was born.


# Usage

## Installation

Depending on your favourite package manager, run either of:
* `npm install form-change-tracker`
* `yarn add form-change-tracker`. 

Then, do one of the following.

### “Classical” approach
Add a `<script>` tag with the proper path in your project (HTML template or wherever appropriate), then call the constructor function:

    <script src="form-change-tracker/index.js"></script>
    <script>
    // In the next line, you don’t even need the variable.
    var f = new Formidabel();
    </script>

### AMD (Require.js)
Somthing like this should do:

    requirejs(["form-change-tracker"], function (FormChangeTracker) {
      var f = new FormChangeTracker();
    });

### CommonJS (Node.js)
Loading

    #!javascript
    var FormChangeTracker = require('form-change-tracker');
    var f = new FormChangeTracker(); // Probably does not make sense in a plain JS context
    

## Usage

The most simple invocation is:

    new FormChangeTracker();

This will invoke `FormChangeTracker` with the default options, which is equivalent to … 

    new FormChangeTracker({
      selector: 'form',
      classname: 'control-changed',
      confirm: function (callback) {
        if (confirm('Are you sure you want to reset the form and lose unsaved changes?')) {
          callback();
        }
      };
    });

The options are:

* `selector`: A CSS selector (compatible with `document.querySelector`). The first element that matches is used.
* `classname`: A CSS class name to add to both the control and the corresponding label
* `confirm`: A confirmation function which will be invoked if the reset button (if there is one in the form) is clicked and the form is dirty. This must be a function which is expected to take a function as argument, which should be invoked if the user confirms.

The `confirm` property is built this way to make it easy to use some external function or library for this. For instance, this would be the code for integrating SweetAlert:

    var f = new Formidabel({
      selector: 'form',
      confirm: function(formidabelCallback) {
        swal({
            title:        "Are you sure?",
            text:         "Your unsaved changes will be lost.",
            type:         "warning",
            showCancelButton:   true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText:  "Go ahead",
            closeOnConfirm:   true
          },
          function () {
            console.info('Reset');
            formidabelCallback();
          });
      }
    });


# Compatiblity

Not compatible with IE11 or below.

# Tests

Run ``npm test``


# Version History

Nothing yet, as this is the first release with the new name.
