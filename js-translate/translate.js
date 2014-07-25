var fs = require('fs');
var translate = require('./index.js');
console.log(translate(fs.readFileSync(process.argv[2])));