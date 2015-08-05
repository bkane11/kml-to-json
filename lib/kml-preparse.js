var fs = require('fs')
, path = require('path')
, xml2js = require('xml2js')
, Handler = require('./handlekmlz')
, parser = new xml2js.Parser()
, builder = new xml2js.Builder()
, xml 
, filtered
, inputkml = '../time-stamp-point.kmz'
, overlayTypes = ['Placemark', 'GroundOverlay']
;



function parsePlacemark(placemark){
    if(!placemark.visibility || placemark.visibility && placemark.visibility instanceof Array && placemark.visibility[0] != 0 /* use loose equality to ensure number and string `0` is matched*/ ){
		return placemark
    }
    return false
}

function parseFolder(folder){
	folder.GroundOverlay = folder.GroundOverlay || [];
	folder.Placemark = folder.Placemark || [];
	folder.Folder = folder.Folder || [];
	if(folder.Document)
		folder.Folder.concat(folder.Document)

	overlayTypes.forEach(function(type){
		console.log(type);
		folder.Folder.forEach(function(f){
			f[type] && (folder[type] = folder[type].concat(f[type]));
		})

		if(folder[type] && folder[type] instanceof Array){
			folder[type] = folder[type].filter(function(placemark, pos){
				return parsePlacemark(placemark) && folder.Placemark.indexOf(placemark)==pos
			})
		}
	})

	return (folder.Placemark.length + folder.GroundOverlay.length) > 0
	// return folder.Placemark.length > 0 || folder.GroundOverlay.length > 0
	// return folder.Placemark && folder.Placemark instanceof Array && folder.Placemark.length > 0
}

function parseDoc(doc){
	doc.Folder = doc.Folder.filter(function(folder){
		return parseFolder(folder)
	})

	overlayTypes.forEach(function(type){
		if(doc[type] && doc[type] instanceof Array){
			doc.Folder.concat(
				[ 
					doc[type] = doc[type].filter(function(placemark){
						return parsePlacemark(placemark)
					})
				]
			);
		}
	})
	
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

        console.log('GroundOverlay included?', /GroundOverlay/i.test(filteredkml))

        if(callback && callback instanceof Function)
        	return callback(filteredkml)
    });
}

module.exports = preparse;
