import Controls from "./Controls";

class MainControls extends Controls {
  constructor(scene) {
    super(scene, true);

    this.addActuatorButton = this.createButton("addActuatorPressed", false);
    this.activateActuatorsButton = this.createButton("activateActuatorsPressed", true);
    this.enableGravityButton = this.createButton("enableGravityPressed", true);
    this.enableGravityButton = this.createButton("enableGravityPressed", true);
  }
}
export default MainControls;
