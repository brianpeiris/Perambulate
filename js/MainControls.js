import Controls from "./Controls";

class MainControls extends Controls {
  constructor(scene) {
    super(scene, true);

    this.addButton("img/plus.png", "addActuatorPressed", true);
    this.addButton("img/play.png", "activateActuatorsPressed");
    this.addButton("img/down.png", "enableGravityPressed");
  }
}
export default MainControls;
