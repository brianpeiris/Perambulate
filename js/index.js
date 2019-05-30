import * as WEBVR from "exports-loader?WEBVR!three/examples/js/vr/WebVR";
import App from "./App";

var app = new App(window.innerWidth, window.innerHeight);

app.init();
app.resizeView(window.innerWidth, window.innerHeight);
document.body.append(app.renderer.domElement);

document.body.append(WEBVR.createButton(app.renderer));

document.querySelector(".loading-indicator").style.display = "none";

window.addEventListener("resize", function() {
  app.resizeView(window.innerWidth, window.innerHeight);
});
