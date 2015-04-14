(function () {
    var Workbench = function (world, scene, leapController) {
        this.world = world;
        this.scene = scene;
        this.leapController = leapController;

        this.actuators = [];
        this.bodyActuatorMap = {};

        this.addActuator('blue', new CANNON.Vec3(0.1, 0, 0));
        this.addActuator('red', new CANNON.Vec3(-0.1, 0, 0));

        this.leapController.on('frame', this.interact.bind(this));

        this.mainControls = new MainControls(this.scene, this.leapController);
        var colorCounter = 0;
        var colors = [
            'purple',
            'yellow',
            'green',
            'pink',
            'orange'
        ];
        this.mainControls.on('addActuatorPressed', function () {
            this.addActuator(colors[colorCounter], new CANNON.Vec3(0, 0, 0));
            colorCounter++;
        }.bind(this));
        this.mainControls.on('activateActuatorsPressed', function () {
            this.addActuator('blue', new CANNON.Vec3(0.1, 0, 0));
            this.addActuator('red', new CANNON.Vec3(-0.1, 0, 0));
        }.bind(this));
    };

    Workbench.prototype.addActuator = function (color, position) {
        var actuator = new Actuator({
            amplitude: 0,
            position: position,
            color: color
        });
        this.world.add(actuator.body);
        actuator.mesh.add(new THREE.AxisHelper(0.08));
        this.scene.add(actuator.mesh);
        this.actuators.push(actuator);
        this.bodyActuatorMap[actuator.body.id] = actuator;
        actuator.body.addEventListener('collide', this.joinActuators.bind(this));
    };

    Workbench.prototype.joinActuators = function (event) {
        var target = this.bodyActuatorMap[event.contact.bi.id];
        var body = this.bodyActuatorMap[event.contact.bj.id];
        if (target.isJoinedTo(body) || body.isJoinedTo(target)) { return; }
        this.world.addConstraint(target.joinTo(body, event.contact));
    };

    var DISTANCE_THRESHOLD = 0.1;
    Workbench.prototype.getClosestActuator = function (position) {
        var closest = null;
        var closestDistance;
        this.actuators.forEach(function (actuator) {
            var currentDistance = position.distanceTo(actuator.body.position);
            if (
                (!closest || currentDistance < closestDistance) &&
                currentDistance < DISTANCE_THRESHOLD
            ) {
                closest = actuator;
                closestDistance = currentDistance;
            }
        });
        return closest;
    };

    var POSITION_OFFSET = new THREE.Vector3(0.015, -0.005, -0.01);
    var GRAB_THRESHOLD = 0.8;
    Workbench.prototype.interact = function (frame) {
        if (frame.hands.length === 0) { return; }
        var hand = frame.hands[0];
        var handHelper = new LeapHandHelper(hand);

        if (!this.currentActuator && hand.grabStrength > GRAB_THRESHOLD) {
            var closestActuator = this.getClosestActuator(handHelper.palmPosition);
            this.currentActuator = closestActuator;
        }

        if (hand.grabStrength <= GRAB_THRESHOLD) {
            this.currentActuator = null;
        }

        if (this.currentActuator) {
            var actuatorQuaternion =
            this.currentActuator.body.quaternion.copy(handHelper.palmQuaternion);
            var actuatorPosition = handHelper.palmPosition.clone().add(
                POSITION_OFFSET.clone().applyQuaternion(handHelper.palmQuaternion));
            this.currentActuator.body.position.copy(actuatorPosition);
        }
    };


    Workbench.prototype.update = function (elapsed) {
        this.actuators.forEach(function (actuator) {
            actuator.step(elapsed);
        });
    };
    window.Workbench = Workbench;
}());
