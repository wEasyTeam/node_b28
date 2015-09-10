var path = require('path');
var xlsx = require('./libs/xlsx-write');
var console = require('./libs/console');

var options = require('./libs/getOption')(process.argv.splice(2));

if (options.h || !options.f) {
  console.log('usage: node ' + path.basename(process.argv[1]) + ' -f jsonfile.json -o xlsxfile.xlsx');
  return;
}

if (!options.o) {
  options.o = path.resolve(options.f).replace(/\.json$/i, '.xlsx');
}

var originData = require(options.f);
var jsonData = [];
if (Object.prototype.toString.call(originData) !== '[object Object]') {
    console.error(options.f + ' is not a valid lang json file!');
    return;
}

for (var key in originData) {
    jsonData.push([key, originData[key]]);
}
jsonData.unshift(['en', 'other Language']);
//console.log(jsonData);

xlsx.write(options.o, '', jsonData);
console.log('success!');
