/* global describe, it */

require('should');
var compile = require('..');

describe('cons', function () {
	it('should create global scope', function () {
		compile('CONS(1,2)').should.eql([
            '__function_0:',
            'DUM 0',
			'LDF __(line + 2)',
			'RAP 0',
            'RET'
		]
		);
	});
});
