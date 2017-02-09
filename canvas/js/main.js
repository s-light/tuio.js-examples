// example usage of tuio.js in combination with paper.js / canvas

// Only executed our code once the DOM is ready.
window.onload = function() {

    console.log("start tuio.js-example 'canvas' ...");


    // first setup paper.js
    console.log("init paper.js");

    // based on
    // http://paperjs.org/tutorials/getting-started/using-javascript-directly/

	// Get a reference to the canvas object
	var canvas = document.getElementById('myCanvas');
	// Create an empty project and a view for the canvas:
	paper.setup(canvas);

	// Create a Paper.js Path to draw a line into it:
	var path = new paper.Path();
	// Give the stroke a color
	path.strokeColor = 'lime';
	var start = new paper.Point(100, 100);
	// Move to start and draw a line from there
	path.moveTo(start);
	// Note that the plus operator on Point objects does not work
	// in JavaScript. Instead, we need to call the add() function:
	path.lineTo(start.add([ 200, -50 ]));

	// Draw the view now:
	paper.view.draw();

    paper.view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		path.rotate(3);
	};

    // ******************************************
    // setup tuio.js
    var tuioInput = new TUIOReceiver({ url:"ws://localhost:3334" });

    tuioInput.oscPort.on("open", function (msg) {
        console.log("osc open", msg);
    });
    tuioInput.oscPort.on("close", function (msg) {
        console.log("osc close", msg);
    });


    function positionTUIO2paperjs(x, y) {
        let bounds = paper.view.bounds;
        let resultPoint = new paper.Point(
            bounds.width * x,
            bounds.height * y
        );
        return resultPoint;
    }

    // show positions of all default tuio profile events:

    // store created objects
    let objList = new Map();
    // let curList = new Map();
    // let blbList = new Map();

    // catch all tuio 2D Add events (cur, obj, blb)
    tuioInput.addListener(/tuio2D\D{3}Add/, function (event) {
        console.log("Add", event);
        console.log("Add", event.sessionID);

        const newObj = paper.Path.Rectangle({
            point: positionTUIO2paperjs(event.values.x, event.values.y),
            size: [100, 150],
            strokeColor: 'lime'
        });
        objList.set(event.sessionID, newObj);
    });

    tuioInput.addListener(/tuio2D\D{3}Set/, function (event) {
        // console.log("Set", event);
        // console.log("Set", event.sessionID);

        const currentObj = objList.get(event.sessionID);
        if (currentObj) {
            // console.log("currentObj", currentObj);
            const posNew = positionTUIO2paperjs(event.values.x, event.values.y);
            // console.log("posNew", posNew);
            // console.log("currentObj.position", currentObj.position);
            const delta = posNew.subtract(currentObj.position);
            // console.log("delta", delta);
            currentObj.translate(delta);
        }

    });

    tuioInput.addListener(/tuio2D\D{3}Del/, function (event) {
        console.log("Del", event);
        // console.log("Del", event.sessionID);

        const currentObj = objList.get(event.sessionID);
        if (currentObj) {
            currentObj.remove();
            objList.delete(event.sessionID);
        }

    });


};
