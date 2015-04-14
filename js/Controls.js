(function () {
    var Controls = function (scene, leapController, controlsSelector, poseUp) {
        this.scene = scene;
        this.leapController = leapController;
        this.visible = false;
        this.poseUp = poseUp;
        this.lastDetected = new Date();
        this.lastPoseState = false;

        var controlsEl = document.querySelector(controlsSelector);
        this.controlBase = controlsEl.glam.object.transform;
        this.controlObject = controlsEl.glam.object.getChild(0).getChild(0);

        this.toggleControls(this.visible);

        this.leapController.on('frame', this.showControls.bind(this));
    };
    _.extend(Controls.prototype, Backbone.Events);

    Controls.prototype.createButton = function (selector, eventName, locking) {
        var button = new PushButton(
            new InteractablePlane(
                document.querySelector(selector).glam.object.visuals[0].object,
                this.leapController),
            {
                locking: locking,
                longThrow: -0.01,
                shortThrow: -0.005
            }
        );
        button.on('press', function (mesh) {
            if (this.visible) {
                this.trigger(eventName, button.pressed);
            }
        }.bind(this));
        button.on('release', function (mesh) {
            if (this.visible) {
                this.trigger(eventName, button.pressed);
            }
        }.bind(this));
        return button;
    };

    Controls.prototype.poseDetected = function (handHelper, hand) {
        return (
            (this.poseUp ? hand.palmNormal[1] > 0.2 : hand.palmNormal[1] < -0.2) &&
            handHelper.fingerStraight(hand.indexFinger) &&
            (
                handHelper.fingerBent(hand.middleFinger) ||
                handHelper.fingerBent(hand.ringFinger)
            ) &&
            handHelper.fingerStraight(hand.pinky)
        );
    };

    Controls.prototype.toggleVisuals = function (object, visible) {
        object.visuals[0].visible = visible;
        for (
            var i = 0, child = object.getChild(i);
            child !== null;
            i++, child = object.getChild(i)
        ) {
            this.toggleVisuals(child, visible);
        }
    };

    Controls.prototype.toggleControls = function (visible) {
        this.visible = visible;
        this.toggleVisuals(this.controlObject, visible);
    };

    POSE_GLIMPSE_THRESHOLD = 50;
    Controls.prototype.showControls = function (frame) {
        var hand;
        for (var i = 0; i < frame.hands.length; i++) {
            if (frame.hands[i].type === 'left') {
                hand = frame.hands[i];
            }
        }
        if (!hand) { return; }

        var handHelper = new LeapHandHelper(hand);
        var poseDetected = this.poseDetected(handHelper, hand);
        if (
            this.lastPoseState !== poseDetected &&
            (new Date() - this.lastDetected) > POSE_GLIMPSE_THRESHOLD
        ) {
            if (!poseDetected) {
                this.visible = !this.visible;
                this.toggleControls(this.visible);
                this.controlBase.position.copy(handHelper.palmPosition);
                this.controlBase.quaternion.copy(handHelper.palmQuaternion);
                this.lastDetected = new Date();
            }
            this.lastPoseState = poseDetected;
        }
    };
    window.Controls = Controls;
}());

