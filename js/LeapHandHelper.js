(function () {
    var LeapHandHelper = function (hand) {
        this.palmPosition = new THREE.Vector3().fromArray(hand.palmPosition);
        this.palmQuaternion = this.getPalmQuaternion(hand);
    };

    var getMatrixFromArray = function (arr) {
        var matrix = new THREE.Matrix4();
        matrix.set(
            arr[0], arr[1], arr[2], 0,
            arr[4], arr[5], arr[6], 0,
            arr[8], arr[9], arr[10], 0,
            0, 0, 0, 0
        );
        return matrix;
    };

    var ROTATION_OFFSET = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    LeapHandHelper.prototype.getPalmQuaternion = function (hand) {
        var quaternion = new THREE.Quaternion().setFromRotationMatrix(
            getMatrixFromArray(hand.indexFinger.metacarpal.matrix()));
        quaternion.inverse();
        quaternion.multiply(ROTATION_OFFSET);
        return quaternion;
    };
    window.LeapHandHelper = LeapHandHelper;
}());
