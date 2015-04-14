(function () {
    'use strict';
    var MESH_SCALE = 2;
    var WIDTH = 0.0125;
    var HEIGHT = 0.05;

    var Actuator = function (options) {
        this.options = options || {};
        this.amplitude = (
            this.options.amplitude === undefined ? 1 : this.options.amplitude);

        this.actuators = [];
        this.topActuators = [];
        this.topActuatorConstraints = [];
        this.bottomActuators = [];
        this.bottomActuatorConstraints = [];

        this.shape = new CANNON.Box(new CANNON.Vec3(
            WIDTH, HEIGHT, WIDTH));
        this.body = new CANNON.Body({mass: 1, position: this.options.position});
        this.body.addShape(this.shape);
        this.body.linearDamping = 0.5;
        this.body.angularDamping = 0.5;
        console.log('created', this.options.color, this.body.id);

        var geometry = new THREE.BoxGeometry(
            WIDTH * MESH_SCALE,
            HEIGHT * MESH_SCALE,
            WIDTH * MESH_SCALE
        );
        this.material = new THREE.MeshLambertMaterial({
            color: this.options.color
        });
        this.mesh = new THREE.Mesh(geometry, this.material);
    };

    var CONSTRAINT_OFFSET = 0.5;

    Actuator.prototype.step = function (elapsed) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);

        var rate = Math.PI / (2 * 1000);
        this.scale = 1 + (Math.sin(elapsed * rate) + 1) / 2 * this.amplitude;
        this.mesh.scale.setY(this.scale);

        var bodyHeight = HEIGHT * this.scale;
        this.shape.halfExtents.y = bodyHeight;

        var pivotPosition = bodyHeight + HEIGHT * CONSTRAINT_OFFSET;
        this.topActuatorConstraints.forEach(function (topActuatorConstraint) {
            topActuatorConstraint.pivotA.y = pivotPosition;
        });

        this.bottomActuatorConstraints.forEach(function (bottomActuatorConstraint) {
            bottomActuatorConstraint.pivotA.y = -pivotPosition;
        });

        this.shape.updateConvexPolyhedronRepresentation();
    };

    var JOIN_POINT_POS = HEIGHT + HEIGHT * CONSTRAINT_OFFSET;
    var TOP_JOIN_POINT = new CANNON.Vec3(0, JOIN_POINT_POS, 0);
    var BOTTOM_JOIN_POINT = new CANNON.Vec3(0, -JOIN_POINT_POS, 0);

    Actuator.prototype.joinToLocation = function (
        actuator,
        joinedActuators, joinedActuatorConstraints,
        thisTop, otherTop
    ) {
        if (joinedActuators.length === 0)  {
            var joinMesh = new THREE.Mesh(
                new THREE.SphereGeometry(HEIGHT * CONSTRAINT_OFFSET),
                this.material
            );
            var joinMeshY = thisTop ?  JOIN_POINT_POS : -JOIN_POINT_POS;
            joinMesh.position.set(0, joinMeshY, 0);
            this.mesh.add(joinMesh);
        }
        joinedActuators.push(actuator);
        var actuatorConstraint = new CANNON.PointToPointConstraint(
            this.body,
            thisTop ? TOP_JOIN_POINT : BOTTOM_JOIN_POINT,
            actuator.body,
            otherTop ? TOP_JOIN_POINT : BOTTOM_JOIN_POINT
        );
        joinedActuatorConstraints.push(actuatorConstraint);
        return actuatorConstraint;
    };

    var closerToTop = function (quaternion, contactPosition) {
        var distanceToTop = contactPosition.distanceTo(
            quaternion.vmult(TOP_JOIN_POINT));
        var distanceToBottom = contactPosition.distanceTo(
            quaternion.vmult(BOTTOM_JOIN_POINT));
        return distanceToTop < distanceToBottom;
    };

    Actuator.prototype.joinTo = function (actuator, contact) {
        this.actuators.push(actuator);
        var thisTop = closerToTop(contact.bi.quaternion, contact.ri);
        var otherTop = closerToTop(contact.bj.quaternion, contact.rj);
        if (thisTop) {
            return this.joinToLocation(
                actuator, this.topActuators, this.topActuatorConstraints,
                thisTop, otherTop);
        }
        else {
            return this.joinToLocation(
                actuator, this.bottomActuators, this.bottomActuatorConstraints,
                thisTop, otherTop);
        }
    };

    Actuator.prototype.isJoinedTo = function (actuator) {
        return this.actuators.indexOf(actuator) !== -1;
    };

    window.Actuator = Actuator;
})();
