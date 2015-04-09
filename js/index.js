(function () {
    'use strict';

    var
        world, timeStep=1/60,
        camera, scene, controls, effect, renderer, manager,
        actuator_a, actuator_b;

    initThree();
    initCannon();
    initThings();
    document.querySelector('.loading-indicator').style.display = 'none';
    animate();

    function initCannon() {
        world = new CANNON.World();
        world.gravity.set(0, -9.8, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
    }

    function initThree() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set(10, 10, 10);
        camera.lookAt(scene.position);
        camera.translateZ(20);

        controls = new THREE.VRControls(camera);

        scene.add(new THREE.AmbientLight(0x404040));
        var light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(10, 10, 0);
        scene.add(light);

        renderer = new THREE.WebGLRenderer();
        effect = new THREE.VREffect(renderer);
        effect.setSize( window.innerWidth, window.innerHeight );

        manager = new WebVRManager(renderer, effect);

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
            new THREE.MeshLambertMaterial({color: 0xe6e6e6, side: THREE.DoubleSide})
        );
        scene.add(groundMesh);

        actuator_a = new Actuator();
        world.add(actuator_a.body);
        scene.add(actuator_a.mesh);

        actuator_b = new Actuator({amplitude: 0, position: new CANNON.Vec3(0, 10, 0)});
        world.add(actuator_b.body);
        scene.add(actuator_b.mesh);

        world.addConstraint(actuator_a.addTopActuator(actuator_b));
    }

    var start;
    function animate(timestamp) {
        timestamp = timestamp || 0;
        if (!start) { start = timestamp; }
        var elapsed = timestamp - start;

        controls.update();

        actuator_a.step(elapsed);
        actuator_b.step(elapsed);
        groundMesh.position.copy(groundBody.position);
        groundMesh.quaternion.copy(groundBody.quaternion);

        world.step(timeStep);

        manager.render(scene, camera);

        requestAnimationFrame(animate);
    }

    function resizeScene() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        effect.setSize( window.innerWidth, window.innerHeight );
    }

    window.addEventListener('resize', resizeScene, false);
}());
