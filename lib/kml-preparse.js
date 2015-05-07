var fs = require('fs')
, path = require('path')
, xml2js = require('xml2js')
, Handler = require('./handlekmlz')
, parser = new xml2js.Parser()
, builder = new xml2js.Builder()
, xml 
, filtered
, inputkml = '../time-stamp-point.kmz'
;

function parsePlacemark(placemark){
    if(!placemark.visibility || placemark.visibility && placemark.visibility instanceof Array && placemark.visibility[0] != 0 /* use loose equality to ensure number and string `0` is matched*/ ){
		return placemark
    }
    return false
}

function parseFolder(folder){
	folder.Placemark = folder.Placemark || [];
	folder.Folder = folder.Folder || [];
	if(folder.Document)
		folder.Folder.concat(folder.Document)

	folder.Folder.forEach(function(f){
		f.Placemark && (folder.Placemark = folder.Placemark.concat(f.Placemark));
		// console.log('*', folder.name[0], /*f.Placemark,*/ folder.Placemark)
	})

	// console.log('folder.name', folder.name[0], folder.Placemark && folder.Placemark.length)
	if(folder.Placemark && folder.Placemark instanceof Array){
		folder.Placemark = folder.Placemark.filter(function(placemark, pos){
			return parsePlacemark(placemark) && folder.Placemark.indexOf(placemark)==pos
		})
	}

	return folder.Placemark && folder.Placemark instanceof Array && folder.Placemark.length > 0
}

function parseDoc(doc){
	doc.Folder = doc.Folder.filter(function(folder){
		return parseFolder(folder)
	})

	if(doc.Placemark && doc.Placemark instanceof Array){
		doc.Folder.concat(
			[ 
				doc.Placemark = doc.Placemark.filter(function(placemark){
					return parsePlacemark(placemark)
				})
			]
		);
	}
	
	return doc.Folder && doc.Folder instanceof Array && doc.Folder.length > 0
}

function filterForVisibility(kmlobj){
	kmlobj.kml.Document = kmlobj.kml.Document.filter(function(doc){
		return parseDoc(doc)
	})
	return kmlobj
}

function preparse(options, callback){
	var inkmlz = options.input || inputkml;
	options.callback = callback;

	if (!checkForKMZ(inkmlz))
		return handlekml(inkmlz, options);

	var handler = new Handler();
	handler.on('end', function(data){
		parseData(data, options);
	}).handle(inkmlz);
}

function checkForKMZ(file){
	return path.extname(file)==='.kmz'
}

function handlekml(kml, options){
	fs.readFile(kml, function(err, data) {
		if(err)
			return console.log(err)
		else
			return parseData(data, options)
	});
}

function parseData(data, options){
	var callback = options.callback;
    parser.parseString(data, function (err, result) {

    	if(options.visible)
    		result = filterForVisibility(result)

        var filteredkml = builder.buildObject(result);

        if(callback && callback instanceof Function)
        	return callback(filteredkml)
    });
}

module.exports = preparse;
