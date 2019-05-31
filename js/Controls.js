import * as THREE from "three";

const BUTTON_SIZE = 0.1;
const BUTTON_MARGIN = BUTTON_SIZE * 0.2;
const BUTTON_THRESHOLD = 0.05;

class Button extends EventTarget {
  constructor(img, momentary) {
    super();
    this.momentary = momentary;
    this.loader = new THREE.TextureLoader();
    this.mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(BUTTON_SIZE - BUTTON_MARGIN, BUTTON_SIZE - BUTTON_MARGIN, 0.02),
      new THREE.MeshStandardMaterial({ color: "red", map: this.loader.load(img), transparent: true })
    );
    this.pressed = false;
    this.entered = false;
  }
  update(controllers) {
    let entered = false;
    for (const controller of controllers) {
      entered = entered || controller.position.distanceTo(this.mesh.getWorldPosition()) < BUTTON_THRESHOLD;
    }
    if (entered !== this.entered) {
      if (this.momentary) {
        this.mesh.material.emissive.setHex(entered ? 0x00ff00 : 0x000000);
      } else if (entered) {
        this.pressed = !this.pressed;
        this.mesh.material.emissive.setHex(this.pressed ? 0x00ff00 : 0x000000);
      }
      if (entered) {
        this.dispatchEvent(new CustomEvent("pressed", { detail: { on: this.pressed } }));
      }
      this.entered = entered;
    }
  }
}

class Controls extends EventTarget {
  constructor(scene, poseUp) {
    super();
    this.scene = scene;
    this.base = new THREE.Mesh(
      new THREE.BoxBufferGeometry(BUTTON_SIZE, BUTTON_SIZE, 0.01),
      new THREE.MeshStandardMaterial()
    );
    this.base.position.set(0, 1, -0.3);
    scene.add(this.base);
    this.visible = false;
    this.poseUp = poseUp;
    this.lastDetected = new Date();
    this.lastPoseState = false;
    this.buttons = [];
  }
  addButton(img, eventName, momentary) {
    const button = new Button(img, momentary);
    button.addEventListener("pressed", e => {
      this.dispatchEvent(new CustomEvent(eventName, { detail: { on: e.detail.on } }));
    });
    this.buttons.push(button);
    this.base.add(button.mesh);
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].mesh.position.x = i * BUTTON_SIZE - (this.buttons.length / 2) * BUTTON_SIZE + BUTTON_SIZE / 2;
    }
    this.base.geometry = new THREE.BoxBufferGeometry(
      BUTTON_SIZE * this.buttons.length + BUTTON_MARGIN / 2,
      BUTTON_SIZE,
      0.01
    );
  }
  update(controllers) {
    for (const button of this.buttons) {
      button.update(controllers);
    }
  }
}
export default Controls;
