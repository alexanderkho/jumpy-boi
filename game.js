var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  });
}

function create() {
  sky = this.add.image(400, 300, 'sky').setScrollFactor(1, 0);

  platforms = this.physics.add.staticGroup();

  //always position first platform beneath player
  platforms.create(400, 500, 'ground').setScale(0.5).refreshBody();

  for (var i = 0; i < 4; i++) {
    var x = Phaser.Math.Between(100, 600);
    var y = i * 120;
    platforms.create(x, y, 'ground').setScale(0.5).refreshBody();
  }

  player = this.physics.add.sprite(400, 450, 'dude');

  player.setBounce(0.2);

  this.anims.create({
    key: 'left',
    frames: [{ key: 'dude', frame: 3 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'dude', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: [{ key: 'dude', frame: 8 }],
    frameRate: 20
  });

  var score = 0;
  var scoreText = this.add
    .text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff'
    })
    .setScrollFactor(0);

  this.physics.add.collider(player, platforms, updateScore);

  function updateScore(player, platform) {
    if (!platform.touched && player.body.touching.down) {
      score += 10;
      scoreText.setText('Score: ' + score);
      platform.touched = true;
    }
  }

  cursors = this.input.keyboard.createCursorKeys();

  camera = this.cameras.main;
  camera.startFollow(player);
  camera.setDeadzone(800 * 1.5);
}

function update() {
  //movement controls

  //left-right
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  //jump
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
    player.isJumping = true;
  }

  //horizontal wrap
  var halfWidth = player.displayWidth * 0.5;
  var gameWidth = 800;
  if (player.x < -halfWidth) {
    player.x = 800 + halfWidth;
  } else if (player.x > gameWidth + halfWidth) {
    player.x = -halfWidth;
  }

  //loop platforms
  platforms.children.iterate(function (platform) {
    var scrollY = camera.scrollY;
    if (platform.y >= scrollY + 700) {
      platform.y = scrollY + Phaser.Math.Between(-10, 10);
      platform.x = Phaser.Math.Between(100, 600);
      platform.touched = false;
      platform.body.updateFromGameObject();
    }
  });

  //check for death
  var lowestPlatform = null;
  platforms.children.iterate(function (platform) {
    if (!lowestPlatform || platform.y > lowestPlatform.y) {
      lowestPlatform = platform;
    }
  });
  // console.log(lowestPlatform);
  if (player.body.y > lowestPlatform.y) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    var game = this.scene;
    this.add
      .text(300, camera.scrollY + 400, 'New Game?', {
        fontSize: '32px',
        fill: '#00ff15',
        backgroundColor: 'black'
      })
      .setPadding(10, 10)
      .setInteractive()
      .on('pointerup', function () {
        game.restart();
      });
  }

  if (camera.scrollY < -2000) {
    sky.setTint(0xb197c4);
  }

  if (camera.scrollY < -3000) {
    sky.setTint(0x9763bf);
  }
}
