(function () {
    var MainControls = function (scene, leapController) {
        Controls.call(this, scene, leapController, '#mainControls', true);

        this.addActuatorButton = this.createButton(
            '.addActuator', 'addActuatorPressed', false);
        this.activateActuatorsButton = this.createButton(
            '.activateActuators', 'activateActuatorsPressed', true);
        this.enableGravityButton = this.createButton(
            '.enableGravity', 'enableGravityPressed', true);
    };
    MainControls.prototype = Object.create(Controls.prototype);
    window.MainControls = MainControls;
}());
