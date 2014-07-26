var Context = function () {
    this.stack = Object.create(null);
};

Context.prototype.get = function get(key) {
    return this.stack[key];
};

Context.prototype.set = function set(key, value) {
    this.stack[key] = value;
};

Context.prototype.snapshot = function snapshot() {
    this.stack = Object.create(this.stack);
};

Context.prototype.restore = function restore() {
    this.stack = this.stack.prototype || this.stack;
};

module.exports = Context;
