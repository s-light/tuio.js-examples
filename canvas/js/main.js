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
    // needed!! - this way item.rotation works as intended :-)
    paper.settings.applyMatrix = false;

    var path = new paper.Path.Line({
        from: [0,0],
        to: [100, 0],
        strokeColor: 'lime'
    });
    path.position = paper.view.center;


	// Draw the view now:
	paper.view.draw();

    paper.view.onFrame = function(event) {
		// On each frame, rotate the path by 3 degrees:
		path.rotate(1);
	};

    // ******************************************
    // setup tuio.js

    console.log("init tuio.js");

    var tuioInput = new TUIOReceiver({ url:"ws://localhost:3334" });

    tuioInput.oscPort.on("open", function (msg) {
        // console.log("osc open", msg);
        console.log("osc open");
    });
    tuioInput.oscPort.on("close", function (msg) {
        // console.log("osc close", msg);
        console.log("osc close");
    });

    tuioInput.open();

    // ******************************************
    // show positions of all default tuio profile events:

    // based on http://www.tuio.org/?specification
    //  Profiles and there available Values:
    //
    //      2D obj:  i x y   a             X Y   A     m r
    //      2D cur:    x y                 X Y         m
    //      2D blb:    x y   a     w h   f X Y   A     m r
    //     25D obj:  i x y z a             X Y Z A     m r
    //     25D cur:    x y z               X Y Z       m
    //     25D blb:    x y z a     w h   f X Y Z A     m r
    //      3D obj:  i x y z a b c         X Y Z A B C m r
    //      3D cur:    x y z               X Y Z       m
    //      3D blb:    x y z a b c w h d v X Y Z A B C m r
    //
    // semantic types of set messages
    //     i          Class ID (e.g. marker ID)                                int32
    //     x, y, z    Position                                                 float32, range 0...1
    //     a, b, c    Angle                                                    float32, range 0..2PI
    //     w, h, d    Dimension                                                float32, range 0..1
    //     f, v       Area, Volume                                             float32, range 0..1
    //     X, Y ,Z    Velocity vector (motion speed & direction)               float32
    //     A, B, C    Rotation velocity vector (rotation speed & direction)    float32
    //     m          Motion acceleration                                      float32
    //     r          Rotation acceleration                                    float32
    //

    function tuio2paperjsPosition(x, y) {
        const bounds = paper.view.bounds;
        const resultPoint = new paper.Point(
            bounds.width * x,
            bounds.height * y
        );
        return resultPoint;
    }

    function tuio2paperjsSize(w, h) {
        const bounds = paper.view.bounds;
        const resultSize = new paper.Size(
            bounds.width * w,
            bounds.height * h
        );
        return resultSize;
    }

    function tuio2paperjsRotation(a) {
        // a 0..2Pi 0=12o'clock
        // paperjs: 0..360 0°= 3o'clock
        // 2Pi == 360
        //  a == result
        let resultAngle = (360 * a) / (2 * Math.PI);
        // now we need to add the 90° 0point offset
        resultAngle -= 90;
        // this means our range is now
        // -90 .. 270
        // that is fine for paperjs.
        return resultAngle;
    }

    function createObj(event) {
        // console.log("createObj");

        const smallEdge = Math.min(
            paper.view.bounds.height,
            paper.view.bounds.width
        ) / 4;

        const groupElements = [];

        // add sessionID
        const labelSessionID = new paper.PointText({
            point: [0, 0],
            fillColor: 'white',
            content: event.sessionID
        });
        labelSessionID.name = "sessionID";
        groupElements.push(labelSessionID);

        // find profileType
        const re = /(obj|cur|blb)/i;
        // http://exploringjs.com/es6/ch_destructuring.html#_destructuring-returned-arrays
        const [, profileType] = event.profileName.match(re) || [];
        // console.log("profileType", profileType);

        switch (profileType) {
            case 'obj': {
                // rounded rectangle
                const shape =  new paper.Path.Rectangle({
                    point: [0, 0],
                    size: [smallEdge, smallEdge],
                    radius: smallEdge/5,
                    strokeColor: '#0000ff'
                });
                shape.name = "shape";
                // move so that the center is at [0, 0]
                shape.position = new paper.Point();
                // set rotation
                shape.rotation = tuio2paperjsRotation(event.values.a);
                groupElements.push(shape);
                const labelClassID = new paper.PointText({
                    point: [0, 0],
                    fillColor: 'white',
                    content: event.values.i
                });
                labelClassID.name = "classID";
                // move down
                labelClassID.bounds.center.y = (
                    labelClassID.bounds.center.y + labelSessionID.bounds.height
                );
                groupElements.push(labelClassID);
            } break;
            case 'cur': {
                const shape = new paper.Path.Circle({
                    center: [0, 0],
                    radius: smallEdge/5,
                    strokeColor: '#00ff00'
                });
                shape.name = "shape";
                groupElements.push(shape);
            } break;
            case 'blb': {
                // console.log("create blb");
                // const size = tuio2paperjsSize(event.values.w, event.values.h);
                // console.log("size", size);
                const shape = new paper.Path.Ellipse({
                    point: [0, 0],
                    // size: size,
                    size: [100, 100],
                    strokeColor: '#00ffff'
                });
                shape.name = "shape";
                // move so that the center is at [0, 0]
                shape.position = new paper.Point();
                // set rotation
                shape.rotation = tuio2paperjsRotation(event.values.a);
                // set size - this way we use the same 'function' everytime..
                shape.bounds.size = tuio2paperjsSize(event.values.w, event.values.h);
                groupElements.push(shape);
            } break;
            default:
                console.log("unknown profileName.");
        } // switch end

        // console.log("test");
        const group = new paper.Group(groupElements);
        // set group position
        const pos = tuio2paperjsPosition(event.values.x, event.values.y);
        group.position = pos;

        return group;
    }

    // store created objects
    let tuioObjList = new Map();


    // event:
    // let eventObject = {
    //     origin: this,
    //     source: source,
    //     eventType: eventType,
    //     profileName: profileName,
    //     sessionID: sessionID,
    //     values: values
    // };

    function handleTUIOEvent(event) {
        // console.log("handleTUIOEvent", event);
        // console.log("handleTUIOEvent", event.sessionID);
        // console.log("handleTUIOEvent", event.sessionID, event.eventType);

        // get current list or initalize it.
        let currList = tuioObjList.get(event.profileName);
        if (currList === undefined) {
            tuioObjList.set(event.profileName, new Map());
            currList = tuioObjList.get(event.profileName);
        }

        if (currList) {
            const currentObj = currList.get(event.sessionID);
            if (currentObj) {
                switch (event.eventType) {
                    case 'Set': {
                        // console.log("currentObj", currentObj);
                        const posNew = tuio2paperjsPosition(event.values.x, event.values.y);
                        // console.log("posNew", posNew);
                        // console.log("currentObj.position", currentObj.position);
                        const delta = posNew.subtract(currentObj.position);
                        // console.log("delta", delta);
                        currentObj.translate(delta);
                        // check if event contains angle/rotation information
                        if (event.values.a) {
                            // console.log("currentObj.rotation", currentObj.rotation);
                            // const shape = currentObj.children['shape'];
                            const shape = currentObj.children.shape;
                            // console.log("shape.rotation", shape.rotation);
                            // const newAngle = tuio2paperjsRotation(event.values.a);
                            // console.log("newAngle", newAngle);
                            // shape.rotation = newAngle;
                            shape.rotation = tuio2paperjsRotation(event.values.a);
                            // console.log("tuio2paperjsRotation(event.values.a)", tuio2paperjsRotation(event.values.a));
                        }
                        // check if event contains width & height information
                        if (event.values.w && event.values.h) {
                            // console.log("currentObj.rotation", currentObj.rotation);
                            // const shape = currentObj.children['shape'];
                            const shape = currentObj.children.shape;
                            // const size = tuio2paperjsSize(event.values.w, event.values.h);
                            // console.log("size", size);
                            // console.log("shape.bounds.size", shape.bounds.size);
                            // console.log("shape.rotation", shape.rotation);
                            shape.bounds.size = tuio2paperjsSize(event.values.w, event.values.h);
                            // shape.?? = tuio2paperjsPosition(event.values.w, event.values.h);
                        }
                    } break;
                    case 'Del': {
                        currentObj.remove();
                        currList.delete(event.sessionID);
                    } break;
                    default:
                        console.log("unknown eventType.");
                } // switch end
            } else {
                if (event.eventType == 'Add') {
                    const newObj = createObj(event);
                    currList.set(event.sessionID, newObj);
                }
            }
        }
    }


    // catch all tuio 2D|25D|3D  cur|obj|blb  Add|Set|Del events
    // console.log("TUIOEventRegEx", TUIOEventRegEx);
    tuioInput.addListener(TUIOEventRegEx, handleTUIOEvent);

    // catch all tuio 2D Add/Set/Del events (cur, obj, blb)
    // tuioInput.addListener(/tuio2D\D{3}Add/, handleTUIOEvent);
    // tuioInput.addListener(/tuio2D\D{3}Set/, handleTUIOEvent);
    // tuioInput.addListener(/tuio2D\D{3}Del/, handleTUIOEvent);



};
