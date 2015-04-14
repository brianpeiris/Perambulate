(function () {
    var Workbench = function (world, scene, leapController) {
        this.world = world;
        this.scene = scene;
        this.leapController = leapController;

        this.actuators = [];
        this.bodyActuatorMap = {};

        this.heldActuators = {};

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

    var getAngularDifference = function (q1, q2) {
        q1 = q1.clone().normalize();
        q2 = q2.clone().normalize();
        return new THREE.Vector3(q1.x, q1.y, q1.z).distanceTo(
            new THREE.Vector3(q2.x, q2.y, q2.z)
        );
        //return q1.dot(q2) / (q1.length() * q2.length());
        // return q1.clone().inverse().multiply(q2);
    };

    var POSITION_OFFSET = new THREE.Vector3(0.015, -0.005, -0.01);
    var FLIP_ROTATION = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), Math.PI);
    var GRAB_THRESHOLD = 0.8;
    Workbench.prototype.interact = function (frame) {
        for (var i = 0; i < frame.hands.length; i++) {
            var hand = frame.hands[i];
            var currentActuator = this.heldActuators[hand.type];
            var handHelper = new LeapHandHelper(hand);

            if (!currentActuator && hand.grabStrength > GRAB_THRESHOLD) {
                var closestActuator = this.getClosestActuator(handHelper.palmPosition);
                this.heldActuators[hand.type] = currentActuator = closestActuator;

                if (currentActuator) {
                    var currentQuaternion = new THREE.Quaternion().fromArray(
                        currentActuator.body.quaternion.toArray());

                    var angularDifference = getAngularDifference(
                        handHelper.palmQuaternion, currentQuaternion);

                    var flipped = handHelper.palmQuaternion.clone().multiply(FLIP_ROTATION);
                    var angularDifferenceFlipped = getAngularDifference(
                        flipped, currentQuaternion);

                    this.heldActuators[hand.type + 'flipped'] = (
                        Math.abs(angularDifference) > Math.abs(angularDifferenceFlipped));
                }
            }

            if (hand.grabStrength <= GRAB_THRESHOLD) {
                if (currentActuator) {
                    this.actuators.forEach(function (actuator) {
                        actuator.body.velocity.setZero();
                    }.bind(this));
                }
                this.heldActuators[hand.type] = currentActuator =  null;
            }

            if (currentActuator) {
                var actuatorQuaternion = handHelper.palmQuaternion.clone();
                if (this.heldActuators[hand.type + 'flipped']) {
                    actuatorQuaternion.multiply(FLIP_ROTATION);
                }
                currentActuator.body.quaternion.copy(actuatorQuaternion);

                var actuatorPosition = handHelper.palmPosition.clone().add(
                    POSITION_OFFSET.clone().applyQuaternion(handHelper.palmQuaternion));
                currentActuator.body.position.copy(actuatorPosition);
            }
        }
        // if (this.heldActuators.left) {
        //     this.actuators[0].body.quaternion.copy(this.heldActuators.left.body.quaternion.inverse());
        // }
        // if (this.heldActuators.left && this.heldActuators.right) {
        //     // var leftQ = new THREE.Quaternion().fromArray(this.heldActuators.left.body.quaternion.toArray());
        //     // var rightQ = new THREE.Quaternion().fromArray(this.heldActuators.right.body.quaternion.toArray());
        //     // console.log(leftQ.dot(rightQ)/(leftQ.length() * rightQ.length()));
        // }
    };


    Workbench.prototype.update = function (elapsed) {
        this.actuators.forEach(function (actuator) {
            actuator.step(elapsed);
        });
    };
    window.Workbench = Workbench;
}());
