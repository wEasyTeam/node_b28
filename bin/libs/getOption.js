'use strict';

/*eg var args = require('getOption')(process.argv.splice(2));*/

module.exports = function(optionsArr) {
    var optionsObj = {};
    if (optionsArr.length > 0) {
        for (var l = 0, len = optionsArr.length; l < len; l++) {
            if (optionsArr[l].indexOf('=') > 1) {//�����f=filename.txt
                optionsObj[optionsArr[l].split('=')[0].replace(/-+/, '')] = optionsArr[l].split('=')[1];
            } else if (optionsArr[l].indexOf('-') === 0) {//����� -f filename.txt
                optionsObj[optionsArr[l].substring(1)] = ((typeof optionsArr[l + 1] === 'string') 
                && optionsArr[l + 1].charAt(0) !== '-') ? (l+=1,optionsArr[l]) : true;
                console.log(optionsObj)
            } else {//�����f
                optionsObj[optionsArr[l].split('=')[0].replace(/-+/, '')] = true;
            }
        }
        return optionsObj;
    }
    return {
        h: true
    };
}