var jsdom = require('jsdom'),
    fs = require('fs'),
    path = require('path'),
    B = require('./libs/b28lib').b28lib,
    glob = require('./libs/glob'),
    file = require('./libs/file'),
    xlsxWriter = require('./libs/xlsx-write');

var includes = '**.{js,html,htm,asp,tpl}';
var excludes = '**{.svn,jquery,reasy,.min.js,shiv.js,respond.js,b28,shim.js,/libs/}**';
//或['.svn', 'goform', 'css', 'images', 'lang', 'fis', 'config.js', 'release.js'];


var spliter = '\t**--**\t';

var gfileList = [],

    CONFIG = {
        src: null,
        dest: null,
        help: null,
        onlyZH: false,
        dict: null //翻译模式时需要指定
    },
    jsonDict = {};



var easyUTF8 = function(gbk) {
    if (!gbk) {
        return '';
    }
    var utf8 = [];
    for (var i = 0; i < gbk.length; i++) {
        var s_str = gbk.charAt(i);
        if (!(/^%u/i.test(escape(s_str)))) {
            utf8.push(s_str);
            continue;
        }
        var s_char = gbk.charCodeAt(i);
        var b_char = s_char.toString(2).split('');
        var c_char = (b_char.length == 15) ? [0].concat(b_char) : b_char;
        var a_b = [];
        a_b[0] = '1110' + c_char.splice(0, 4).join('');
        a_b[1] = '10' + c_char.splice(0, 6).join('');
        a_b[2] = '10' + c_char.splice(0, 6).join('');
        for (var n = 0; n < a_b.length; n++) {
            utf8.push('%' + parseInt(a_b[n], 2).toString(16).toUpperCase());
        }
    }
    return utf8.join('');
};


function unique(inputs, type) {
    var res = [];
    var json = {};
    if (!inputs) {
        return [];
    }
    for (var i = 0; i < inputs.length; i++) {
        if (typeof inputs[i] === 'undefined') continue;

        if (!json[inputs[i]]) {
            if (type === 1) {
                inputs[i] = inputs[i].split(spliter);
            }
            res.push(inputs[i]);
            json[inputs[i]] = 1;
        }
    }
    return res;
}


function readDict(filename) { //读取字典
    if (path.extname(filename === '.xlsx')) {
        jsonDict.content = require('./libs/xlsx-read').parse(filename);
    } else {
        jsonDict.content = fs.readFileSync(filename, 'utf-8');
    }
}

function writeExcel(filename, array) { //以xlsx形式写入
    xlsxWriter.write(filename, '', array, {
        wscols: [{
            wch: 30
        }, {
            wch: 10
        }, {
            wch: 0.0000000000001
        }, {
            wch: 100
        }]
    });
    console.log(filename + ' success saved!');
}

function writeText(filename, content) { //以文本形式写入
    fs.writeFileSync(filename, content);
    console.log(filename + ' success saved!');
}

function writeFile(saveTo, array) { //提取写入部分
    saveTo = path.resolve(saveTo);
    if (/\.xlsx$/.test(saveTo)) {
        writeExcel(saveTo, unique(array, 1));
    } else {
        writeText(saveTo, unique(array, 1).join("\r\n"));
    }
}

function correctPath(_path) {
    if (!_path) return '';
    return path.resolve(_path);
}

function filter(key) {
    if (typeof includes === 'string') {
        includes = glob(includes);
        excludes = glob(excludes);
    }
    //console.log(key)
    return includes.test(key) && !excludes.test(key);
}


function getFileList(srcFolder, destFolder) {
    if (!gfileList || gfileList.length === 0) {
        srcFolder = correctPath(srcFolder);

        var files = file.scanFolder(srcFolder);
        if (destFolder) {
            destFolder = correctPath(destFolder);
            files.folder.forEach(function(val) {
                file.createFolder(path.join(destFolder, path.relative(srcFolder, val))); //创建目录
            });
        }

        files.files.forEach(function(val) {
            if (filter(file.relative(CONFIG.src, val))) {
                gfileList.push({
                    fileName: val,
                    fileType: path.extname(val)
                });
            } else if (destFolder) {
                //如果是翻译模式需要将未匹配的文件原样拷贝
                var dst = path.join(destFolder, path.relative(srcFolder, val));
                if (fs.existsSync(val) && !fs.existsSync(dst)) {
                    file.cp(val, dst);
                }
            }
        });
    }

    return gfileList;
}

function _getPageLangData(page) { //提取html
    var content = fs.readFileSync(page, 'utf-8');
    var document = jsdom.jsdom(content);
    var arr = new B.getPageData(document.documentElement, CONFIG.onlyZH, path.resolve(page));
    return arr;
}

function _getResLangData(file) { //提取js
    var content = fs.readFileSync(file, 'utf-8');
    var arr = new B.getResData(content, CONFIG.onlyZH, path.resolve(file));
    return arr;
}


function doGetLangData(file) { //执行提取
    if (file.fileType == ".js") {
        return _getResLangData(file.fileName);
    } else {
        return _getPageLangData(file.fileName);
    }
}


function getLangData(srcdir, saveTo) { //提取入口
    var langFetchArr = [];
    if (srcdir && typeof srcdir == 'string' && fs.lstatSync(srcdir).isDirectory()) {
        gfileList = getFileList(srcdir);

        gfileList.forEach(function(val) {
            langFetchArr = langFetchArr.concat(doGetLangData(val));
        });

    } else {
        langFetchArr = doGetLangData({
            fileName: srcdir,
            fileType: path.extname(srcdir)
        });
    }
    writeFile(saveTo, langFetchArr);
    writeExcel(path.join(path.dirname(saveTo), 'remark.xlsx'), unique(B.getRemark(), 1));
}

function _translatePage(page, saveTo) { //翻译html
    var content = fs.readFileSync(page, 'utf-8');
    var document = jsdom.jsdom(content);
    B.transTitle(document, path.resolve(page));
    B.translatePage(document, path.resolve(page));
    writeText(saveTo, "<!DOCTYPE html>\r\n" + document.documentElement.outerHTML);
}

function _translateRes(file, saveTo) { //翻译js
    var content = fs.readFileSync(file, 'utf-8');
    var ret = B.translateRes(content, path.resolve(file));
    writeText(saveTo, ret);
}

function doTranslate(file, savepath) { //执行翻译
    if (file.fileType == ".js") {
        _translateRes(file.fileName, savepath);
    } else if (file.fileType == ".htm" || file.fileType == ".html" || file.fileType == ".asp") {
        _translatePage(file.fileName, savepath);
    }
}

function translatePage(srcdir, saveTo) { //翻译入口
    if (srcdir && typeof srcdir == 'string' && fs.statSync(srcdir).isDirectory()) { //如果是目录,先扫描目录
        getFileList(srcdir, saveTo);
        fileList.forEach(function(val) {
            doTranslate(val, val.fileName.replace(srcdir, saveTo));
        });
    } else {
        doTranslate({
            fileType: path.extname(srcdir),
            fileName: srcdir
        }, saveTo);
    }
    writeExcel(path.join(path.dirname(CONFIG.lang), 'remark.xlsx'), unique(B.getRemark(), 1));
}


CONFIG.help = 'usage:\r\n\tnode node_b28.js -src=srcdir -dest=destdir -zh\r\nor translate mode:\r\n\tnode node_b28.js -src=srcdir -dest=destdir -lang=langfile -t';

//console.log("hello, node b28!\r\nCoreVersion: " + B.coreVersion + '\r\nNode b28 Version: V1.2\r\n');



var args = require('./libs/getOption')(process.argv.splice(2));

if (!args.h) {
   
    CONFIG.src = correctPath(args.src);
    CONFIG.dest = correctPath(args.dest);
    CONFIG.lang = correctPath(args.lang);
    
    if (args.src && args.dest) {
        if (args.t) {
            console.log('Translate Mode');
            if (CONFIG.lang) {
                console.log('start load lang');
                readDict(CONFIG.lang);
                B.loadJSON(jsonDict.content);
                console.log('start Translate');
                translatePage(CONFIG.src, CONFIG.dest);
            } else {
                console.log('please specify this langfile first!');
            }
        } else {
            console.log('Fetch Mode');
            //console.log(CONFIG);
            if (args.zh) {
                CONFIG.onlyZH = true;
            }
            getLangData(CONFIG.src, CONFIG.dest);
        }
    } else {
        console.log('Please specify the src,dest first!');
    }
} else {
    console.log(CONFIG.help);
}
console.log('success!');//返回success
