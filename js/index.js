(function () {
    var app = new App(window.innerWidth, window.innerHeight);

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
}());
