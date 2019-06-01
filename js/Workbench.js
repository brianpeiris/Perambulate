import * as THREE from "three";
import * as CANNON from "cannon";

import Actuator from "./Actuator";

import MainControls from "./MainControls";
import ActuatorControls from "./ActuatorControls";

var Workbench = function(world, scene) {
  this.world = world;
  this.scene = scene;
  this.actuatorsActivated = false;

  this.actuators = [];
  this.bodyActuatorMap = {};

  this.selectedActuator = null;
  this.heldActuators = {};

  this.addActuator("white", new CANNON.Vec3(0.1, 1, -0.2));
  this.addActuator("white", new CANNON.Vec3(-0.1, 1, -0.2));

  this.mainControls = new MainControls(this.scene);
  this.mainControls.base.position.x = -0.3;
  this.mainControls.addEventListener(
    "addActuatorPressed",
    function() {
      this.addActuator("white", new CANNON.Vec3(0, 1, -0.2));
    }.bind(this)
  );
  this.mainControls.addEventListener(
    "activateActuatorsPressed",
    function(e) {
      this.actuatorsActivated = e.detail.on;
    }.bind(this)
  );
  this.mainControls.addEventListener(
    "enableGravityPressed",
    function(e) {
      this.world.gravity.set(0, e.detail.on ? -1.8 : 0, 0);
    }.bind(this)
  );

  this.actuatorControls = new ActuatorControls(this.scene);
  this.actuatorControls.base.position.x = 0.3;
  this.actuatorControls.addEventListener(
    "actuatorSettingReleased",
    function(e) {
      if (!this.selectedActuator) return;
      const { x, y } = e.detail;
      this.selectedActuator.phase = x;
      this.selectedActuator.amplitude = y;
    }.bind(this)
  );
};

Workbench.prototype.addActuator = function(color, position) {
  var actuator = new Actuator({
    amplitude: 0,
    position: position,
    color: color
  });
  this.world.add(actuator.body);
  this.scene.add(actuator.mesh);
  this.actuators.push(actuator);
  this.bodyActuatorMap[actuator.body.id] = actuator;
  actuator.body.addEventListener("collide", this.joinActuators.bind(this));
};

Workbench.prototype.joinActuators = function(event) {
  var target = this.bodyActuatorMap[event.contact.bi.id];
  var body = this.bodyActuatorMap[event.contact.bj.id];
  if (!target || !body) {
    return;
  }
  if (target.isJoinedTo(body) || body.isJoinedTo(target)) {
    return;
  }
  this.world.addConstraint(target.joinTo(body, event.contact));
};

Workbench.prototype.getClosestActuator = function(position) {
  var closest = null;
  var closestDistance;
  this.actuators.forEach(function(actuator) {
    var currentDistance = position.distanceTo(actuator.body.position);
    if (!closest || currentDistance < closestDistance) {
      closest = actuator;
      closestDistance = currentDistance;
    }
  });
  return closest;
};

var ZERO = new CANNON.Vec3(0, 0, 0);
var YAXIS = new CANNON.Vec3(0, 1, 0);
Workbench.prototype.createHinge = function(i, currentActuator) {
  var constraintBody = (this.heldActuators[i + "constraintBody"] = new CANNON.Body());
  var constraint = (this.heldActuators[i + "constraint"] = new CANNON.HingeConstraint(
    constraintBody,
    currentActuator.body,
    {
      pivotA: ZERO,
      axisA: YAXIS,
      pivotB: ZERO,
      axisB: YAXIS
    }
  ));
  this.world.addConstraint(constraint);
  return constraintBody;
};

var POSITION_OFFSET = new THREE.Vector3(0.015, -0.005, -0.01);
var GRAB_DISTANCE_THRESHOLD = 0.1;
var SELECTION_DISTANCE_THRESHOLD = 0.05;
Workbench.prototype.interact = function(controllers) {
  for (let i = 0; i < controllers.length; i++) {
    const controller = controllers[i];
    var currentActuator = this.heldActuators[i];
    var constraintBody = this.heldActuators[i + "constraintBody"];

    var closestActuator = this.getClosestActuator(controller.position);
    var distanceToController = closestActuator && closestActuator.body.position.distanceTo(controller.position);
    if (!currentActuator && controller.pressed && closestActuator && distanceToController < GRAB_DISTANCE_THRESHOLD) {
      this.heldActuators[i] = currentActuator = closestActuator;
      if (currentActuator) {
        constraintBody = this.createHinge(i, currentActuator);
      }
    }

    if (!controller.pressed) {
      if (currentActuator) {
        this.world.removeConstraint(this.heldActuators[i + "constraint"]);
        this.actuators.forEach(
          function(actuator) {
            actuator.body.velocity.setZero();
          }.bind(this)
        );
      }
      this.heldActuators[i] = currentActuator = null;
      this.heldActuators[i + "constraintBody"] = constraintBody = null;
      this.heldActuators[i + "constraint"] = null;

      if (closestActuator && this.selectedActuator !== closestActuator) {
        if (distanceToController < SELECTION_DISTANCE_THRESHOLD) {
          if (this.selectedActuator) {
            this.selectedActuator.mesh.material.color.setHex(0xffffff);
          }
          this.selectedActuator = closestActuator;
          this.selectedActuator.mesh.material.color.setHex(0xff0000);
          this.actuatorControls.setX(this.selectedActuator.phase);
          this.actuatorControls.setY(this.selectedActuator.amplitude);
        }
      }
    }

    if (currentActuator) {
      var actuatorQuaternion = controller.quaternion.clone();
      constraintBody.quaternion.copy(actuatorQuaternion);

      var rotatedOffset = POSITION_OFFSET.clone().applyQuaternion(controller.quaternion);
      var actuatorPosition = controller.position.clone().add(rotatedOffset);
      constraintBody.position.copy(actuatorPosition);
    }
  }
};

Workbench.prototype.update = function(elapsed, controllers) {
  this.interact(controllers);
  this.mainControls.update(controllers);
  this.actuatorControls.update(controllers);
  this.actuators.forEach(
    function(actuator) {
      actuator.stepBody(elapsed);
      if (this.actuatorsActivated) {
        actuator.stepActuation(elapsed);
      } else {
        actuator.stepActuation(0);
      }
    }.bind(this)
  );
};

export default Workbench;
