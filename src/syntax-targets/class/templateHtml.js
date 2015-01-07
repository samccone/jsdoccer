'use strict';

var fs = require('fs'),
	path = require('path'),
	Handlebars = require('handlebars'),
	constructorsTemplater = require('../constructors/templateHtml.js'),
	eventTemplater = require('../events/templateHtml.js'),
	propertyTemplater = require('../properties/templateHtml.js'),
	functionTemplater = require('../functions/templateHtml.js'),
	htmlTemplateLoader = require('../../util/html-template-loader.js');

module.exports = function(model) {
	var template = htmlTemplateLoader(path.join(__dirname, 'templates/html.hbs'));
	
	model['constructors'] = constructorsTemplater(model);
	model.events = eventTemplater(model);
	model.properties = propertyTemplater(model);
	model.functions = functionTemplater(model);
	
	console.log(model.description);
	
	return template(model);
};