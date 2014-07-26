var counter = 0;

var Scope = function (parent, name) {
    this.label = '__function_' + (name || (counter ++));
    this._parent = parent;
    this.variables = [];
    this.functions = {};
    this.code = [];
};

Scope.prototype.getIdentifier = function (name) {
    var ctx = this;
    var depth = 0;
    while (ctx && ctx.variables.indexOf(name) === -1) {
        depth++;
        ctx = ctx._parent;
    }
    return ctx && { depth: depth, idx: ctx.variables.indexOf(name) };
};

Scope.prototype.getFunction = function (name) {
    var ctx = this;
    while (ctx && !ctx.functions[name]) {
        ctx = ctx._parent;
    }
    return ctx && ctx.functions[name].scope;
};

Scope.prototype.toCode = function () {
    return [this.label + ':']
        .concat(this.localScope())
        .concat(this.code)
        .concat(this.code[this.code.length - 1] !== 'RTN' ? 'RTN' : [])
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
    if (this.functions[func.id.name]) {
        console.error('Functions %s already defined!', func.id.name);
    }

    for (var i = 0; i < func.params.length; i ++) {
        var param = func.params[i];
        scope.variables.push(param.name);
    }

    this.functions[func.id.name] = {
        scope: scope
    };
};

Scope.prototype.newVariable = function (name) {
    if (this.variables.indexOf(name) === -1) {
        this.variables.push(name);
    } else {
        console.error('Variable %s reidentification!', name);
    }
};


module.exports = Scope;
