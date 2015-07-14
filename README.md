Json2dts
=========

Json2dts generates definition files for JSON like data.

Installation
============

```
npm install json2dts -g
```

Alternatively, a web-based version is available at http://xperiments.in/json2dts

Usage
=====
Json2dts can be used either as a command-line application or as a Node.js module. To use the command-line version, invoke the `json2dts` command:

```
$ json2dts --help
Generates definition files for JSON like data.
Usage: json2dts file.json

Options:
  --output, -o     Specifies the file where to write the output
  --interface, -i  Specifies the main interface name
  --help           Show help                                           [boolean]

Examples:
  json2dts -i MainInterface file.json  Creates Typescript Definition file for the json file.json
```

To use the Node.js module:

```
var json2dts = require('./dist/json2dts');
var Json2dts = json2dts.Json2dts;
var toValidJSON = json2dts.toValidJSON;

var content='{point:[{x:0,y:0},{x:1,y:1}]}';

try {
    
    var converter = new Json2dts();
    var text2Obj = JSON.parse(toValidJSON(content));
    if (typeof text2Obj != "string") {
        converter.parse(text2Obj, 'RootJson');
        content = converter.getCode();
    }
    else {
        console.error('Json2dts Invalid JSON');
    }

} catch (e) {
    console.error('Json2dts Invalid JSON error:',e);
}

console.log( content );
```
