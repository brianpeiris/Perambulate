import Controls from "./Controls";

class ActuatorControls extends Controls {
  constructor(scene) {
    super(scene, false);

    this.xmax = 0.2;
    this.ymax = 0.07;

    this.actuatorSettingButton = this.createPlane(".actuatorSetting", "actuatorSettingReleased", false);
  }

  createPlane(selector, eventName, locking) {
    return;
    var plane = new InteractablePlane(
      document.querySelector(selector).glam.object.visuals[0].object,
      this.leapController,
      {
        damping: 0.06,
        moveX: true,
        moveY: true,
        moveZ: false
      }
    );
    plane.movementConstraints.y = function(y) {
      if (y < 0) {
        return 0;
      }
      if (y > this.ymax) {
        return this.ymax;
      }
      return y;
    }.bind(this);
    plane.movementConstraints.x = function(x) {
      if (x < 0) {
        return 0;
      }
      if (x > this.xmax) {
        return this.xmax;
      }
      return x;
    }.bind(this);
    plane.on(
      "release",
      function(plane) {
        if (this.visible) {
          this.trigger(eventName, plane.mesh.position.x / this.xmax, plane.mesh.position.y / this.ymax);
        }
      }.bind(this)
    );
    return plane;
  }

  setX(x) {
    return;
    this.actuatorSettingButton.mesh.position.setX(x * this.xmax);
    this.actuatorSettingButton.lastPosition.setX(x * this.xmax);
  }

  setY(y) {
    return;
    this.actuatorSettingButton.mesh.position.setY(y * this.ymax);
    this.actuatorSettingButton.lastPosition.setY(y * this.ymax);
  }
}

export default ActuatorControls;
