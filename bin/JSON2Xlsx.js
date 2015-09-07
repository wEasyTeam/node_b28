var path = require('path');
var xlsx = require('./libs/xlsx-write');

var options = require('./libs/getOption')(process.argv.splice(2));

if (options.h || !options.f) {
  console.log('usage: node JSON2Xlsx.js -f jsonfile.json -o xlsxfile.xlsx');
  return;
}

if (!options.o) {
  console.log(options.f);
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
//console.log(jsonData);

xlsx.write(options.o, '', jsonData);
