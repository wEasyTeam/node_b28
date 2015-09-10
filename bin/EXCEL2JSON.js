'use strict';

var path = require('path');
var core = require('./libs/reasy-command-b28');
var file = require('./libs/file');
var options = require('./libs/getOption')(process.argv.splice(2));
var console = require('./libs/console');


function fixPath(_path) {
    if (!file.isAbsolute(_path)) {
        _path = path.join(process.cwd(), _path);
    }
    return _path;
}


if (options.h || !options.f) {
    console.log('usage: node ' + path.basename(process.argv[1]) + ' -f xlsxfile.xlsx -o ./outdir -key en');
    return;
}

options.f = fixPath(options.f);

if (!options.o) {
    options.o = path.resolve(options.f).replace(/\.xlsx$/i, '.json');
}

options.o = fixPath(options.o);

if (!options.key || options.key === true) {
    options.key = 'en';
}

core.parse({
    file: options.f,
    dest: options.o,
    key: options.key
});
console.log('success!');
