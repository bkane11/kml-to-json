var unzip = require('unzip')
, fs = require('fs')
, path = require('path')
, test = '../test/placemark.kml'
// , test = '../radio-hide-children.kml'
// , test = '../space-needle.kml'
// , test = '../time-span-overlay.kml'
// , test = '../usa-ca-sf.kml'
, testzip = '../time-stamp-point.kmz'
, xml2js = require('xml2js')
, parser = new xml2js.Parser()
, events = require('events')
;

function Handler(options){
	this.options = options;
	events.EventEmitter.call(this);
}

Handler.prototype = {
	__proto__ : events.EventEmitter.prototype
	, handle : function(file){
		var self = this
		, bufs = [];
		fs.createReadStream(file)
			.pipe(unzip.Parse())
			.on('entry', function(entry){
				var fileName = entry.path;
				if(path.extname(fileName)==='.kml'){
					// console.log(fileName);
					entry.on('data', function(data){
						bufs.push(data);
					})
					.on('end', function(){
						var buf = Buffer.concat(bufs);
						self.emit('end', buf)
					});
				}
				entry.autodrain();
			})
		return this
	}
}


// var handler = new Handler({});
// console.dir(handler);

// handler.handle(testzip);
// handle(test);

module.exports = Handler;