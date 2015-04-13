(function () {
    var startApp = function () {
        var app = new App(
            window.innerWidth, window.innerHeight,
            glam.Graphics.instance.scene,
            glam.Graphics.instance.camera,
            glam.Graphics.instance.renderer
        );

        window.addEventListener('resize', function () {
            app.resizeView(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('keydown', function (event) {
            if (event.keyCode === 'Z'.charCodeAt(0) ) {
                app.zeroSensor();
            }
        });

        app.on('initialized', function () {
            window.document.querySelector('.loading-indicator').style.display = 'none';
        });

        app.init();
    };

    var glamReadyIntervalId = setInterval(function () {
        if (glam.DOM.isReady) {
            clearInterval(glamReadyIntervalId);
            glam.DOM.viewers.glamRoot.app.controllerScript.controls.enabled = false;
            glam.Application.instance.runloop = function () {};
            startApp();
        }
    }, 10);
}());
