/* global CONS */
function main(world, state) {
    function mod (a, b) {
        return a - (a / b) * b;
    }

    function step (w, i) {
    	var a = mod(i * 1103515245 + 12345, 1299709);
    	var b = mod(i, 4);

    	return CONS(a, b);
    }

    return CONS(42, step);
}
