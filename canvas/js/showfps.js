// show fps with help from
// https://github.com/mrdoob/stats.js

// Only executed our code once the DOM is ready.
window.onload = function() {
    // ******************************************
    // display some stats
    // https://github.com/mrdoob/stats.js
    const stats = new Stats();
    // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.showPanel(0);
    stats.dom.style.left = 'auto';
    stats.dom.style.right = 0;
    document.body.appendChild( stats.dom );

    function animate() {
        // stats.begin();
        // // monitored code goes here
        // stats.end();
        stats.update();
        requestAnimationFrame( animate );
    }

    requestAnimationFrame( animate );

};
