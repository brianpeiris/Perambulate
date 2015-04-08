(function () {
    'use strict';

    var world, timeStep=1/60, camera, scene, renderer,
        actuator, actuator_b;

    initThree();
    initCannon();
    initThings();
    animate();

    function initCannon() {
        world = new CANNON.World();
        world.gravity.set(0,-9.8,0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
    }

    function initThree() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set(20, 10, 10);
        camera.lookAt(scene.position);
        scene.add( camera );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );
    }

    function initThings() {
        actuator = new Actuator();
        world.add(actuator.body);
        scene.add(actuator.mesh);

        actuator_b = new Actuator({amplitude: 0, position: new CANNON.Vec3(0, 5, 0)});
        world.add(actuator_b.body);
        scene.add(actuator_b.mesh);
    }

    var start;
    function animate(timestamp) {
        if (!start) { start = timestamp; }
        var elapsed = timestamp - start;

        actuator.step(elapsed);
        actuator_b.step(elapsed);

        world.step(timeStep);

        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }

    function updatePhysics() {
        // Step the physics world
    }
}());
