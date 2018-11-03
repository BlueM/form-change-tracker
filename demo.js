// THIS IS ALL THE CODE YOU NEED >>>>

import FormChangeTracker from './index.js';

const f = new FormChangeTracker({
    // Next property is optional, if the selector is "form" (which is the default value)
    selector: 'form',
    // Next property is only required if you want to attach some custom behavior
    callback: function(control, isDirty) {
        console.log(`The control named “${control.name}” is now ${isDirty ? 'dirty' : 'pristine'}`);
    },
    // If you don't want/need a custom confirmation function, you can
    // even drop the "confirm" property.
    confirm: function(formidabelCallback) {
        confirmReset(formidabelCallback);
    }
});

// THIS IS ALL THE CODE YOU NEED <<<<



// The rest of the scripting code is only for this demo.

function confirmReset(callbackFunction) {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<div class="overlay-cover">
             <div class="overlay-content">
                <p>Are you sure you want to reset the form?<br>Unsaved changes will be lost.</p>
                <a class="ui cancel">No, cancel</a>
                <a class="ui confirm">Yes, do it</a>
             </div>
        </div>`
    );

    const confirm = document.querySelector('.ui.confirm');
    const cancel = document.querySelector('.ui.cancel');

    const confirmHandler = function () {
        callbackFunction();
        dispose();
    };

    const cancelHandler = function () {
        dispose();
    };

    const dispose = function() {
        confirm.removeEventListener('click', confirmHandler);
        confirm.removeEventListener('click', confirmHandler);
        const overlay = document.querySelector('.overlay-cover');
        overlay.parentNode.removeChild(overlay);
    };

    confirm.addEventListener('click', confirmHandler);
    cancel.addEventListener('click', cancelHandler);
}

document.querySelector('input[type=submit]').addEventListener('click', function(e) {
    e.preventDefault();
});

document.querySelector('[data-action=unbind]').addEventListener('click', function() {
    f.unbind();
    alert('Changing control now should no longer trigger behavior change in the form');
});
