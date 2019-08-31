# Overview

`form-change-tracker` is a small (less than 2 kB gzipped), dependency-free JavaScript browser library for keeping track of the state (pristine vs. changed) of controls in a DOM-based form.

Using this state (i.e.: via CSS class names added or removed from controls and their associated `<label>` elements), you can provide visual feedback regarding which controls have changed and which have not. Of course, it will detect if an element is first changed and then changed back to its initial value. Additionally, `form-change-tracker` automatically manages disabling or enabling a reset button, if there is one in the form, and will call a callback, if you like.

This library is probably not what you need in a project where you already are using some SPA framework (React, Angular, Vue or the like), but is a nice addition for “classical” mainly server-side rendered applications.


## Browser support

This library will work (at least) on:

* Google Chrome Desktop and Android (no particularly new version required)
* Firefox Desktop and Android (no particularly new version required)
* Safari Desktop and iOS (no particularly new version required)
* Microsoft Edge (no particularly new version required)
* Microsoft IE11


# How to set up and use

## Installation

Depending on your favorite package manager, run either of:
* `npm install @bluem/form-change-tracker`
* `yarn add @bluem/form-change-tracker`

## Importing

The library is an ES6 class, so the way to use it depends on your tooling and the browsers you want to support.

### With Webpack
First, write your code using an ES6 import:

    import FormChangeTracker from '@bluem/form-change-tracker';

Then, assuming you have Webpack installed locally in your project:

`./node_modules/.bin/webpack -p demo.js --output dist/webpack-bundle.js`

Then, add `<script src="dist/webpack-bundle.js"></script>` to your HTML.

The above command would be sufficient, but of course, you can use a `webpack.config.js` configuration file.


### With Parcel
First, write your code using an ES6 import:

    import FormChangeTracker from '@bluem/form-change-tracker';

Then, assuming you have Parcel installed locally in your project:

`./node_modules/.bin/parcel build --public-url /dist demo.js` 

This will write generated files to directory “dist” in the working directory.


## Usage

The most simple invocation is:

```js
new FormChangeTracker();
```
This will invoke `FormChangeTracker` with the default options, which is equivalent to … 

```js
new FormChangeTracker({
  selector: 'form',
  classname: 'control-changed',
  confirm: function (callback) {
    if (confirm('Are you sure you want to reset the form and lose unsaved changes?')) {
      callback();
    }
  }
});
```

The options are:

* `selector`: A CSS selector (compatible with `document.querySelector`). The first element that matches is used.
* `element`: Instead of a selector, you can directly pass an element (which must be a `<form>` element)
* `classname`: A CSS class name to add to both the control and the corresponding label
* `callback`: A function which will be called when an control’s state changes. The function will be given two arguments: first, the control, second a Boolean indicating if the control is now in a dirty/changed state or not.
* `confirm`: A confirmation function which will be invoked if the reset button (if there is one in the form) is clicked and the form is dirty. This must be a function which is expected to take a function as argument, which should be invoked if the user confirms.

The `confirm` property is built this way to make it easy to use some external function or library for this. For instance, this would be the code for integrating SweetAlert:

```js
new FormChangeTracker({
  confirm: function(confirmationCallback) {
    swal({
        title: "Are you sure?",
        text: "Your unsaved changes will be lost.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Go ahead",
        closeOnConfirm: true
      },
      function () {
        console.info('Reset');
        confirmationCallback();
      });
  }
});
```


# Tests
As the library is simple, highly browser-oriented and easy to test manually, I chose to remove the tests I had for the 0.* versions. Which means that there are no automated tests of any kind.


# Version History

## 1.2 (2019-08-31)
- Gracefully handle a non-matching selector passed as option, as this seems more appropriate in typical usage scenarios. (Note: in the unlikely case that client code relied on passing in a non-matching selector and expect the library to throw an error, this is a breaking change.)
- Fix module loading

## 1.1 (2019-08-25)
- Replace code for getting controls’ event names with npm module `@bluem/form-control-event-name`
- Fix bug regarding missing quoting of radiobutton attributes

## 1.0 (2018-11-03)
- Migrate to a native ES6 class
- Add option `callback`
- Remove tests
- Improve Readme

# 0.5.1 (2017-06-21)
- Vanilla JS rewrite of legacy jQuery code (which was a rewrite of legacy Prototype.js code)
