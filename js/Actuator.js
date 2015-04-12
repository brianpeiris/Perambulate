(function () {
    'use strict';
    var MESH_SCALE = 2;
    var WIDTH = 0.0125;
    var HEIGHT = 0.05;

    var Actuator = function (options) {
        options = options || {};
        this.amplitude = options.amplitude === undefined ? 1 : options.amplitude;

        this.topActuators = [];
        this.topActuatorConstraints = [];

        this.shape = new CANNON.Box(new CANNON.Vec3(
            WIDTH, HEIGHT, WIDTH));
        this.body = new CANNON.Body({mass: 1, position: options.position});
        this.body.addShape(this.shape);
        this.body.angularDamping = 0.5;

        var geometry = new THREE.BoxGeometry(
            WIDTH * MESH_SCALE,
            HEIGHT * MESH_SCALE,
            WIDTH * MESH_SCALE
        );
        this.material = new THREE.MeshLambertMaterial({
            color: options.color
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

        this.topActuatorConstraints.forEach(function (topActuatorConstraint) {
            topActuatorConstraint.pivotA.y = bodyHeight + HEIGHT * CONSTRAINT_OFFSET;
        });

        this.shape.updateConvexPolyhedronRepresentation();
    };

    var TOP_JOIN_POINT = new CANNON.Vec3(0, HEIGHT + HEIGHT * CONSTRAINT_OFFSET, 0);
    var BOTTOM_JOIN_POINT = new CANNON.Vec3(0, -HEIGHT - HEIGHT * CONSTRAINT_OFFSET, 0);

    Actuator.prototype.addTopActuator = function (actuator) {
        if (this.topActuators.length === 0)  {
            var joinMesh = new THREE.Mesh(
                new THREE.SphereGeometry(HEIGHT * CONSTRAINT_OFFSET),
                this.material
            );
            joinMesh.position.set(0, HEIGHT + HEIGHT * CONSTRAINT_OFFSET, 0);
            this.mesh.add(joinMesh);
        }
        this.topActuators.push(actuator);
        var actuatorConstraint = new CANNON.PointToPointConstraint(
            this.body,
            TOP_JOIN_POINT,
            actuator.body,
            BOTTOM_JOIN_POINT
        );
        this.topActuatorConstraints.push(actuatorConstraint);
        console.log('joined actuators');
        return actuatorConstraint;
    };

    Actuator.prototype.isJoinedTo = function (actuator) {
        return this.topActuators.indexOf(actuator) !== -1;
    };

    window.Actuator = Actuator;
})();
