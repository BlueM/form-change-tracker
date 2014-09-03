var jQueryStub = null;
var argumentsSpy = [];

$ = function () {
    argumentsSpy = arguments;
    return jQueryStub;
};


QUnit.test('findLabel() returns an empty jQuery object, if the element does not have an @id', function (assert) {
    elementStub = {
        getAttribute: function () {
            return null;
        }
    };
    jQueryStub = [];
    assert.ok(0 === Formidabel.findLabel(elementStub).length);
});

QUnit.test('findLabel() a <label> with the appropriate @for attribute value', function (assert) {
    elementStub = {
        getAttribute: function () {
            return 'abc';
        }
    };
    jQueryStub = ['Whatever'];
    assert.ok(jQueryStub === Formidabel.findLabel(elementStub));
    assert.equal(argumentsSpy.length, 1);
    assert.equal(argumentsSpy[0], 'label[for="abc"]');
    argumentsSpy = [];
});


// - - - - - - -  boolValue() tests - - - - - - -

QUnit.test('The Boolean value for a checked checkbox is true', function (assert) {
    jQueryStub = {
        prop: function () {
            return true;
        }
    };
    assert.ok(true === Formidabel.boolValue({type: 'checkbox'}));
});

QUnit.test('The Boolean value for an unchecked radiobutton is false', function (assert) {
    jQueryStub = {
        prop: function () {
            return false;
        }
    };
    assert.ok(false === Formidabel.boolValue({type: 'radio'}));
});

QUnit.test('The Boolean value for a non-checkbox and non-radiobutton depends on jQuery’s .val() return value', function (assert) {
    jQueryStub = {
        val: function () {
            return '';
        }
    };
    assert.ok(false === Formidabel.boolValue({type: 'text'}));
});


// - - - - - - -  eventNameByType() tests - - - - - - -

QUnit.test('The event name for an element without type property is an empty string', function (assert) {
    var stub = {};
    assert.ok('' === Formidabel.eventNameByType(stub));
});

QUnit.test('Get the event name for an input:text element', function (assert) {
    var stub = {type: 'text'};
    assert.ok('keyup' === Formidabel.eventNameByType(stub));
});

QUnit.test('Get the event name for an input:checkbox element', function (assert) {
    var stub = {type: 'checkbox'};
    assert.ok('click' === Formidabel.eventNameByType(stub));
});

QUnit.test('Get the event name for an input:select element', function (assert) {
    var stub = {type: 'select'};
    assert.ok('change' === Formidabel.eventNameByType(stub));
});

QUnit.test('Get the event name for an unknown input element', function (assert) {
    var stub = {type: 'unknowntype'};
    assert.ok('' === Formidabel.eventNameByType(stub));
});
