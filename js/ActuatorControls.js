import * as THREE from "three";

import Controls from "./Controls";

class ActuatorControls extends Controls {
  constructor(scene) {
    super(scene, false);
    this.base.geometry = new THREE.BoxBufferGeometry(0.2, 0.1, 0.01);
    const loader = new THREE.TextureLoader();
    this.knob = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.02, 0.02, 0.02),
      new THREE.MeshStandardMaterial({ transparent: true, map: loader.load("img/target.png") })
    );
    this.knob.geometry.computeBoundingBox();
    this.knob.geometry.txBoundingBox = this.knob.geometry.boundingBox.clone();
    this.base.add(this.knob);
    this.entered = false;
  }

  setX(x) {
    this.knob.position.x = 0.2 * x - 0.1;
  }

  setY(y) {
    this.knob.position.y = 0.1 * y - 0.05;
  }

  update(controllers) {
    this.knob.geometry.txBoundingBox.copy(this.knob.geometry.boundingBox);
    this.knob.geometry.txBoundingBox.applyMatrix4(this.knob.matrixWorld);
    let entered = false;
    for (const controller of controllers) {
      if (controller.children[0].geometry.txBoundingSphere.intersectsBox(this.knob.geometry.txBoundingBox)) {
        entered = true;
        this.knob.position.copy(this.base.worldToLocal(controller.position));
        this.knob.position.x = THREE.Math.clamp(this.knob.position.x, -0.1, 0.1);
        this.knob.position.y = THREE.Math.clamp(this.knob.position.y, -0.05, 0.05);
        this.knob.position.z = 0;
      }
    }
    if (entered !== this.entered) {
      if (!entered) {
        this.dispatchEvent(
          new CustomEvent("actuatorSettingReleased", {
            detail: {
              x: (this.knob.position.x + 0.1) / 0.2,
              y: (this.knob.position.y + 0.05) / 0.1
            }
          })
        );
      }
      this.entered = entered;
    }
  }
}

export default ActuatorControls;
