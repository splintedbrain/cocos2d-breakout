// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geom = require('geometry'),
    Bat = require('Bat'),
    Ball = require('Ball');

// Create a new layer
var Breakout = cocos.nodes.Layer.extend({
    bat: null, 
    ball: null,

    init: function() {
        // You must always call the super class version of init
        Breakout.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        // Get size of canvas
        var s = cocos.Director.get('sharedDirector').get('winSize');


        // Add Bat
        var bat = Bat.create();
        bat.set('position', new geom.Point(160, 280));
        this.addChild({child: bat});
        this.set('bat', bat);


        // Add Ball
        var ball = Ball.create();
        ball.set('position', new geom.Point(140, 210));
        this.addChild({child: ball});
        this.set('ball', ball);


        // Add Map
        var map = cocos.nodes.TMXTiledMap.create({file: '/resources/level1.tmx'});
        map.set('position', new geom.Point(0, 0));
        this.addChild({child: map});
        this.set('map', map);
    },

    mouseMoved: function(evt) {
        var bat = this.get('bat');
 
        var batPos = bat.get('position');
        batPos.x = evt.locationInCanvas.x;
        bat.set('position', batPos);
    },

    restart: function() {
        var director = cocos.Director.get('sharedDirector');

        // Create a scene
        var scene = cocos.nodes.Scene.create();

        // Add our layer to the scene
        scene.addChild({child: Breakout.create()});

        director.replaceScene(scene);
    }
});

// Initialise everything

// Get director
var director = cocos.Director.get('sharedDirector');

// Attach director to our <div> element
director.attachInView(document.getElementById('breakout-demo'));

// Create a scene
var scene = cocos.nodes.Scene.create();

// Add our layer to the scene
scene.addChild({child: Breakout.create()});

// Run the scene
director.runWithScene(scene);
