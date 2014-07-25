/* global CONS */
function step (i) {
	var a = i * 1103515245 + 12345 % 1299709;
	var b = i % 4;

	return CONS(a, b);
}

return CONS(42, step);