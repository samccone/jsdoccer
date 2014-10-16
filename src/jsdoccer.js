'use strict';

// Dependencies
//-----------------------------------------
var fs 		= require('fs'),
	path 	= require('path'),
	esprima = require('esprima'),
	_ 		= require('lodash'),
	
	// dependency injection
	AstGenerator 		= require('./lib/ast-generator.js'),
	AstToDocJson 		= require('./lib/ast-to-doc-json.js'),
	DocJsonToDocYaml 	= require('./lib/doc-json-to-doc-yaml.js'),

	// vars
	JsDoccer;


// constructor
//-----------------------------------------
JsDoccer = function(options) {
	options 	= options || {};
	this.config = options.config;
	
	// dependency injection
	this.astGenerator 		= AstGenerator;
	this.astToDocJson 		= new AstToDocJson({syntaxMatchers: options.syntaxMatchers});
	this.docJsonToDocYaml 	= new DocJsonToDocYaml({config: options.config});
};


// functions
//-----------------------------------------
_.extend(JsDoccer.prototype, {
	
	
	_saveFile: function(data, filename, filepath, extention) {
		var dest = path.join(filepath + path.basename(filename, '.js') + extention);
		
		fs.writeFileSync(dest, data);
		console.info('save: ' + dest);
	},



	generateStubbedDocYamlFile: function (filename) {
		var syntaxTree, lookup, json, docYaml;

		// gard: filter files listed in config
		if (_.contains(this.config.filesToFilter, filename)) { return; }

		// generate AST
		syntaxTree = this.astGenerator.createSyntaxTree(path.join(this.config.js.src + filename));
		this._saveFile(JSON.stringify(syntaxTree, null, 2), filename, this.config.ast.dest, '.ast');

		// filter AST and generate syntax target JSON
		json = this.astToDocJson.parse(syntaxTree);
		this._saveFile(JSON.stringify(json, null, 4), filename, this.config.json.dest, '.json');

		// generate document YAML
		docYaml = this.docJsonToDocYaml.convert(json);
		this._saveFile(docYaml, filename, this.config.yaml.dest, '.yaml');

		// adding new line for readability
		console.log();
	},
	
	
	
	generateStubbedDocYamlFiles: function () {
		var self 			= this,
			filesToDocument = fs.readdirSync(this.config.js.src);
			
			
		if (filesToDocument.length > 0) {
			filesToDocument.forEach(function(file) { self.generateStubbedDocYamlFile(file); });
		}
		// bad usage
		else {
			console.warn('No js targets found to document in ' + this.config.js.src);
			process.exit(1);
		}
	},
	
	lintDocumentJson: function() {
		console.log('TODO: Impliment this.');
	}
});


// API
//-----------------------------------------
module.exports = JsDoccer;
