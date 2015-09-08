'use strict';

module.exports = (function(console) {
    var _console = {};
    for (var prop in console) {
        _console[prop] = (function(p) {
           return function() {
               arguments[0] = '[' + p.toUpperCase() + ']: ' + arguments[0];
               arguments[arguments.length - 1] = arguments[arguments.length - 1] + '\r\n';
               console[p].apply(console, arguments);
           }
        })(prop);
    }
    return _console;
})(console);


