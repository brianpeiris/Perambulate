(function () {
    var MainControls = function (scene, leapController) {
        this.scene = scene;
        this.leapController = leapController;
        this.visible = true;

        var mainControlsEl = document.querySelector('#mainControls');
        this.controlBase = mainControlsEl.glam.object.transform;
        this.controlObject = mainControlsEl.glam.object.getChild(0).getChild(0);

        this.addActuatorButton = this.createButton('.addActuator', 'addActuatorPressed');
        this.activateActuatorsButton = this.createButton(
            '.activateActuators', 'activateActuatorsPressed');
        this.enableGravityButton = this.createButton(
            '.enableGravity', 'enableGravityPressed');

        this.leapController.on('frame', this.showControls.bind(this));
    };
    _.extend(MainControls.prototype, Backbone.Events);

    MainControls.prototype.createButton = function (selector, eventName) {
        var button = new PushButton(
            new InteractablePlane(
                document.querySelector(selector).glam.object.visuals[0].object,
                this.leapController),
            {
                locking: false,
                longThrow: -0.01,
                shortThrow: -0.005
            }
        );
        button.on('press', function (mesh) {
            if (this.visible) {
                this.trigger(eventName);
            }
        }.bind(this));
        return button;
    };

    MainControls.prototype.poseDetected = function (handHelper, hand) {
        // handHelper.fingerStraight(hand.indexFinger);
        // handHelper.fingerBent(hand.indexFinger);
        // return false;
        return (
            handHelper.fingerStraight(hand.indexFinger) &&
            (
                handHelper.fingerBent(hand.middleFinger) ||
                handHelper.fingerBent(hand.ringFinger)
            ) &&
            handHelper.fingerStraight(hand.pinky)
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
