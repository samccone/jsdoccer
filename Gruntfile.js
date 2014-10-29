'use strict';

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['./src/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'clean:build']
		},

		clean: {
			build: ['./ast/*', './jsdoc/*', './json/*', './yaml/*']
		},

		jasmine_node: {
			coverage: {},
			options: {
				forceExit: true,
				match: '.',
				matchall: false,
				extensions: 'js',
				specNameMatcher: 'spec',
				jUnit: {
					report: true,
					savePath: './build/reports/jasmine/',
					useDotNotation: true,
					consolidate: true
				}
			},
			all: ['tests/specs/']
		},

		plato: {
			report: {
				options: {
					jshint: grunt.file.readJSON('.jshintrc')
				},
				files: {
					reports: ['syntax-matchers.js', '<%= jshint.files %>']
				}
			}
		},
		
		jsSourceToStubDocYaml: {
			doc: {
				options: {
					ast: {
						dest: './ast/',
						save: true
					},
					json: {
						dest: './json/',
						save: true
					},
					yaml: {
						templates: './templates/yaml/',
						src: '.yaml/doccumented-src/',
						dest: './yaml/stubbed-dest/'
					},
					syntaxMatchers: {
						src: './syntax-matchers.js'
					},
					filesToFilter: [
						'.DS_Store',
						'filter-this.js'
					]
				},
				files: [{
					expand: true,
					src: 'js/*.js'
				}]
			}
		},
		
		jsDoccerJson: {
			doc: {
				options: {},
				files: [{
					expand: true,
					cwd: 'yaml/doccumented-src',
					src: '*.yaml',
					dest: 'doc-json',
					ext: '.json'
        		}]
			}
		},
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('yaml', 'Build stubbed YAML files.', ['jsDoccerYaml']);
	grunt.registerTask('json', 'Build jsdoc JSON files.', ['jsDoccerJson']);
	grunt.registerTask('test', 'Lint, hint, test, coverage, and complexity.', ['jshint', 'jasmine_node']);
	grunt.registerTask('default', 'Run test suite.', ['jasmine_node']);
};
