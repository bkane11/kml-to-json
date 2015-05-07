## Convert km(*l*|*z*)s to geojson from command line


####Args
* -iv, --visible : only keep visible features
* -o, --output : output file path
* -i, --input : input file path *(will also default to the last input argument if not a defined argument)*



####Run
convert all features:
```
node kml-to-json "./path/to/the.kml"
```
or
```
node kml-to-json -i "./path/to/the.kml"
```
or
```
node kml-to-json -o "./path/to/the/output.json" -i "./path/to/the.kml"
```
=========================

convert and save only visible features:
```
node kml-to-json --visible -o "./path/to/the/output-visible.json"  "./path/to/the.kml"
```
