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
        world.gravity.set(0, -9.8, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
    }

    function initThree() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set(10, 10, 10);
        camera.lookAt(scene.position);
        camera.translateZ(20);
        scene.add( camera );

        scene.add(new THREE.PointLight());

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );
    }

    var groundBody, groundMesh;
    function initThings() {
        var groundShape = new CANNON.Plane();
        groundBody = new CANNON.Body({
            mass: 0
        });
        groundBody.position.set(0, -5, 0);
        groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        groundBody.addShape(groundShape);
        world.add(groundBody);

        groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200, 8, 8),
            new THREE.MeshBasicMaterial({color: 'blue', side: THREE.DoubleSide})
        );
        scene.add(groundMesh);

        actuator = new Actuator();
        world.add(actuator.body);
        scene.add(actuator.mesh);

        actuator_b = new Actuator({amplitude: 0, position: new CANNON.Vec3(0, 20, 3)});
        world.add(actuator_b.body);
        scene.add(actuator_b.mesh);
    }

    var start;
    function animate(timestamp) {
        if (!start) { start = timestamp; }
        var elapsed = timestamp - start;

        actuator.step(elapsed);
        actuator_b.step(elapsed);
        groundMesh.position.copy(groundBody.position);
        groundMesh.quaternion.copy(groundBody.quaternion);


        world.step(timeStep);

        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }
}());
