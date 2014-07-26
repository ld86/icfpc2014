/* global describe, it */

require('should');
var t = require('..');

describe('simple', function () {
	it('should translate addition', function () {
		t('1 + 2').should.eql(
			'LDC 1\n' +
			'LDC 2\n' +
			'ADD'
		);
	});
});