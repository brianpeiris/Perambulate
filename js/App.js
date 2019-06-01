import * as THREE from "three";
import * as CANNON from "cannon";

import Workbench from "./Workbench";

var App = function() {};

App.prototype.init = function() {
  this._initThree();
  this._initCannon();
  this.workbench = new Workbench(this.world, this.scene);
  this._animate();
};

App.prototype._initThree = function() {
  this.scene = new THREE.Scene();
  const light = new THREE.DirectionalLight();
  light.position.set(10, 10, 10);
  this.scene.add(light);
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.vr.enabled = true;

  const controller1 = this.renderer.vr.getController(0);
  controller1.addEventListener("selectstart", () => {
    controller1.pressed = true;
  });
  controller1.addEventListener("selectend", () => {
    controller1.pressed = false;
  });
  const controller2 = this.renderer.vr.getController(1);
  controller2.addEventListener("selectstart", () => {
    controller2.pressed = true;
  });
  controller2.addEventListener("selectend", () => {
    controller2.pressed = false;
  });
  this.scene.add(controller1);
  this.scene.add(controller2);
  controller1.add(
    new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.025),
      new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5 })
    )
  );
  controller1.children[0].geometry.computeBoundingSphere();
  controller1.children[0].geometry.txBoundingSphere = controller1.children[0].geometry.boundingSphere.clone();
  controller2.add(
    new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.025),
      new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.5 })
    )
  );
  controller2.children[0].geometry.computeBoundingSphere();
  controller2.children[0].geometry.txBoundingSphere = controller2.children[0].geometry.boundingSphere.clone();

  this.controllers = [controller1, controller2];

  this.renderer.setAnimationLoop(this._animate.bind(this));
  this.camera = new THREE.PerspectiveCamera();
  const dolly = new THREE.Object3D();
  dolly.add(this.camera);
  if (navigator.userAgent.toLowerCase().includes("firefox")) {
    dolly.position.set(0, -0.5, 1);
  }
  this.scene.add(dolly);
};

App.prototype._initCannon = function() {
  this.world = new CANNON.World();
  this.world.gravity.set(0, 0, 0);
  this.world.broadphase = new CANNON.NaiveBroadphase();
  this.world.solver.iterations = 10;

  var groundShape = new CANNON.Plane();
  this.groundBody = new CANNON.Body({
    mass: 0
  });
  this.groundBody.position.set(0, 0.7, 0);
  this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  this.groundBody.addShape(groundShape);
  this.world.add(this.groundBody);
};

App.prototype._animate = function(timestamp) {
  timestamp = timestamp || 0;
  if (!this.start) {
    this.start = timestamp;
  }
  var elapsed = timestamp - this.start;

  for (const controller of this.controllers) {
    controller.children[0].geometry.txBoundingSphere.copy(controller.children[0].geometry.boundingSphere);
    controller.children[0].geometry.txBoundingSphere.applyMatrix4(controller.matrix);
  }
  this.workbench.update(elapsed, this.controllers);

  var TIMESTEP = 1 / 60;
  this.world.step(TIMESTEP, elapsed);

  this.renderer.render(this.scene, this.camera);
};

App.prototype.resizeView = function(width, height) {
  this.width = width;
  this.height = height;
  this.camera.aspect = this.width / this.height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.width, this.height);
};

export default App;
