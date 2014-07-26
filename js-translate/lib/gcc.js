var Scope = require('./scope.js');

var BinaryCommands = {
    '+': 'ADD',
    '-': 'SUB',
    '*': 'MUL',
    '/': 'DIV'
};

function GCC () {
    this.scope = new Scope();
}

GCC.prototype.CallExpression = function (block) {
    var func = this.scope.getFunction(block.callee.name);
    this.traverse(block.arguments);
    this.scope.code.push('LDF ' + func.label);
    this.scope.code.push('AP ' + block.arguments.length);
};

GCC.prototype.AssignmentExpression = function (block) {
    this.traverse(block.init || block.right);
    var env = this.scope.getVariable(block.left.name);
    this.scope.code.push('ST ' + env.depth + ' ' + env.idx);
};

GCC.prototype.VariableDeclaration = function (block) {
    this.traverse(block.declarations);
};

GCC.prototype.VariableDeclarator = function (block) {
    this.scope.newVariable(block.id.name);
    this.AssignmentExpression(block);
};

GCC.prototype.FunctionDeclaration = function (func) {
    var scope = new Scope(this.scope, func.id.name);
    this.scope.newFunction(func, scope);
    this.scope = scope;
    this.traverse(func.body);
    this.scope = this.scope._parent;
};

GCC.prototype.ReturnStatement = function (ret) {
    this.traverse(ret.argument);
    this.scope.code.push('RET');
};

GCC.prototype.Literal = function (block) {
    this.scope.code.push('LDC ' + block.value);
};

GCC.prototype.ExpressionStatement = function (block) {
    this.traverse(block.expression);
};

GCC.prototype.BlockStatement = function (block) {
    this.traverse(block.body);
};

GCC.prototype.BinaryExpression = function (block) {
    this.traverse(block.left);
    this.traverse(block.right);
    this.scope.code.push(BinaryCommands[block.operator]);
};

GCC.prototype.EmptyStatement = function () {};

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
    return this.scope.toCode();
};

GCC.prototype.translate = function (block) {
    this.traverse(block);
    return this.compile();
};

module.exports = GCC;
