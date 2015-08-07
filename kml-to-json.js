#!C:/Program Files (x86)/nodejs/node.exe
'use strict';

var ArgumentParser = require('argparse').ArgumentParser
, path = require('path')
, fs = require('fs')
, _ = require('underscore')
, kmlz2geojson = require('./lib/kmlz-to-geojson')
, parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Convert kmls/kmzs to geojson'
})
, input
, output
;

parser.addArgument(
  [ '-i', '--input' ],
  {
    help: 'Input file'
  }
);
parser.addArgument(
  [ '-o', '--output' ],
  {
    help: 'Output file'
  }
);
parser.addArgument(
  [ '-iv', '--visible' ],
  {
    action: 'storeTrue'
    , help: 'Only keep features set as visible in the input kmlz'
  }
);

var args = parser.parseKnownArgs();
var options = args[0];
// var args = parser.parseArgs();


function getCaller() {
  var stack, traceFn;
  traceFn = Error.prepareStackTrace;
  Error.prepareStackTrace = function(err, stack) {
    return stack;
  };
  stack = (new Error()).stack;
  Error.prepareStackTrace = traceFn;
  return stack[2].getFileName();
};


if(!options.input){
  var lastarg = _.last(args);
  lastarg = lastarg && lastarg[0];
  // console.log( lastarg )
  options.input = lastarg;
}

if(!options.input){
  throw 'Oops, no input specified'
}

// important to trim the path 
options.input = options.input.trim()

// console.log(2, path.dirname(getCaller()), __dirname, process.cwd());

if( !fs.existsSync(options.input) ){
  var bases = [path.dirname(getCaller()), __dirname, process.cwd()]
  bases.forEach(function(base){
    // if(!base) return 
    console.log('what are you trying to do with', base, 'and', options.input, '?')
    var resolved = path.resolve(base, options.input);
    if(fs.existsSync( resolved ))
      return options.input = resolved;
  })
}

if(options.output){
  options.output = options.output.trim();
  if(!fs.existsSync(options.output) ){
    var bases = [path.dirname(getCaller()), __dirname, process.cwd()]
    bases.forEach(function(base){
      var resolved = path.resolve(base, options.output);
      if(fs.existsSync( resolved ))
        return options.output = resolved;
    })
  }
}

console.log('running kml-to-json with arguments:')
console.dir(options);
console.log('...');

kmlz2geojson.convert( options );


