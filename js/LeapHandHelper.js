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

    var getBoneCenter = function (bone) {
        return new THREE.Vector3().fromArray(bone.center());
    };

    var getFingerPositionDetails = function (finger) {
        var metacarpalPosition = getBoneCenter(finger.metacarpal);
        var proximalPosition = getBoneCenter(finger.proximal);
        var boneLength = finger.metacarpal.length + finger.proximal.length;
        var distance = metacarpalPosition.distanceTo(proximalPosition);
        return {distance: distance, boneLength: boneLength};
    };

    LeapHandHelper.prototype.fingerStraight = function (finger) {
        var details = getFingerPositionDetails(finger);
        var threshold = details.boneLength * 0.479;
        return details.distance > threshold;
    };

    LeapHandHelper.prototype.fingerBent = function (finger) {
        var details = getFingerPositionDetails(finger);
        var threshold = details.boneLength * 0.453;
        return details.distance < threshold;
    };

    window.LeapHandHelper = LeapHandHelper;
}());
