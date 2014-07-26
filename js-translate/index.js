var esprima = require('esprima');
var gcc = new (require('./lib/gcc.js'))();

module.exports = function complie(code) {
	var tree = esprima.parse(code);
	return gcc.translate(tree.body[0]);
};
