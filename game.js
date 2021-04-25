// const gameState = {

// }

var config = {

    type: Phaser.AUTO, //canvas or WebGL
    backgroundColor: '#fcffd1',
    width: 1600,
    height: 896,
    // width: 800,
    // height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: true
        }
    },
    scene: [SearchLinked, InsertionLinked, DeleteLinked],
    // scene: {
    //     preload: preload,
    //     create: create,
    //     update: update
    // },
    // pixelArt: true
};

var game = new Phaser.Game(config);