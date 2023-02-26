const commands = [
    {raw: "`/compare`", clickable: "</compare:1077058896469966889>"},
    {raw: "`/relay set`", clickable: "</relay set:1077322799032578152>"},
    {raw: "`/relay update`", clickable: "</relay update:1077322799032578152>"},
    {raw: "`/relay disable`", clickable: "</relay disable:1077322799032578152>"},
    {raw: "`/rolemenu`", clickable: "</rolemenu:1077058896469966892>"},
    {raw: "`/watertime`", clickable: "</watertime:1077058896469966895>"},
    {raw: "`/timetoheight`", clickable: "</timetoheight:1077058896469966894>"},
    {raw: "`/setup compare`", clickable: "</setup compare:1077058896469966893>"},
    {raw: "`/setup view`", clickable: "</setup view:1077058896469966893>"},
    {raw: "`/setup reset`", clickable: "</setup reset:1077058896469966893>"},
    {raw: "`/help`", clickable: "</help:1077058896469966890>"},
    {raw: "`/tree`", clickable: "</tree:972648557796524032>"},
    {raw: "`/top trees`", clickable: "</top trees:1051840665362894950>"},
    {raw: "`/commands`", clickable: "</commands:1077058896469966888>"}
];
const fs = require('fs');
const replaceAll = require('string.prototype.replaceall');
const path = "./modules/input.txt";
const string = fs.readFileSync(path).toString();
let newString = replaceAll(string, '\* ', '');
newString = replaceAll(newString, '\n', '\\n');
newString = replaceAll(newString, '\t', '  - ');
commands.forEach(command => {
    newString = replaceAll(newString, command.raw, command.clickable);
});
newString = replaceAll(newString, '`', '``');
fs.writeFileSync(path, newString);
return "Done";