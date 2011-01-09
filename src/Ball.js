var cocos = require('cocos2d'),
    geom = require('geometry'),
    util = require('util');

var Ball = cocos.nodes.Node.extend({
    velocity: null,

    init: function() {
        @super;

        var sprite = cocos.nodes.Sprite.create({
                         file: '/resources/sprites.png',
                         rect: new geom.Rect(64, 0, 16, 16)
                     });

        sprite.set('anchorPoint', new geom.Point(0, 0));
        this.addChild({child: sprite});
        this.set('contentSize', sprite.get('contentSize'));

        this.set('velocity', new geom.Point(60, 120));
        this.scheduleUpdate();

    },

    update: function(dt) {
        var pos = util.copy(this.get('position')),
            vel = util.copy(this.get('velocity'));

        // Test X position
        if (!this.testBlockCollision('x', dt * vel.x)) {
            // Adjust X position
            pos.x += dt * vel.x;
            this.set('position', pos);
        }


        // Test Y position
        if (!this.testBlockCollision('y', dt * vel.y)) {
            // Adjust Y position
            pos.y += dt * vel.y;
            this.set('position', pos);
        }

        // Test Edges and bat
        this.testBatCollision();
        this.testEdgeCollision();
    },

    testBatCollision: function() {
        var vel = util.copy(this.get('velocity')),
            ballBox = this.get('boundingBox'),
            // The parent of the ball is the Breakout Layer, which has a 'bat'
            // property pointing to the player's bat.
            batBox = this.get('parent').get('bat').get('boundingBox');

        // If moving down then check for collision with the bat
        if (vel.y > 0) {
            if (geom.rectOverlapsRect(ballBox, batBox)) {
                // Flip Y velocity
                vel.y *= -1;
            }
        }

        // Update position and velocity on the ball
        this.set('velocity', vel);
    },

    testEdgeCollision: function() {
        var vel = util.copy(this.get('velocity')),
            ballBox = this.get('boundingBox'),
            // Get size of canvas
            winSize = cocos.Director.get('sharedDirector').get('winSize');

        // Moving left and hit left edge
        if (vel.x < 0 && geom.rectGetMinX(ballBox) < 0) {
            // Flip Y velocity
            vel.x *= -1;
        }

        // Moving right and hit right edge
        if (vel.x > 0 && geom.rectGetMaxX(ballBox) > winSize.width) {
            // Flip X velocity
            vel.x *= -1;
        }

        // Moving up and hit top edge
        if (vel.y < 0 && geom.rectGetMinY(ballBox) < 0) {
            // Flip X velocity
            vel.y *= -1;
        }

        // Moving down and hit bottom edge - DEATH
        if (vel.y > 0 && geom.rectGetMinY(ballBox) > winSize.height) {
            // Restart game
            this.get('parent').restart();
        }

        this.set('velocity', vel);
    },

    testBlockCollision: function(axis, dist) {
        var vel = util.copy(this.get('velocity')),
            box = this.get('boundingBox'),
            // A map is made of mulitple layers, but we only have 1.
            mapLayer = this.get('parent').get('map').get('children')[0];

        // Add the amount we're going to move onto the box
        box.origin[axis] += dist;

        // Record which blocks were hit
        var hitBlocks = [];

        // We will test each corner of the ball for a hit
        var testPoints = {
            nw: util.copy(box.origin),
            sw: new geom.Point(box.origin.x, box.origin.y + box.size.height),
            ne: new geom.Point(box.origin.x + box.size.width, box.origin.y),
            se: new geom.Point(box.origin.x + box.size.width, box.origin.y + box.size.height)
        };

        for (var corner in testPoints) {
            var point = testPoints[corner];

            // All our blocks are 32x16 pixels
            var tileX = Math.floor(point.x / 32),
                tileY = Math.floor(point.y / 16),
                tilePos = new geom.Point(tileX, tileY);

            // Tile ID 0 is an empty tile, everything else is a hit
            if (mapLayer.tileGID(tilePos) > 0) {
                hitBlocks.push(tilePos);
            }
        }

        // If we hit something, swap directions
        if (hitBlocks.length > 0) {
            vel[axis] *= -1;
        }

        this.set('velocity', vel);

        // Remove the blocks we hit
        for (var i=0; i<hitBlocks.length; i++) {
            mapLayer.removeTile(hitBlocks[i]);
        }

        return (hitBlocks.length > 0)
    }
});

module.exports = Ball;
