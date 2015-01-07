### This is a work in progress. At the moment it is currently setup to document [backbone.marionette](https://github.com/marionettejs/backbone.marionette).

#### Goals:
- [x] generate stubbed YAML documentation template
- [x] build document webpages from JSDoc
- [ ] lint existing documents

**There have been some major changes between 1.0 and 1.1 and 1.2. This is a pure Node.js tool now. If you are looking for a Grunt task you can find it at [grunt-jsdoccer](https://github.com/ChetHarrison/grunt-jsdoccer).

A collaboration with [@jasonLaster](https://github.com/jasonLaster)

# JsDoccer

 A collection of Node.js tasks to auto document your ECMAScript (Java Script) in  [JSDoc 3](https://github.com/jsdoc3/jsdoc3.github.com) using [Esprima](http://esprima.org/) and [ESCodeGen](https://github.com/Constellation/escodegen) as well as lint those docs. It converts your code into YAML templates that (will be) converted to JSDocs. The YAML stage allows you to fill in stubbed examples and other details that cannot be generated from the provided Esprima code meta data.


### Basic Usage

Setup

```
$ npm install jsdoccer
```

1) Create stubbed YAML document templates.

```
$ node node_modules/jsdoccer/stub [<path/to/files/you/want/to/doc/globaway/**/*.js>]
```

The first time you run this command the tool will search for a `jsdoccer/syntaxMatchers.js` file at the root of your project directory. if it is not found it will copy the `setup` directory into a `jsdoccer` directory at the project root containing the default syntax matchers and templates. You can then customize them to suit your style of code. **Note:** currently, if you delete the `syntaxMatchers.js` file it will generate a new `jsdoccer` folder with all the defaults and you will loose any custom augmentations you have made to your YAML templates. Once you have generated the stubbed YAML templates you will find them in the `jsdoccer/generated-files/yaml/stubbed` directory. You will need to move them to `jsdoccer/generated-files/yaml/documented` directory before you augment them so you don't accidentally over write them by running the task again. **If you forget to move them you will not be able to generate the documents!**

2) Generate documents.

```
$ node node_modules/jsdoccer/doc [<path/to/yaml/you/want/to/doc>]
```

Generated documents can be found in the `doccer/docs` folder (or where ever you configured the destination).

### Configuration

The `./jsdoccerrc` file contains configuration for the tool. If no files are provided on the command line the tool will glob the files listed in the `js` directory for target files. In the generate documentation phasethe tool will look for your augmented YAML in the globs configured under the `documentedYaml` argument. All intermediate files are saved under the `dest` path. These are useful for debug.

Syntax targets are specific types of code you would like to document like *functions* or *properties*. JsDoccer comes with the following targets that you include or ignore based on a boolean under the `targets/defaut`. They are

* name
* class
* constructors
* events
* functions
* properties

### Extention

__Note: I am currently working on the code to extend the tool right now__

JsDoccer uses a collection of templates and functions designed to find syntax targets and render them. You can use what ever templating library you are comfortable with, however with nested templates I recomend [Handelbars](http://handlebarsjs.com/) support of partials.

Each syntax target requires a YAML template for creating the document stubs and an HTML template for creating the documentation as well as functions to render them. You will also need to provide a matcher function that can parse an AST node looking for the target. You may optionally provide a linter function if you would like to use the linter. All of the default target code can be found under `scr/syntax-targets` for examples. This is also where the documentation website index template `docs-index.hbs` lives.

Add custom targets to your `.jsdoccerrc` file under `targets/custom` with a true value. __Make sure the file name matches target name.__

### What You Need To Know About ASTs

An AST or Abstract Syntax Tree is a typed representation of valid code. Esprima will parse valid ECMAScript and generate an AST. ESCodeGen provides an "inverse" operation that will generate valid ECMAScript from Esprima ASTs.

Esprima will parse this Javascript:

```
var answer = 42;
```

and generate this AST:

```
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "answer"
          },
          "init": {
            "type": "Literal",
            "value": 42,
            "raw": "42"
          }
        }
      ],
      "kind": "var"
    }
  ]
}
```

AST types are defined by the [Spider Monkey Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions). 

#### Target Syntax Matchers

In order to find syntax targets you can create a custom document "type" by adding a type attribute and associated matching function to the `jsdoccer/syntax-matchers.js` hash for example:


```
module.exports = {
    functions: function(ast) {
      var json = [ast].
        filter(function (ast) {
          return ast.type === 'Property' &&
            ast.value.type === 'FunctionExpression' &&
            ast.key.type === 'Identifier' &&
            ast.key.name !== 'constructor'; // filter named constructors
        }).
        map(function(property) {
          return {
            name: property.key.name,
            tags: [property.key.name.indexOf('_') === 0 ? ['@api private'] : ['@api public'],
              property.value.params.
              filter(function (param) {
                return param.type === 'Identifier';
              }).
              map(function (param) {
                return '@param {<type>} ' + param.name + ' - ';
              }),
              _hasReturn(property.value.body.body) ? ['@returns {<type>} -'] : []
            ].mergeAll()
          };
        });
        
      if (json.length > 0) {
        return json.pop();
      }
      
      return false;
    }
  };
```
**Note**: I am using map/reduce to produce exactly the JSON I need here. You could just as easily use regex or even string matching to identify a target case and return the current unfiltered AST node containing all the data your template requires.

The script will recursively walk the ASTs of each file passing every node to each match function. Each match function should return `false` or a valid JSON object containing all of the data the associated YAML template requires. While you can certainly return the raw AST node, I recommend you filter and organize your JSON here rather than in the template.

To find out the AST conditions that match the code you would like to document compare your code with the ASTs saved in the `ast` directory. Then you will have a predictable AST JSON structure to query in an associated template for each document type.

#### Parse JSON like a champ

Map/Reduce is your friend when you need to pull deeply nested targets out of a large amount of JSON. I use a modified Array with the 5 magic RX methods attached. I highly recommend you spend a little time with [this excellent tutorial](http://reactive-extensions.github.io/learnrx/) from Jafar Husain of Netflix **Note: Do it in Chrome. It doesn't work in Firefox.** Then you will be able to inspect the generated AST files in the `ast` directory and write your own custom matchers in the `syntax-matchers.js` file.

Example:

`functions.tpl` referenced in the `syntax-matchers.js` hash above will search for this template in the `jsdoccer/templates/yaml` dir specified in the `.jsdoccerrc` file above. **Note the indentation of the loop to populate the template with `param` values.**

```
<%- id %>
  description: | <% params.forEach(function(param) {%>
    @param {type} <%= param %> - <param description> <%}); %>
  
  examples:
    -
      name: Function Body
      example: |
```

Here is a sample of the yaml produced:

```
unbindFromStrings
  description: | 
    @param {type} target - <param description> 
    @param {type} entity - <param description> 
    @param {type} evt - <param description> 
    @param {type} methods - <param description> 
  
  examples:
    -
      name: 
      example: |
```
