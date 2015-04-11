(function () {
  var Workbench = function (world, scene) {
      var actuator_a = new Actuator({
          amplitude: 0, position: new CANNON.Vec3(0.1, 0, 0)});
      world.add(actuator_a.body);
      scene.add(actuator_a.mesh);

      actuator_b = new Actuator({
          amplitude: 0, position: new CANNON.Vec3(0, 0, 0)});
      world.add(actuator_b.body);
      scene.add(actuator_b.mesh);

      this.actuators = [actuator_a, actuator_b];

      // world.addConstraint(actuator_a.addTopActuator(actuator_b));
  };

  Workbench.prototype.update = function (elapsed) {
      this.actuators.forEach(function (actuator) {
          actuator.step(elapsed);
      });
  };
  window.Workbench = Workbench;
}());
