/*
</setup:1065407649363005561>
</setupinfo:1065413032374706196>
</compare:1065346941166297128>
</setping:1068373237995683902>
</optout:1068753032801693758>
</watertime:1066970330029113444>
</timetoheight:1067727254634889227>
</reset:1065412317052944476>
</help:1065346941166297129>
</tree:972648557796524032>
</top trees:1051840665362894950>
*/

const fs = require('fs');
const replaceAll = require('string.prototype.replaceall');
const string = fs.readFileSync('./data/rawstring.txt').toString();
let newString = replaceAll(string, '\* ', '');
newString = replaceAll(newString, '\n', '\\n');
newString = replaceAll(newString, '\t', '  - ');
newString = replaceAll(newString, '`/setup`', '</setup:1065407649363005561>');
newString = replaceAll(newString, '`/setupinfo`', '</setupinfo:1065413032374706196>');
newString = replaceAll(newString, '`/compare`', '</compare:1065346941166297128>');
newString = replaceAll(newString, '`/setping`', '</setping:1068373237995683902>');
newString = replaceAll(newString, '`/optout`', '</optout:1068753032801693758>');
newString = replaceAll(newString, '`/watertime`', '</watertime:1066970330029113444>');
newString = replaceAll(newString, '`/timetoheight`', '</timetoheight:1067727254634889227>');
newString = replaceAll(newString, '`/reset`', '</reset:1065412317052944476>');
newString = replaceAll(newString, '`/help`', '</help:1065346941166297129>');
newString = replaceAll(newString, '`/commands`', '</commands:1069501270454456331>');
newString = replaceAll(newString, '`', '``');
fs.writeFileSync('./data/rawstring.txt', newString);
return "Done";