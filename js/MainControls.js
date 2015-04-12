(function () {
    var MainControls = function (scene, leapController) {
        this.scene = scene;
        this.leapController = leapController;

        this.controlBase = new THREE.Mesh(
            new THREE.PlaneGeometry(0.1, 0.1, 4, 4),
            new THREE.MeshLambertMaterial({
                color: 'red', side: THREE.DoubleSide})
        );
        this.controlBase.add(new THREE.AxisHelper(0.08));
        this.scene.add(this.controlBase);
        this.leapController.on('frame', this.showControls.bind(this));
    };
    MainControls.prototype.showControls = function (frame) {
        if (frame.hands.length === 0) { return; }
        var hand = frame.hands[0];
        var handHelper = new LeapHandHelper(hand);
        this.controlBase.position.copy(handHelper.palmPosition);
        this.controlBase.quaternion.copy(handHelper.palmQuaternion);
    };
    window.MainControls = MainControls;
}());
