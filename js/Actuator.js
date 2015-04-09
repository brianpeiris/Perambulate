(function () {
    'use strict';
    var MESH_SCALE = 2;
    var WIDTH = 1;
    var HEIGHT = 2;
    var Actuator = function (options) {
        options = options || {};
        this.amplitude = options.amplitude === undefined ? 1 : options.amplitude;
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
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });
        this.mesh = new THREE.Mesh(geometry, material);
    };
    var CONSTRAINT_OFFSET = 1.5;
    Actuator.prototype.step = function (elapsed) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        var rate = Math.PI / (2 * 1000);
        this.scale = 1 + (Math.sin(elapsed * rate) + 1) / 2 * this.amplitude;
        this.mesh.scale.setY(this.scale);
        var bodyHeight = HEIGHT * this.scale;
        this.shape.halfExtents.y = bodyHeight;
        if (this.topActuatorConstraint) {
            this.topActuatorConstraint.pivotA.y = bodyHeight + CONSTRAINT_OFFSET;
        }
        this.shape.updateConvexPolyhedronRepresentation();
    };
    Actuator.prototype.addTopActuator = function (actuator) {
        this.topActuator = actuator;
        this.topActuatorConstraint = new CANNON.PointToPointConstraint(
            this.body,
            new CANNON.Vec3(0, HEIGHT + CONSTRAINT_OFFSET, 0),
            actuator.body,
            new CANNON.Vec3(0, -HEIGHT - CONSTRAINT_OFFSET, 0)
        );
        return this.topActuatorConstraint;
    };
    window.Actuator = Actuator;
})();
