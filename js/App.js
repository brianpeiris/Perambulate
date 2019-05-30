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
  const controller2 = this.renderer.vr.getController(1);
  this.scene.add(controller1);
  this.scene.add(controller2);

  var geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
  var line = new THREE.Line(geometry);
  line.name = "line";
  line.scale.z = 5;
  controller1.add(line.clone());
  controller2.add(line.clone());

  this.renderer.setAnimationLoop(this._animate.bind(this));
  this.camera = new THREE.PerspectiveCamera();
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
  this.groundBody.position.set(0, -0.5, 0);
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

  this.workbench.update(elapsed);

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
