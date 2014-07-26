var Context = require('./context.js');

var BinaryCommands = {'+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV'};

function GCC () {
	this.context = new Context();
	this.code = [];
}

GCC.prototype.VariableDeclaration = function () {

};

GCC.prototype.FunctionDeclaration = function (func) {
	this.context.push({});
	// this.functions[func.id] = {
	// 	argumentsLength: func.params.length,
	// 	argumentsMap: func.params.reduce(function (map, param, idx) {
	// 		map[param.name] = idx;
	// 	}, {})
	// };

	this.traverse(func.body);

	// * Load arguments
	// * Compile code block
	this.context.pop();
};

GCC.prototype.ReturnStatement = function (ret) {
	this.traverse(ret.argument);
	this.code.push('RET');
};

GCC.prototype.Literal = function (block) {
	this.code.push('LDC ' + block.value);
};

GCC.prototype.ExpressionStatement = function (block) {
	this.traverse(block.expression);
};

GCC.prototype.BinaryExpression = function (block) {
	this.traverse(block.left);
	this.traverse(block.right);
	this.code.push(BinaryCommands[block.operator]);
};

GCC.prototype.traverse = function (block) {
	if (!block) { console.log('Traversing %s block', block); return; }

	if (Array.isArray(block)) {
		for (var i = 0; i < block.length; i++) {
			this.traverse(block[i]);
		}
		return;
	}

	if (this[block.type]) { 
		this[block.type](block);
	} else {
		console.error(block);
		console.error('Unknown block type: ' + block.type);
	}
};

GCC.prototype.compile = function () {
	return this.code.join('\n');
};

GCC.prototype.translate = function (block) {
	this.traverse(block);
	return this.compile();
};

module.exports = GCC;