'use strict';

// Dependencies
//-----------------------------------------
var fs 					= require('fs-extra'),
	path 				= require('path'),
	esprima 			= require('esprima'),
	_ 					= require('lodash'),
	// private 
	// delegate declarations
	_astGenerator 		= Object.create( require('./lib/ast-generator.js') ),
	_astToDocJson 		= Object.create( require('./lib/ast-to-doc-json.js') ),
	_docJsonToDocYaml 	= Object.create( require('./lib/doc-json-to-doc-yaml.js') ),
	_prepareYaml		= Object.create( require('./lib/prepare-yaml.js') ),
	_generateDocs		= Object.create( require('./lib/generate-docs.js') ),
	
	// file path configuration the "setup" directory will be copied
	// to the project root.
	_root = '../../',
	_config = {
		syntaxMatchers: _root + 'jsdoccer/syntax-matchers.js',
		setUpSrc: './setup',
		setUpDest: _root + 'jsdoccer/',
		yamlTemplates: _root + 'jsdoccer/templates/yaml/',
		handlebarsTemplate: _root + 'jsdoccer/templates/yaml/',
		jsdocTemplates: _root + 'jsdoccer/templates/jsdoc/',
		ast: _root + 'jsdoccer/generated-files/ast/',
		docJson: _root + 'jsdoccer/generated-files/doc-json/',
		json: _root + 'jsdoccer/generated-files/json/',
		yamlStubbed: _root + 'jsdoccer/generated-files/yaml/stubbed/',
		yamlDocumented: _root + 'jsdoccer/generated-files/ymal/documented/',
		htmlDocumentation: _root + 'jsdoccer/documentation/'
	};


// API
//-----------------------------------------
module.exports = {
	
	// set object state
	init: function init(options) {
		options = options || {};
		this.config = options.config;
		
		// check to see if we are set up
		try {
			var fd = fs.openSync(_config.syntaxMatchers, 'r');
			fs.closeSync(fd);
		}
		catch (err) {
			console.log('Current Working Dir: ' + process.cwd());
			console.log('No "' + _config.syntaxMatchers + '" setting up defaults.');
			fs.copySync(_config.setUpSrc, _config.setUpDest);
			console.log(err);
		}
		
		_astToDocJson.init({
			syntaxMatchers: _config.syntaxMatchers
		});
		
		_docJsonToDocYaml.init({
			templates: _config.yamlTemplates
		});
		
		_prepareYaml.init({
			grunt: options.grunt
		});
		
		_generateDocs.init({
			files: {
				src: _config.docJson,
				dest: _config.htmlDocumentation
			},
			handlebarsTemplate: _config.handlebarsTemplate
		});
	},
	
	// utilities
	saveFile: function(data, file, filepath, extention) {
		var dest = path.join(filepath + path.basename(file, '.js') + extention);
		
		fs.writeFileSync(dest, data);
	},
	
	
	mapFiles: function (dir, process) {
		var self 			= this,
			filesToDocument = fs.readdirSync(dir);
			
		if (filesToDocument.length > 0) {
			filesToDocument.forEach(function(file) { process(file); });
		}
		// bad usage
		else {
			console.warn('No js targets found to document in ' + dir);
			process.exit(1);
		}
	},
	
	// control
	generateStubbedDocYamlFile: function (file) {
		var syntaxTree, lookup, json, docYaml;
	
		// gard: filter files listed in config
		if (_.contains(this.config.filesToFilter, file)) { return; }
		// generate AST
		syntaxTree = _astGenerator.createSyntaxTree(file);
		this.saveFile(JSON.stringify(syntaxTree, null, 2), file, _config.ast, '.ast');
		
		// filter AST and generate syntax target JSON
		_astToDocJson.setFilename(file);
		json = _astToDocJson.parse(syntaxTree);
		this.saveFile(JSON.stringify(json, null, 2), file, _config.json, '.json');
	
		// generate document YAML
		docYaml = _docJsonToDocYaml.convert(json);
		this.saveFile(docYaml, file, _config.yamlStubbed, '.yaml');
	},
	
	
	generateStubbedDocYamlFiles: function (files) {
		this.mapFiles(files, this.generateStubbedDocYamlFile);
	},
	
	
	prepareYaml: function (file) {
		_prepareYaml.prepare(file);
	},
	
	
	prepareYamls: function(files) {
		this.mapFiles(files, this.prepareYaml);
	},
	
	
	generateDoc: function (file) {
		_generateDocs.generate(file);
	},
	
	
	generateDocs: function(files) {
		this.mapFiles(files, this.generateDoc);
	},
	
	
	lintDocumentJson: function() {
		console.log('TODO: Impliment this.');
	}
};
