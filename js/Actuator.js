(function () {
    'use strict';
    var Actuator = function (options) {
        options = options || {};
        this.amplitude = options.amplitude === undefined ? 1 : options.amplitude;
        this.shape = new CANNON.Box(new CANNON.Vec3(1, 2, 1));
        this.body = new CANNON.Body({mass: 1, position: options.position});
        this.body.addShape(this.shape);
        this.body.angularVelocity.set(0, 10, 0);
        this.body.angularDamping = 0.5;

        var geometry = new THREE.BoxGeometry(2, 4, 2);
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });
        this.mesh = new THREE.Mesh(geometry, material);
    };
    Actuator.prototype.step = function (elapsed) {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        var rate = Math.PI / (2 * 1000);
        var height = 1 + (Math.sin(elapsed * rate) + 1) / 2 * this.amplitude;
        this.mesh.scale.setY(height);
        this.shape.halfExtents.y = 2 * height;
        this.shape.updateConvexPolyhedronRepresentation();
    };
    window.Actuator = Actuator;
})();
