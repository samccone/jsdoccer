'use strict';

// Dependencies
var _ = require('lodash'),

	fs = require('fs'),
	
	_s = require('underscore.string'),
	
	indentString = require('indent-string'),

	DocJsonToDocYaml;
	
// constructor
//-----------------------------------------
DocJsonToDocYaml = function(options) {
	options = options || {};
	
	this.config = options.config;
};

// functions
//-----------------------------------------
_.extend(DocJsonToDocYaml.prototype, {
	
	getTemplateName: function (type) {
		var path = _s.dasherize(type);
		

		path = path[0] === '-' ? path.substr(1) : path;

		path = this.config.yaml.templates + '/' + path + '.tpl';


		return path;
	},
	
	getTemplate: function (type) {
		// TODO: Make this more robust with Node Path lib
		var filename = this.getTemplateName(type),

			fs = require('fs'),

			file = __dirname + 'filename';


		return fs.readFileSync(filename, 'utf8');
	},
	
	convert: function (json) {
		var yaml = '',

			syntaxTypes = _.keys(json),
			
			self = this;


		_.each(syntaxTypes, function (type) {

			var template = self.getTemplate(type),

				syntaxJsons = json[type];

			// add type category
			yaml += type + ':\n';

			_.each(syntaxJsons, function (syntaxJson) {

				yaml += indentString(_.template(template, syntaxJson), ' ', 2);

				yaml += '\n';

			});

		});


		return yaml;
	}
	
});

// API
//-----------------------------------------
module.exports = DocJsonToDocYaml;