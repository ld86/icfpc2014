var esprima = require('esprima');

function serialize(object) {
	if (Array.isArray(object)) { return joinArray(object); }
	
	if (object.type === "ExpressionStatement") {
		return serialize(object.expression);
	}

	if (object.type === "BinaryExpression") {
		var result = ['LDC ' + object.left.value, 'LDC ' + object.right.value];
		if (object.operator === '+') {
			result.push('ADD');
		}
		if (object.operator === '-') {
			result.push('SUB');
		}
		if (object.operator === '*') {
			result.push('MUL');
		}
		return result.join('\n') + '\n';
	}
}

function joinArray (array) {
	var result = '';
	for (var i = 0; i < array.length; i++) {
		result += serialize(array[i]);
	}
	return result;
}

module.exports = function complie(code) {
	var tree = esprima.parse(code);
	return serialize(tree.body);
};