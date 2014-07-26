var fs = require('fs');
var translate = require('./index.js');
var labels = require('./lib/labels.js');

var labeledCode = translate(fs.readFileSync(process.argv[2]));
labeledCode = labeledCode.slice(5);
var code = labels(labeledCode);

console.log(code.join('\n'));
