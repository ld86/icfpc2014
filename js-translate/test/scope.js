/* global describe, it */

require('should');
var compile = require('..');

describe('scope', function () {
	it('should create global scope', function () {
		compile('function a() { return 1; }; a();').should.eql([
            '__function_0:',
            'DUM 0',
			'LDF __(line + 2)',
			'RAP 0',

            'LDF __function_a',
            'AP 0',
            'RET',

            '__function_a:',
            'DUM 0',
            'LDF __(line + 2)',
            'RAP 0',

            'LDC 1',
            'RET'
		]
		);
	});
});
