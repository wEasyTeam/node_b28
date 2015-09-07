var excel = require('xlsx');
var fs = require('fs');
var path = require('path');


function writeObjSync(filepath, obj) {
    createDir(path.dirname(filepath));
    fs.writeFileSync(filepath, JSON.stringify(obj, null, 4));
}

function createDir(dir, callback) {
    dir = path.resolve(dir);
    var originDir = dir;
    try {
        if (!path.isAbsolute(dir)) {
            dir = path.join(process.cwd(), dir);
        }
        if (fs.existsSync(dir)) return;

        while (!fs.existsSync(dir + '/..')) { //检查父目录是否存在
            dir += '/..';
        }

        while (originDir.length <= dir.length) { //如果目录循环创建完毕，则跳出循环
            fs.mkdirSync(dir, '0777');
            dir = dir.substring(0, dir.length - 3);
        }

        if (callback) callback();
    } catch (e) {
        console.log(e);
    }
}

function parse(file) {
    var wb = excel.readFileSync(file, {
        cellFormula: false
    });
    var langObj = {};

    var sheet_name_list = wb.SheetNames;
    sheet_name_list.forEach(function(y) { /* 遍历sheets */
        var ws = excel.utils.sheet_to_json(wb.Sheets[y]);
        //遍历多国语内容
  
        for (var row = 0, rlen = ws.length; row < rlen; row++) { //遍历表格行
            if (!ws[row][key]) {
                throw new Error('not find key `' + key + '` in excel!');
            }
            if (!langArr) {//如果没有指定需要输出的语言,则
              for (var col in ws[row]) { //遍历表格列,ws[row]表示一行的内容, col表示列头
                  if (col === key) {
                      continue;
                  }
                  if (!(col in langObj)) {
                      langObj[col] = {};
                  }
                  langObj[col][ws[row][key]] = ws[row][col];
              }
            } else {//否则遍历语言
              for (var index = 0, clen = langArr.length; index < clen; index++) { //遍历表格列,ws[row]表示一行的内容, col表示列头
                  var col = langArr[index];
                  if (col === key) {
                      continue;
                  }
                  if (!(col in langObj)) {
                      langObj[col] = {};
                  }
                  langObj[col][ws[row][key]] = ws[row][col];
              }
            }
        }
        /*for (var lang in langObj) {
            writeObjSync(dest + '/' + lang + '/' + y + '.json', langObj[lang]);
        }*/
    });
    return langObj;
}

exports.parse = function(settings) {
    if (!settings) {
        throw new Error('settings can`t be empty!');
    }
    if (!settings.file) {
        throw new Error('please set `settings.file!`');
    }
    settings.dest = settings.dest || path.dirname(settings.file);
    settings.key = settings.key || settings.defaultLang || 'en';
    if (!(settings.lang && settings.lang instanceof Array && settings.lang.length > 0)) {
        settings.lang = ['zh'];
    }
    parse(settings.file, settings.dest, settings.key, settings.lang);
};
