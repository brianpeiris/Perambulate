(function () {
    var MainControls = function (scene, leapController) {
        this.scene = scene;
        this.leapController = leapController;

        var mainControlsEl = document.querySelector('#mainControls');
        this.controlBase = mainControlsEl.glam.object.transform;
        this.controlObject = mainControlsEl.glam.object.getChild(0).getChild(0);
        this.leapController.on('frame', this.showControls.bind(this));
        this.visible = true;
    };

    MainControls.prototype.poseDetected = function (handHelper, hand) {
        return (
            handHelper.fingerBent(hand.middleFinger) ||
            handHelper.fingerBent(hand.ringFinger)
        );
    };

    MainControls.prototype.toggleVisuals = function (object, visible) {
        object.visuals[0].visible = visible;
        for (
            var i = 0, child = object.getChild(i);
            child !== null;
            i++, child = object.getChild(i)
        ) {
            this.toggleVisuals(child, visible);
        }
    };

    MainControls.prototype.toggleControls = function (visible) {
        this.visible = visible;
        this.toggleVisuals(this.controlObject, visible);
    };

    MainControls.prototype.showControls = function (frame) {
        if (frame.hands.length === 0) { return; }
        var hand = frame.hands[0];
        var handHelper = new LeapHandHelper(hand);
        if (!this.visible && this.poseDetected(handHelper, hand)) {
            this.toggleControls(true);
            this.controlBase.position.copy(handHelper.palmPosition);
            this.controlBase.quaternion.copy(handHelper.palmQuaternion);
        }
        if (this.visible && !this.poseDetected(handHelper, hand)) {
            this.toggleControls(false);
        }
    };
    window.MainControls = MainControls;
}());
