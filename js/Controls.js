import * as THREE from "three";

const POSE_GLIMPSE_THRESHOLD = 50;
const BUTTON_SIZE = 0.1;
const BUTTON_MARGIN = BUTTON_SIZE * 0.2;
class Controls extends EventTarget {
  constructor(scene, poseUp) {
    super();
    this.scene = scene;
    this.base = new THREE.Mesh(
      new THREE.BoxBufferGeometry(BUTTON_SIZE, BUTTON_SIZE, 0.01),
      new THREE.MeshStandardMaterial()
    );
    this.base.position.z = -2;
    scene.add(this.base);
    this.visible = false;
    this.poseUp = poseUp;
    this.lastDetected = new Date();
    this.lastPoseState = false;

    this.toggleControls(this.visible);
  }

  createButton(eventName, locking) {
    const button = new THREE.Mesh(
      new THREE.BoxBufferGeometry(BUTTON_SIZE - BUTTON_MARGIN, BUTTON_SIZE - BUTTON_MARGIN, 0.02),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    this.base.add(button);
    const numButtons = this.base.children.length;
    for (let i = 0; i < numButtons; i++) {
      this.base.children[i].position.x = i * BUTTON_SIZE - (numButtons / 2) * BUTTON_SIZE + BUTTON_SIZE / 2;
    }
    this.base.geometry = new THREE.BoxBufferGeometry(
      BUTTON_SIZE * this.base.children.length + BUTTON_MARGIN / 2,
      BUTTON_SIZE,
      0.01
    );
  }

  poseDetected(handHelper, hand) {
    return (
      (this.poseUp ? hand.palmNormal[1] > 0.2 : hand.palmNormal[1] < -0.2) &&
      handHelper.fingerStraight(hand.indexFinger) &&
      (handHelper.fingerBent(hand.middleFinger) || handHelper.fingerBent(hand.ringFinger)) &&
      handHelper.fingerStraight(hand.pinky)
    );
  }

  toggleVisuals(object, visible) {
    if (!object) return;
    object.visuals[0].visible = visible;
    for (var i = 0, child = object.getChild(i); child !== null; i++, child = object.getChild(i)) {
      this.toggleVisuals(child, visible);
    }
  }

  toggleControls(visible) {
    this.visible = visible;
    this.toggleVisuals(this.controlObject, visible);
  }

  showControls(frame) {
    var hand;
    for (var i = 0; i < frame.hands.length; i++) {
      if (frame.hands[i].type === "left") {
        hand = frame.hands[i];
      }
    }
    if (!hand) {
      return;
    }

    var handHelper = new LeapHandHelper(hand);
    var poseDetected = this.poseDetected(handHelper, hand);
    if (this.lastPoseState !== poseDetected && new Date() - this.lastDetected > POSE_GLIMPSE_THRESHOLD) {
      if (!poseDetected) {
        this.visible = !this.visible;
        this.toggleControls(this.visible);
        this.controlBase.position.copy(handHelper.palmPosition);
        this.controlBase.quaternion.copy(handHelper.palmQuaternion);
        this.lastDetected = new Date();
      }
      this.lastPoseState = poseDetected;
    }
  }
}
export default Controls;
