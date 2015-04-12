(function () {
    'use strict';
    var CAMERA_OFFSET = new THREE.Vector3(0, 0, 0.25);

    var App = function (width, height, cavnvas) {
        this.width = width;
        this.height = height;
    };

    App.prototype.init = function () {
        this._initThree();
        this._initVR();
        this._initCannon();
        this._initScene();
        this._initLeap();
        this.workbench = new Workbench(
            this.world, this.scene, Leap.loopController);
        this.trigger('initialized');
        this._animate();
    };
    _.extend(App.prototype, Backbone.Events);

    App.prototype._initThree = function () {
        this.camera = new THREE.PerspectiveCamera(
            75, this.width / this.height, 0.1, 100 );
        this.camera.position.add(CAMERA_OFFSET);
        this.renderer = new THREE.WebGLRenderer();

        window.document.body.appendChild(this.renderer.domElement);
    };

    App.prototype._initVR = function () {
        this.controls = new THREE.VRControls(this.camera);

        this.effect = new THREE.VREffect(this.renderer);
        this.effect.setSize(this.width, this.height);

        this.manager = new WebVRManager(this.renderer, this.effect);
    };

    App.prototype.zeroSensor = function () {
        if (this.controls) {
            this.controls.zeroSensor();
        }
    };

    App.prototype._initCannon = function () {
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
    };

    App.prototype._initScene = function () {
        this.scene = new THREE.Scene();

        this.scene.add(new THREE.AmbientLight(0x404040));
        var light = new THREE.DirectionalLight(0xffffff, 0.5);
        light.position.set(10, 10, 0);
        this.scene.add(light);

        var groundShape = new CANNON.Plane();
        this.groundBody = new CANNON.Body({
            mass: 0
        });
        this.groundBody.position.set(0, -1, 0);
        this.groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.groundBody.addShape(groundShape);
        this.world.add(this.groundBody);
        this.groundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200, 8, 8),
            new THREE.MeshLambertMaterial({
                color: 0xe6e6e6, side: THREE.DoubleSide})
        );
        this.scene.add(this.groundMesh);
    };

    App.prototype._initLeap = function () {
        Leap.loop();
        Leap.loopController.use('transform', {
            vr: true,
            effectiveParent: this.camera,
            //vr: 'desktop',
            //position: new THREE.Vector3(0, -0.1, 0)
        });
        Leap.loopController.use('boneHand', {
            scene: this.scene
        });
    };

    App.prototype._animate = function (timestamp) {
        timestamp = timestamp || 0;
        if (!this.start) { this.start = timestamp; }
        var elapsed = timestamp - this.start;

        this.controls.update();
        // if (this.manager.isVRMode()) {
        this.camera.position.add(CAMERA_OFFSET);
        // }

        this.groundMesh.position.copy(this.groundBody.position);
        this.groundMesh.quaternion.copy(this.groundBody.quaternion);

        this.workbench.update(elapsed);

        var TIMESTEP = 1 / 60;
        this.world.step(TIMESTEP, elapsed);

        this.manager.render(this.scene, this.camera);

        requestAnimationFrame(this._animate.bind(this));
    };

    App.prototype.resizeView = function (width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.effect.setSize(this.width, this.height);
    };

    window.App = App;
}());
