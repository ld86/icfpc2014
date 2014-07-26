var counter = 0;

var Scope = function (parent, name) {
    this.label = '__function_' + (name || (counter ++));
    this._parent = parent;
    this.variables = [];
    this.functions = {};
    this.code = [];
};

Scope.prototype.getFunction = function (name) {
    var ctx = this;
    while (ctx && !ctx.functions[name]) {
        ctx = ctx._parent;
    }
    if (!ctx) { throw new Error('Could not find function ' + name + '!'); }
    return ctx.functions[name].scope;
};

Scope.prototype.toCode = function () {
    return [this.label + ':']
        .concat(this.localScope())
        .concat(this.code)
        .concat(this.code[this.code.length - 1] !== 'RET' ? 'RET' : [])
        .concat(this.functionDefinitions());
};

Scope.prototype.localScope = function () {
    return [
        'DUM ' + this.variables.length,
        'LDF __(line + 2)',
        'RAP ' + this.variables.length
    ];
};

Scope.prototype.functionDefinitions = function () {
    var result = [];
    for (var funcName in this.functions) {
        var func = this.functions[funcName];
        result = result.concat(func.scope.toCode());
    }
    return result;
};

Scope.prototype.newFunction = function (func, scope) {
    this.functions[func.id.name] = {
        scope: scope
    };
};

Scope.prototype.newVariable = function (name) {
    this.variables.push(name);
};


module.exports = Scope;
