# tuio.js-examples
examples for tuio.js

clone or download this repository.

install dependencies with [bower](https://bower.io/):
`tuio.js-examples$ bower install`

all the examples require a WebSocket TUIO Server that is reachable on ws://localhost:3334.  
(you can change this in the scripts.)

I tested this with the great reacTIVision software.  
make sure you change the port for the WebSocket server in the `reacTIVision.xml`:  
example: `<tuio type="web" port="3334"/>`

Alternative you can use the [SimpleSimulator](https://github.com/mkalten/TUIO11_CPP) in the CPP reference implementation. the WebSocket port for this can be changed in the source ([SimpleSimulator.cpp line 408](https://github.com/mkalten/TUIO11_CPP/blob/master/SimpleSimulator.cpp#L408) it defaults to 8080).

use some sort of webserver to view the examples:  
for example [python2 SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html)  
`tuio.js-examples$ python2 -m SimpleHTTPServer 8000`  
or [python3 http.server](https://docs.python.org/3.6/library/http.server.html)  
`tuio.js-examples$ python3 -m http.server 8000`   

then go to http://localhost:8000  
there you will get a basic directory listing. search for the example you want to try.  
the simplest one is 'simple':  
It Shows the events in the browser console. nothing more ;-)
