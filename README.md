# Perambulate

Perambulate is a physics-based, VR construction game inspired by sodaplay.

Use actuators to build machines and set them loose.

To try Perambulate, you need a [WebVR compatible browser](http://webvr.info/) and a Leap Motion
controller attached to your HMD.

Perambulate was developed in [Firefox Nightly](http://mozvr.com/) with an Oculus Rift DK2 but 
it should work with Chrome WebVR builds and with a DK1.

## Usage and Tips

Watch the video to get an idea of how Perambulate works: http://youtu.be/qLC8L-58Juk

Bend the middle and ring fingers on your left hand to display the control panels :metal:.

The main control panel appears when your palm is facing up. The actuator control panel appears when your palm is facing down. The main control panel lets you add new actuators, which appear in the center of the environment, activate the actuator animations and enable gravity. The actuator control panel lets you change the amplitude (the y-axis) and the phase (the x-axis) of the actuator's animation. Select actuators to control by poking them with your index finger.

Be deliberate with your hand movements. The pose and grab detection isn't very intelligent and the Leap Motion can be very glitchy.

Get the most out of your Leap Motion by following the VR troubleshooting guide: http://blog.leapmotion.com/troubleshooting-guide-vr-tracking/

## Known Issues

The app can sometimes start in a bad state. You'll notice that lights are much darker or that only one eye is lit up in VR mode. Just refresh once or twice until it starts correctly.

Your construction can sometimes go crazy if two actuators join at weird angles or when you don't mean to. This can probably be improved but it's partly due to the Leap Motion's glitches. See the link to the troubleshooting guide above.

The slider widget on the actuator control panel kinda sucks. It doesn't behave as you'd expect and doesn't like being angled in odd positions. I'm going to have to submit some patches to Leap Motion's widget library.

## Attributions

- Three.js by mrdoob et al. - https://github.com/mrdoob/three.js
- Cannon.js by schteppe - https://github.com/schteppe/cannon.js
- WebVR boilerplate by borismus - https://github.com/borismus/webvr-boilerplate
- LeapJS library, plugins and widgets - https://github.com/leapmotion/leapjs
- Glam by tparisi - https://github.com/tparisi/glam
- Backbone and Underscore by jasenkas et al. - https://github.com/jashkenas/underscore
- Icons by http://glyphicons.com/
