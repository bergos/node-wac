var assert = require('assert'),
	wac = require('wac');


describe('single file access control', function() {
	var ac = new wac({'graphCallback':wac.fileGraphCallback({'baseUrl':'http://example.com/', 'filename':'test/support/access.ttl'})});

	it('should allow GET request to resource http://example.com/allow using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/allow', 'GET', 'http://example.com/agent#me', null, function(access) {
			assert.ok(access);

			done();
		});
	});

	it('should deny GET request to resource http://example.com/deny using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/deny', 'GET', 'http://example.com/agent#me', null, function(access) {
			assert.ok(!access);

			done();
		});
	});

	it('should deny PUT request to resource http://example.com/allow using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/allow', 'PUT', 'http://example.com/agent#me', null, function(access) {
			assert.ok(!access);

			done();
		});
	});
});


describe('file per directory access control', function() {
	var ac = new wac({'graphCallback':wac.directoryFileGraphCallback({'basePath':'test/support/', 'baseUrl':'http://example.com/', 'filename':'access.ttl'})});

	it('should allow GET request to resource http://example.com/allow using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/allow', 'GET', 'http://example.com/agent#me', null, function(access) {
			assert.ok(access);

			done();
		});
	});

	it('should deny GET request to resource http://example.com/deny using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/deny', 'GET', 'http://example.com/agent#me', null, function(access) {
			assert.ok(!access);

			done();
		});
	});

	it('should deny PUT request to resource http://example.com/allow using agent http://example.com/agent#me', function(done) {
		ac.hasAccess('http://example.com/allow', 'PUT', 'http://example.com/agent#me', null, function(access) {
			assert.ok(!access);

			done();
		});
	});
});
