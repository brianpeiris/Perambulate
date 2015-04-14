(function () {
    'use strict';
    var MESH_SCALE = 2;
    var WIDTH = 0.0125;
    var HEIGHT = 0.05;

    var Actuator = function (options) {
        this.options = options || {};
        this.amplitude = (
            this.options.amplitude === undefined ? 0 : this.options.amplitude);
        this.phase = 0;

        this.actuators = [];
        this.topPivotPoints = [];
        this.bottomPivotPoints = [];

        this.shape = new CANNON.Box(new CANNON.Vec3(
            WIDTH, HEIGHT, WIDTH));
        this.body = new CANNON.Body({mass: 1, position: this.options.position});
        this.body.addShape(this.shape);
        this.body.linearDamping = 0.5;
        this.body.angularDamping = 0.5;

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

    var CONSTRAINT_OFFSET = 0.7;

    Actuator.prototype.stepBody = function (elapsed) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    };

    var RATE = Math.PI / (1 * 1000);
    Actuator.prototype.stepActuation = function (elapsed) {
        this.scale = 1 + (Math.sin(
            elapsed * RATE + this.phase * Math.PI
        ) + 1) / 2 * this.amplitude;
        this.mesh.scale.setY(this.scale);

        var bodyHeight = HEIGHT * this.scale;
        var pivotPosition = bodyHeight + HEIGHT * CONSTRAINT_OFFSET;

        if (this.topJoinMesh) {
            this.topJoinMesh.scale.setY(1 / this.scale);
        }
        if (this.bottomJoinMesh) {
            this.bottomJoinMesh.scale.setY(1 / this.scale);
        }

        this.shape.halfExtents.y = bodyHeight;

        this.topPivotPoints.forEach(function (topPivotPoint) {
            topPivotPoint.y = pivotPosition;
        });

        this.bottomPivotPoints.forEach(function (bottomPivotPoint) {
            bottomPivotPoint.y = -pivotPosition;
        });

        this.shape.updateConvexPolyhedronRepresentation();
    };

    var JOIN_POINT_POS = HEIGHT + HEIGHT * CONSTRAINT_OFFSET;
    var TOP_JOIN_POINT = new CANNON.Vec3(0, JOIN_POINT_POS, 0);
    var BOTTOM_JOIN_POINT = new CANNON.Vec3(0, -JOIN_POINT_POS, 0);

    Actuator.prototype.joinToLocation = function (
        actuator,
        joinedPivotPoints,
        thisTop, otherTop
    ) {
        if (joinedPivotPoints.length === 0)  {
            var joinMesh = new THREE.Mesh(
                new THREE.SphereGeometry(HEIGHT * CONSTRAINT_OFFSET),
                new THREE.MeshLambertMaterial({color: 'white'})
            );
            var joinMeshY = thisTop ?  JOIN_POINT_POS : -JOIN_POINT_POS;
            joinMesh.position.set(0, joinMeshY, 0);
            if (thisTop) {
                this.topJoinMesh = joinMesh;
            }
            else {
                this.bottomJoinMesh = joinMesh;
            }
            this.mesh.add(joinMesh);
        }
        var pivotA = thisTop ? TOP_JOIN_POINT : BOTTOM_JOIN_POINT;
        var pivotB = otherTop ? TOP_JOIN_POINT : BOTTOM_JOIN_POINT;
        var actuatorConstraint = new CANNON.PointToPointConstraint(
            this.body,
            pivotA,
            actuator.body,
            pivotB
        );
        joinedPivotPoints.push(actuatorConstraint.pivotA);
        (otherTop ? actuator.topPivotPoints : actuator.bottomPivotPoints).push(
            actuatorConstraint.pivotB);
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
                actuator, this.topPivotPoints,
                thisTop, otherTop);
        }
        else {
            return this.joinToLocation(
                actuator, this.bottomPivotPoints,
                thisTop, otherTop);
        }
    };

    Actuator.prototype.isJoinedTo = function (actuator) {
        return this.actuators.indexOf(actuator) !== -1;
    };

    window.Actuator = Actuator;
})();
