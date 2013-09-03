# Web Access Control implementation for Node.js

A stand-alone or express/connect Web Access Control implementation designed for Node.js with configurable graph callback.

See also:

* [Wiki article](http://www.w3.org/wiki/WebAccessControl)
* [Ontology](http://www.w3.org/ns/auth/acl)

## Usage

Example code:

`var fileCallbackOptions = {'baseUrl':'http://example.com','filename':'access.ttl'};`

`var accessControl = require('wac')({'graphCallback':wac.fileGraphCallback(fileCallbackOptions)});`

`accessControl.hasAccess('http://example.com/resource', 'GET', 'http://example.com/agent#me', null, callback);`

This code creates an access control object using the rules defined in the turtle file 'access.ttl' with the base URL 'http://example.com'.
The last line tests access for the resource 'http://example.com/resource' using HTTP method 'GET' for agent 'http://example.com/agent#me'.

Express middleware example code:

`app.use(accessControl.middleware({}));`

Uses express/connect middleware functionality of the previously created `accessControl` object. 

### wac options

#### cors (default: false)

Enables or disables [cross-origin requests](http://www.w3.org/TR/cors/). If the `application` parameter is not null a cross-origin request is detected.

#### graph

A graph which contains the access control rules as [RDF Interfaces: Graph](http://www.w3.org/TR/rdf-interfaces/#graphs). This option or the graphCallback option is required!

#### graphCallback

A callback function to fetch the graph which contains the access control rules as [RDF Interfaces: Graph](http://www.w3.org/TR/rdf-interfaces/#graphs).

The function must accept two parameters:

* `resource` The resource permission is requested
* `callback` The callback function which is called with the graph as single parameter

This option or the graph option is required!

### wac.fileGraphCallback(options)

A `graphCallback` function for single file access control rules.

The following options are required:

* `baseUrl` The base URL for the Turtle file
* `filename` The filename of the Turtle file

### wac.directoryFileGraphCallback(options)

A `graphCallback`function for per directory file access control rules.

The following options are required if there is no default:

* `basePath` The path to look at relative to the base URL (default: '')
* `baseUrl` The URL for the parser relative to the base path
* `filename` The filename of the access control rule files (default: '.acl.ttl')

### hasAccess(resource, method, agent, application, callback)

Stand-alone function to check whether a agent/application has access to a resource with the given method/mode.

The following parameters must be provided:

* `resource` URL of the resource to check
* `method` HTTP method or WAC mode
* `agent` URL of the agent
* `application` CORS host
* `callback` The callback function with a single boolean parameter

### middleware(options)

Function to create a express/connect middleware.

The following options are available:

* `forbidden` A function to send the 403 forbidden response (default: send only 403 status code)

The req.absoluteUrl() function is required provided by the `express-utils` middleware.
