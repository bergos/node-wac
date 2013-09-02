var _ = require('underscore'),
	rdf = require('rdf');


module.exports = function(options) {
	var wac = this;
	var cors = false;
	var graphCallback = null;

	var methodModeMap = {
		'DELETE': 'http://www.w3.org/ns/auth/acl#Write',
		'GET': 'http://www.w3.org/ns/auth/acl#Read',
		'HEAD': 'http://www.w3.org/ns/auth/acl#Read',
		'OPTIONS': 'http://www.w3.org/ns/auth/acl#Read',
		'PATCH': 'http://www.w3.org/ns/auth/acl#Write',
		'POST': 'http://www.w3.org/ns/auth/acl#Write',
		'PUT': 'http://www.w3.org/ns/auth/acl#Write'
	};

	if(!_.isUndefined(options.cors))
		cors = options.cors;

	if(!_.isUndefined(options.graphCallback))
		graphCallback = options.graphCallback;
	else if(!_.isUndefined(options.graph))
		graphCallback = function(resource, callback) { callback(options.graph); };

	this.hasAccess = function(resource, method, agent, application, callback) {
		if(!cors && application != null) {
			callback(false);
		} else {
			var mode = method;

			if(!_.isUndefined(methodModeMap[method]))
				mode = methodModeMap[method];

			graphCallback(resource, function(graph) {
				var access = false;

				graph.match(null, 'http://www.w3.org/ns/auth/acl#accessTo', resource).forEach(function(accessToTriple) {
					graph.match(accessToTriple.subject, 'http://www.w3.org/ns/auth/acl#agent', agent).forEach(function(agentTriple) {
						graph.match(accessToTriple.subject, 'http://www.w3.org/ns/auth/acl#mode', mode).forEach(function(modeTriple) {
							access = true;
						});
					});
				});
		
				callback(access);
			});
		}
	};

	this.middleware = function(options) {
		var connect = null;

		try {
			connect = require('connect');
		} catch(e) {
			connect = require('express/node_modules/connect');
		}

		var forbidden = function(req, res) { res.send(403); };

		if(!_.isUndefined(options.forbidden))
			forbidden = options.forbidden;

		return function(req, res, next) {			
			var pause = connect.utils.pause(req);

			wac.hasAccess(req.absoluteUrl(), req.method, req.session.agent, null, function(access) {
				if(access) {
					next();
				} else {
					forbidden(req, res);
				}

				pause.resume();
			});
		};
	};
};


module.exports.mode = {
	read: 'http://www.w3.org/ns/auth/acl#Read',
	write: 'http://www.w3.org/ns/auth/acl#Write'
};


module.exports.fileGraphCallback = function(options) {
	var fs = require('fs');

	var parser = new rdf.TurtleParser(new rdf.RDFEnvironment);
	var graph = new rdf.TripletGraph();

	parser.parse(fs.readFileSync(options.filename, {encoding:'utf8'}), null, options.baseUrl, null, graph);

	return function(resource, callback) {
		callback(graph);
	};
};


module.exports.directoryFileGraphCallback = function(options) {
	var fs = require('fs'),
		path = require('path');

	var basePath = '';
	var filename = '.acl.ttl';

	if(!_.isUndefined(options.filename))
		filename = options.filename;

	if(!_.isUndefined(options.basePath))
		basePath = options.basePath;

	return function(resource, callback) {
		if(resource.indexOf(options.baseUrl) != 0)
			throw 'unknown base url';

		var dir = path.dirname(resource.substring(options.baseUrl.length));
		var dirFilename = path.join(basePath, dir, filename);

		if(!fs.existsSync(dirFilename)) {
			callback(new rdf.IndexedGraph());
		} else {
			var parser = new rdf.TurtleParser(new rdf.RDFEnvironment);
			var graph = new rdf.TripletGraph();

			parser.parse(fs.readFileSync(dirFilename, {encoding:'utf8'}), null, options.baseUrl + dir + '/', null, graph);

			callback(graph);
		}
	};
};
