(function () {
    'use strict';
    var CAMERA_OFFSET = new THREE.Vector3(0, 0, 0.5);

    var App = function (width, height, scene, camera, renderer) {
        this.width = width;
        this.height = height;
        this.scene = scene;
        this.renderer = renderer;
    };
    _.extend(App.prototype, Backbone.Events);

    App.prototype.init = function () {
        this._initThree();
        this._initVR();
        this._initCannon();
        // this._initScene();
        this._initLeap();
        this.workbench = new Workbench(
            this.world, this.scene, Leap.loopController);
        this.trigger('initialized');
        this._animate();
    };

    App.prototype._initThree = function () {
        this.camera = new THREE.PerspectiveCamera(
            75, this.width / this.height, 0.1, 100 );
        this.camera.position.add(CAMERA_OFFSET);
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

        var groundShape = new CANNON.Plane();
        this.groundBody = new CANNON.Body({
            mass: 0
        });
        this.groundBody.position.set(0, -1, 0);
        this.groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.groundBody.addShape(groundShape);
        this.world.add(this.groundBody);
    };

    App.prototype._initLeap = function () {
        Leap.loop({
            optimizeHMD: true
        });
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
