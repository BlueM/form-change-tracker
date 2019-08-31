parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"LKIN":[function(require,module,exports) {
"use strict";function e(e){switch(e.type){case"color":case"date":case"email":case"month":case"number":case"password":case"search":case"tel":case"text":case"textarea":case"time":case"url":case"week":return"input";case"button":case"checkbox":case"radio":return"click";case"file":case"select":case"select-multiple":case"select-one":return"change";case"range":return-1!==navigator.userAgent.indexOf("MSIE")?"change":"input";case"hidden":case"reset":case"submit":return null;default:return console.warn(`Unsupported type: “${e.type}”`),null}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"Focm":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("@bluem/form-control-event-name"));function t(e){return e&&e.__esModule?e:{default:e}}function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function o(e,t,r){return t&&s(e.prototype,t),r&&s(e,r),e}var i=function(){function t(r){var s=this;if(n(this,t),(r=this.getOptions(r)).element)this.form=r.element;else if(this.form=document.querySelector(r.selector),!this.form)return;if("form"!==this.form.tagName.toLowerCase())throw new Error("The selector is expected to select a <form> element, but actually is a "+this.form[0].tagName.toLowerCase()+" element");this.observedControls=[],this.origVals={},this.chngVals={},this.callback=r.callback,this.resetButton=this.form.querySelector('input[type="reset"]'),this.classname=r.classname,this.resetButton&&this.resetButton.addEventListener("click",function(e){s.isDirty()&&(e.preventDefault(),r.confirm(function(){s.form.reset(),s.markFormAsDirty(!1)}))}),this.eventListener=this.handleEvent.bind(this);for(var o=this.form.querySelectorAll("input, textarea, select"),i=0,a=o.length;i<a;i++){var l=o[i],c=(0,e.default)(l);l.name&&c&&(this.origVals[l.name]=t.controlValue(l),l.addEventListener(c,this.eventListener),this.observedControls.push([l,c]))}this.markFormAsDirty(!1)}return o(t,[{key:"unbind",value:function(){var e=this;this.observedControls.forEach(function(t){return t[0].removeEventListener(t[1],e.eventListener)}),this.observedControls=[]}},{key:"handleEvent",value:function(e){var r,n,s,o,i=e.target,a=t.findLabel(i);if("radio"===i.type)for(r=0,n=(o=this.form.querySelectorAll('input[type=radio][name="'+i.name+'"]')).length;r<n;r++)o[r].classList.remove(this.classname),(s=t.findLabel(o[r]))&&s.classList.remove(this.classname);var l=!0;this.origVals[i.name]===t.controlValue(i)?(this.chngVals[i.name]=!1,this.markFormAsDirty(this.isDirty()),i.classList.remove(this.classname),l=!1,a&&a.classList.remove(this.classname)):this.markControlAsChanged(i,a),this.callback&&this.callback(i,l)}},{key:"markFormAsDirty",value:function(e){if(e)this.resetButton&&this.resetButton.removeAttribute("disabled");else{this.resetButton&&this.resetButton.setAttribute("disabled","disabled"),this.chngVals={};for(var t=this.form.querySelectorAll("label"),r=0,n=t.length;r<n;r++)t[r].classList.remove(this.classname)}}},{key:"isDirty",value:function(){for(var e in this.origVals)if(this.origVals.hasOwnProperty(e)&&this.chngVals[e])return!0;return!1}},{key:"markControlAsChanged",value:function(e,t){this.markFormAsDirty(!0),this.chngVals[e.name]=!0,e.classList.add(this.classname),t&&t.classList.add(this.classname)}},{key:"getOptions",value:function(e){return e&&"object"!==r(e)&&(console.warn("Options must be given as an object. Will fall back to defaults."),e={}),(e=e||{}).selector=e.selector||"form",e.classname=e.classname||"control-changed",["confirm","callback"].forEach(function(t){e[t]&&"function"!=typeof e[t]&&(console.warn("Invalid value given: options.".concat(t," must be a function.")),e[t]=null)}),e.confirm||(e.confirm=function(e){confirm("Are you sure you want to reset the form and lose unsaved changes?")&&e()}),e}}],[{key:"controlValue",value:function(e){if("radio"===e.type)return+e.checked;if("checkbox"===e.type)return e.indeterminate?2:+e.checked;if("select"===e.type||"select-multiple"===e.type){for(var t=[],r=0,n=e.length;r<n;r++)e.options[r].selected&&t.push(r);return t.join("-")}return e.value}},{key:"findLabel",value:function(e){var t=e.getAttribute("id");return t?document.querySelector('label[for="'+t+'"]'):null}}]),t}();exports.default=i;
},{"@bluem/form-control-event-name":"LKIN"}],"lgAh":[function(require,module,exports) {
"use strict";var e=n(require("./index.js"));function n(e){return e&&e.__esModule?e:{default:e}}var t=new e.default({selector:"form",callback:function(e,n){console.log("The control named “".concat(e.name,"” is now ").concat(n?"dirty":"pristine"))},confirm:function(e){c(e)}});function c(e){document.body.insertAdjacentHTML("afterbegin",'<div class="overlay-cover">\n             <div class="overlay-content">\n                <p>Are you sure you want to reset the form?<br>Unsaved changes will be lost.</p>\n                <a class="ui cancel">No, cancel</a>\n                <a class="ui confirm">Yes, do it</a>\n             </div>\n        </div>');var n=document.querySelector(".ui.confirm"),t=document.querySelector(".ui.cancel"),c=function(){e(),o()},o=function(){n.removeEventListener("click",c),n.removeEventListener("click",c);var e=document.querySelector(".overlay-cover");e.parentNode.removeChild(e)};n.addEventListener("click",c),t.addEventListener("click",function(){o()})}document.querySelector("input[type=submit]").addEventListener("click",function(e){e.preventDefault()}),document.querySelector("[data-action=unbind]").addEventListener("click",function(){t.unbind(),alert("Changing control now should no longer trigger behavior change in the form")});
},{"./index.js":"Focm"}]},{},["lgAh"], null)