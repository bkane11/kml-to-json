var fs = require('fs')
, path = require('path')
, togeojson = require('togeojson')
, preparse = require('./kml-preparse')
, inputkml = '../time-stamp-point.kmz'
, jsdom = require('jsdom-no-contextify').jsdom
, jf = require('jsonfile')
, mkdirp = require('mkdirp')
;

function saveFile(filepath, json, options){
	options = options || {};
	// console.log(path);
	
	// ensure `.json` extension
	// if(json.slice(-5)!=='.json')
	// 	json+='.json'
	if(options.filepath)
		filepath = options.filepath

	if(options.makeContainingFolder){
		var base = path.dirname(filepath)
		, name = path.basename(filepath)
		, ext = path.extname(name)
		, folder = path.join(base, name.replace(ext, '') )
		;
		console.log('making', folder)
		mkdirp.sync( folder  )
		if(options.filename)
			filepath = path.join(folder, options.filename);
	}

	if(options.filenameAddition){
		var ext = path.extname(filepath);
		filepath = filepath.replace(ext, options.filenameAddition) + ext
	}

	if(options.lowercase)
		filepath = filepath.toLowerCase()
	// return console.log(filepath)
 
	jf.writeFile(filepath, json, function(err) {
  		if(err)
  			console.log('error saving', filepath, err)
  		console.log('file saved to:', fs.realpathSync(filepath) );
  		// console.log('done', 'file saved to:', path);
	})
}

// strip out features with invalid geometry
// TODO - make sure this works in all cases
function validateCoords(coord){
	if(coord instanceof Array)
		if(coord[0] instanceof Array)
			return validateCoords(coord[0])
		else if(!coord[0])
			return false
	return coord
}

function savegeojson(kml, callback, options){
	var xml = jsdom(kml)
	, geojson = togeojson.kml( xml, { styles: true })
	;
	
	if(geojson.features)
		geojson.features = geojson.features.filter(function(feature){
			return validateCoords(feature.geometry.coordinates)
		})

	if(callback && callback instanceof Function)
		return callback(geojson, options)

	// console.log(geojson);
}


function convert(options, callback){
	options = options || {};
	var inkml = path.normalize(options.input).replace(/\\/g, '/')
	, output = options.output
	;

	if(!callback || !(callback instanceof Function)){
		callback = saveFile.bind(process, output || inkml.replace( path.extname(inkml) , '.json') )
	}
	
	if(!fs.existsSync(inkml)){
		console.warn('ERROR', inkml, 'doesn\'t exist' );
		return callback( { features: [] });
	}

	// console.log('converting', fs.realpathSync(inkml) )

	preparse(options, function(kml, opts){
		savegeojson(kml, callback, opts);
	})
}

function getInputFileFromName(name){
	var base = '../test'
	, suffixes = ['.kml', '.kmz']
	;
	var filepath;

	suffixes.some(function(suffix){
		filepath = path.join(base, name + suffix);
		var exists = fs.existsSync( filepath );
	
		// console.log(filepath, exists ? 'exists' : 'not found' );
		
		if(!exists)
			filepath = null
		return exists;
	})

	return filepath
}

function serve(req, res){
	var name = req.params.name || req.query.name
	, visible = req.params.visible || req.query.visible
	, path = name ? getInputFileFromName( name.trim() ) : inputkml // use default if none specified
	, options = {input : path, visible: visible }
	;
	// console.log('preparing to serve', name, path);

	convert( options, function(json){
		return res.json(json);
	})
}

exports.convert = convert;
exports.serve = serve;

