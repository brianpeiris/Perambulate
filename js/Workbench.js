(function () {
    var Workbench = function (world, scene, leapController) {
        var actuator_a = new Actuator({
            amplitude: 0,
            position: new CANNON.Vec3(0.1, 0, 0),
            color: 'blue'
        });
        world.add(actuator_a.body);
        scene.add(actuator_a.mesh);

        actuator_b = new Actuator({
            amplitude: 0,
            position: new CANNON.Vec3(-0.1, 0, 0),
            color: 'red'
        });
        world.add(actuator_b.body);
        scene.add(actuator_b.mesh);

        this.actuators = [actuator_a, actuator_b];

        // world.addConstraint(actuator_a.addTopActuator(actuator_b));

        this.leapController = leapController;
        this.leapController.on('frame', this.interact.bind(this));
    };

    Workbench.prototype.getClosestActuator = function (position) {
        var closest;
        var closestDistance;
        this.actuators.forEach(function (actuator) {
            var currentDistance = position.distanceTo(actuator.body.position);
            if (!closest || currentDistance < closestDistance) {
                closest = actuator;
                closestDistance = currentDistance;
            }
        });
        return closest;
    };

    var getMatrixFromArray = function (arr) {
        var matrix = new THREE.Matrix4();
        matrix.set(
            arr[0], arr[1], arr[2], 0,
            arr[3], arr[4], arr[5], 0,
            arr[6], arr[7], arr[8], 0,
            0, 0, 0, 0
        );
        return matrix;
    };

    Workbench.prototype.haveIntialFrame = function (hand) {
        return (
            this.initialFrame &&
            this.initialFrame.valid &&
            this.initialFrame.hands[0].id === hand.id
        );
    };

    var GRAB_THRESHOLD = 0.8;
    var ROTATION_OFFSET = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        Math.PI / 2
    );
    var POSITION_OFFSET = new THREE.Vector3(0, 0, 0.02);
    Workbench.prototype.interact = function (frame) {
        if (frame.hands.length === 0) { return; }
        var hand = frame.hands[0];
        if (!this.haveIntialFrame(hand)) { this.initialFrame = frame; }
        var palmPosition = new THREE.Vector3().fromArray(hand.palmPosition);
        palmPosition.add(POSITION_OFFSET);
        var handRotation = hand.rotationMatrix(this.initialFrame);
        var palmQuaternion = new THREE.Quaternion().setFromRotationMatrix(
            getMatrixFromArray(handRotation)
        );
        palmQuaternion.multiply(ROTATION_OFFSET);
        if (!this.currentActuator && hand.grabStrength > GRAB_THRESHOLD) {
            var closestActuator = this.getClosestActuator(palmPosition);
            this.currentActuator = closestActuator;
        }
        if (hand.grabStrength <= GRAB_THRESHOLD) {
            this.currentActuator = null;
        }
        if (this.currentActuator) {
            this.currentActuator.body.position.copy(palmPosition);
            var actuatorQuaternion = this.currentActuator.body.quaternion;
            actuatorQuaternion.copy(palmQuaternion);
        }
    };


    Workbench.prototype.update = function (elapsed) {
        this.actuators.forEach(function (actuator) {
            actuator.step(elapsed);
        });
    };
    window.Workbench = Workbench;
}());
