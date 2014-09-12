# Overview

Formidabel (an old-fashioned German word which means something like “excellent”) is a simple and small (between 4 and 5 KB when minified, depending on the minifier) JavaScript library for enhancing HTML form user experience. *It is not to be confused with a Node.js module called “Formidable” (which I did not know of when I wrote the first version of Formidabel a long time ago).*

Formidabel tracks edits in HTML forms in order to provide visual feedback of changed items (by changing elements’ labels’ CSS classes) and enabling/disabling the reset button automatically. The form’s clean/dirty state can also be queried from outside, for instance for getting the user’s confirmation for abandoning a dirty form. Of course it will also detect if an element is first changed and then changed back to its initial value (which will cause Formidabel to mark the element as clean again).

## Dependencies & Compatibility
Formidabel requires jQuery 1.6 or later. Initially, it was based on Prototype (somewhen around 2009), but that version hasn’t been updated for a long time.
It should run on any browser which is supported by jQuery 1.6.

## Usage
First of all, of course you have to make sure that Formidabel is loaded:
```
#!html
<script src="/path/to/formidabel/formidabel.js"></script>
```

Then, all you have to do is something like this in your JS code:

```
#!javascript
new Formidabel('#my-form');
```

The example assumes you have a form with `id` attribute value `my-form`. Of course, you can use the usual jQuery selectors here or use a HMTML5 `data-*` attribute such as `data-formidabel="true"` and a selector which checks for the existence of that attribute.

As soon as you have called the constructor function, Formidabel will observe changes (depending on the element type, that is keyup, change, click, …) to any of the form elements. If an element is changed, its `<label>` (which must, of course, be bound to the element using the `for` attribute) will get an additional CSS class (default: “changed”, but you can set a different class name as 2nd argument to the constructor) and the form’s reset button will be enabled, if it hadn’t been before. Likewise, when the user reverts the change, the CSS class is removed and the reset button is disabled (if there are no other changes). All that happens not only on blur (when leaving a text field), but immediately.

As a bonus, Formidabel will not only automatically disable or enable the reset button (if there is one in the form), but, when it is clicked, will aks for confirmation to reset a dirty form. If you do not want this, pass true as third argument to the constructor function.

Using Formidabel’s `isDirty()` method, you could also do something like the following
```
#!html
<a href="/somewhere-else/" class="cancel">Cancel</a>

</form>

<script>
var formidabel = new Formidabel('#mainform');

$('a.cancel').click(
   function(e) {
      if (formidabel.isDirty()) {
         if (!confirm('Are you sure you want to discard the edits?')) {
            e.preventDefault();
            return;
         }
      }
   }
);
</script>
```
In other words: there’s a cancel link, and when clicked and the form is dirty, the user will have to confirm losing the changes.

## bindElement()
**As of Formidabel 1.2, bindElement() is deprecated**
It is not uncommon that in a form, one element should be displayed/hidden/enabled/disabled/… depending on the state of another element. For instance, in a shop, you might want to hide (or disable) the form elements for the delivery address as long as a “Ship order to invoice address” checkbox is checked and you will want to show (or enable) them when the checkbox is unchecked.

Tasks like this can be easily accomplished using `Formidabel.bindElement()`. It takes three mandatory and a fourth optional arguments:

* A jQuery selector for the target element(s), i.e. the element(s) being controlled.
* A jQuery selector for the source element, i.e. the controlling element. (If the selector matches multiple elements, only the first one will be used.)
 * One of the strings "enable", "disable", "show" or "hide" or a function that will be called with the controlled elements as 1st and the controlling element as 2nd argument. 
* An optional 4th argument can be given, which is expected to be a callback which will be executed to determine whether the source element's status/value evaluates to true or false. If not given, `Formidabel.boolValue()` will be used, which works fine for the usual form elements.

To make using `bindElement()` simple and get a consistent UI, the source/controlling element’s state will be evaluated not only when the element’s state changes, but also when the page is loaded and when the form is reset.

# Version History

## 1.2

* Formidabel is now able to handle two or more Formidabel-enhanced forms on a single page correctly.
* Formidabel will throw an Error if the selector/object passed to the constructor function matches not exactly 1 element.
* Formidabel will throw an Error if the element matching the selector is not a `<form>`
* Formidabel will automatically ask for confirmation when user hits the reset button of a dirty form (depending on the browser language; currently supported: English, German)
* Fixed hiliting of changed radion buttons’ labels
* `bindElement()` is marked as deprecated
