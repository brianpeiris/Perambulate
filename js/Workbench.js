(function () {
    var Workbench = function (world, scene, leapController) {
        this.world = world;
        this.scene = scene;
        this.leapController = leapController;

        this.actuators = [];
        this.bodyActuatorMap = {};

        this.heldActuators = {};

        this.addActuator('white', new CANNON.Vec3(0.1, 0, 0));
        this.addActuator('white', new CANNON.Vec3(-0.1, 0, 0));

        this.leapController.on('frame', this.interact.bind(this));

        this.mainControls = new MainControls(this.scene, this.leapController);
        this.mainControls.on('addActuatorPressed', function () {
            this.addActuator('white', new CANNON.Vec3(0, 0, 0));
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
        if (!target || !body) { return; }
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

    var ZERO = new CANNON.Vec3(0, 0, 0);
    var YAXIS = new CANNON.Vec3(0, 1, 0);
    Workbench.prototype.createHinge = function (hand, currentActuator) {
        constraintBody = this.heldActuators[hand.type + 'constraintBody'] = new CANNON.Body();
        var constraint = this.heldActuators[hand.type + 'constraint'] = new CANNON.HingeConstraint(
            constraintBody, currentActuator.body,
            {
                pivotA: ZERO,
                axisA: YAXIS,
                pivotB: ZERO,
                axisB: YAXIS
            }
        );
        this.world.addConstraint(constraint);
        return constraintBody;
    };


    var POSITION_OFFSET = new THREE.Vector3(0.015, -0.005, -0.01);
    var GRAB_THRESHOLD = 0.8;
    Workbench.prototype.interact = function (frame) {
        for (var i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[i];
            var currentActuator = this.heldActuators[hand.type];
            var constraintBody = this.heldActuators[hand.type + 'constraintBody'];
            var handHelper = new LeapHandHelper(hand);

            if (!currentActuator && hand.grabStrength > GRAB_THRESHOLD) {
                var closestActuator = this.getClosestActuator(handHelper.palmPosition);
                this.heldActuators[hand.type] = currentActuator = closestActuator;
                if (currentActuator) {
                    constraintBody = this.createHinge(hand, currentActuator);
                }
            }

            if (hand.grabStrength <= GRAB_THRESHOLD) {
                if (currentActuator) {
                    this.world.removeConstraint(this.heldActuators[hand.type + 'constraint']);
                    this.actuators.forEach(function (actuator) {
                        actuator.body.velocity.setZero();
                    }.bind(this));
                }
                this.heldActuators[hand.type] = currentActuator =  null;
                this.heldActuators[hand.type + 'constraintBody'] = constraintBody = null;
                this.heldActuators[hand.type + 'constraint'] = null;
            }

            if (currentActuator) {
                var actuatorQuaternion = handHelper.palmQuaternion.clone();
                constraintBody.quaternion.copy(actuatorQuaternion);

                var actuatorPosition = handHelper.palmPosition.clone().add(
                    POSITION_OFFSET.clone().applyQuaternion(handHelper.palmQuaternion));
                constraintBody.position.copy(actuatorPosition);
            }
        }
    };


    Workbench.prototype.update = function (elapsed) {
        this.actuators.forEach(function (actuator) {
            actuator.step(elapsed);
        });
    };
    window.Workbench = Workbench;
}());
