// Name: Sandra Sorensen
// Asssigment: Gallery shooter game
class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");

        this.my = { sprite: {}, text: {} };
        this.my.sprite.playerBullet = [];
        this.my.sprite.spineShipBullet = [];
        this.my.sprite.upAndDownSideToSideShipBullet = [];
        this.maxPlayerBullets = 3;
        this.extraLivesSpeed = 2;
        this.enemyBulletCounter = 0;
        this.enemyBulletFrequency = 60;
        this.lastTime = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("playerParts", "sheet.png", "sheet.xml");
        this.load.atlasXML("enemyParts", "spritesheet_spaceships.png", "sheet2.xml");
        this.load.atlasXML("enemyParts2", "spritesheet_lasers.png", "sheet3.xml");
        this.load.image("meteorBrown_tiny2.png");
        this.load.image("meteorBrown_small2.png");
        this.load.image("meteorBrown_med3.png");
        this.load.image("meteorBrown_big4.png");
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");
        this.load.bitmapFont("rocketSquare", "./assets/KennyRocketSquare.png", "./assets/KennyRocketSquare.fnt");
        this.load.image("black", "./assets/black.png");
        this.load.audio("laserSound", "sfx_laser1.ogg");
    }

    create() {
        let my = this.my;

        this.load.setPath("./assets/");

        // Create a curve
        this.points = [
            46, 115,
            56, 271,
            77, 420,
            275, 461,
            414, 419,
            444, 305,
            544, 187,
            607, 192,
            648, 257,
            668, 369
        ];
        this.curve = new Phaser.Curves.Spline(this.points);

        // Add background
        const backgroundImage = this.add.image(0, 0, "black").setOrigin(0, 0);

        // Set the scale of the background image to fill the entire screen
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );

        // Player
        my.sprite.player = this.add.sprite(this.game.config.width / 2, this.game.config.height - 40, "playerParts", "playerShip1_blue.png");
        my.sprite.player.setScale(1);

        // Enemies
        //my.sprite.spineShip = this.add.sprite(this.game.config.width / 3, 80, "enemyParts", "shipGreen_manned.png");
        my.sprite.spineShip = this.add.follower(this.curve, 10, 10, "enemyParts", "shipGreen_manned.png");
        my.sprite.upAndDownSideToSideShipSideToSideShip = this.add.sprite((this.game.config.width / 3) * 2, 80, "enemyParts", "shipGreen_manned.png");

        my.sprite.spineShip.startFollow({
            positionOnPath: true,
            duration: 8000,
            yoyo: true,
            repeat: -1,
            rotateToPath: true,
            rotationOffset: 0
        });

        // Set score points for both enemy ships
        my.sprite.spineShip.scorePoints = 25;
        my.sprite.upAndDownSideToSideShipSideToSideShip.scorePoints = 25;

        //Extra lives
        my.sprite.extraLives = this.add.sprite(this.game.config.width / 2, 80, "playerParts", "meteorBrown_med3.png");

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,
            repeat: 5,
            hideOnComplete: true
        });

        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.decrementTime, callbackScope: this, loop: true });
        this.extraLifeTimer = this.time.addEvent({ delay: 20000, callback: this.spawnExtraLife, callbackScope: this, loop: true });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds
        this.playerSpeed = 5;
        this.playerBulletSpeed = 10;
        this.enemyBulletSpeed = 10;
        this.extraLivesSpeed = 1;

        // Set movement speeds for both enemy ships
        this.spineShipSpeed = 1;
        this.upAndDownSideToSideShipSideToSideShipSpeed = 2;
        this.upAndDownSideToSideShipSideToSideShipSpeedX = 2;
        this.upAndDownSideToSideShipSideToSideShipSpeedY = 2;

        document.getElementById('description').innerHTML = '<h2>Gallery Shooter.js</h2><br>A: left // D: right // Space: fire/emit'

        // Put score on screen
        this.myScore = 0;
        this.myLives = 3;
        this.myTime = 60;
        this.nextSecond = 0;

        // Create score text
        my.text.score = this.add.bitmapText(10, 0, "rocketSquare", "Score: " + this.myScore);

        // Create lives text below score
        my.text.lives = this.add.bitmapText(10, my.text.score.y + my.text.score.height + 5, "rocketSquare", "Lives: " + this.myLives);

        // Create time text below lives
        my.text.time = this.add.bitmapText(10, my.text.lives.y + my.text.lives.height + 5, "rocketSquare", "Time left: " + this.myTime);
    }

    update() {
        let my = this.my;

        // Moving player left
        if (this.left.isDown) {
            if (my.sprite.player.x > (my.sprite.player.displayWidth / 2)) {
                my.sprite.player.x -= this.playerSpeed;
            }
        }

        // Moving player right
        if (this.right.isDown) {
            if (my.sprite.player.x < (this.game.config.width - (my.sprite.player.displayWidth / 2))) {
                my.sprite.player.x += this.playerSpeed;
            }
        }

        // Check for player bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if (my.sprite.playerBullet.length < this.maxPlayerBullets) {
                my.sprite.playerBullet.push(this.add.sprite(
                    my.sprite.player.x, my.sprite.player.y - (my.sprite.player.displayHeight / 2), "playerParts", "laserBlue03.png")
                );
                // Play sound
                this.sound.play("laserSound", {
                    volume: 1
                });
            }
        }

        // Update the position of the upAndDownSideToSideShipSideToSideShip
        my.sprite.upAndDownSideToSideShipSideToSideShip.x += this.upAndDownSideToSideShipSideToSideShipSpeedX;
        my.sprite.upAndDownSideToSideShipSideToSideShip.y += this.upAndDownSideToSideShipSideToSideShipSpeedY;

        // Reverse direction when reaching the edges of the screen
        if (my.sprite.upAndDownSideToSideShipSideToSideShip.y <= 0 || my.sprite.upAndDownSideToSideShipSideToSideShip.y >= this.game.config.height) {
            this.upAndDownSideToSideShipSideToSideShipSpeedY *= -1;
        }
        if (my.sprite.upAndDownSideToSideShipSideToSideShip.x <= 0 || my.sprite.upAndDownSideToSideShipSideToSideShip.x >= this.game.config.width) {
            this.upAndDownSideToSideShipSideToSideShipSpeedX *= -1;
        }


        // Make the extra life move smoothly down
        my.sprite.extraLives.y += this.extraLivesSpeed;

        if (this.collides(my.sprite.player, my.sprite.extraLives) && my.sprite.extraLives.frame.name === 'pill_blue.png') {
            this.myLives += 1;
            my.sprite.extraLives.y = -100;
            my.sprite.extraLives.destroy();
            this.updateLives();
        }
        else if (this.collides(my.sprite.player, my.sprite.extraLives) && my.sprite.extraLives.frame.name !== 'pill_blue.png') {
            this.myLives -= 0.5;
            my.sprite.extraLives.y = -100;
            my.sprite.extraLives.destroy();
            this.updateLives();
        }

        // Emit enemy bullets at regular intervals
        this.enemyBulletCounter++;
        if (this.enemyBulletCounter >= this.enemyBulletFrequency) {
            this.emitEnemyBullet();
            this.enemyBulletCounter = 0;
        }

        // Filter out player bullets and enemy bullets that have moved off the top edge of the screen
        my.sprite.playerBullet = my.sprite.playerBullet.filter((playerBullet) => playerBullet.y > -(playerBullet.displayHeight / 2));
        my.sprite.spineShipBullet = my.sprite.spineShipBullet.filter((bullet) => bullet.y < this.game.config.height + (bullet.displayHeight / 2));
        my.sprite.upAndDownSideToSideShipBullet = my.sprite.upAndDownSideToSideShipBullet.filter((bullet) => bullet.y < this.game.config.height + (bullet.displayHeight / 2));

        // Check for collision with the extra live
        for (let bullet of my.sprite.playerBullet) {
            if (this.collides(my.sprite.extraLives, bullet)) {
                if (my.sprite.extraLives.texture.key === 'playerParts' && my.sprite.extraLives.frame.name === 'meteorBrown_med3.png') {
                    bullet.y = -100;
                    my.sprite.extraLives.setTexture('playerParts', 'meteorBrown_small2.png');
                }
                else if (my.sprite.extraLives.texture.key === 'playerParts' && my.sprite.extraLives.frame.name === 'meteorBrown_small2.png') {
                    bullet.y = -100;
                    my.sprite.extraLives.setTexture('playerParts', 'meteorBrown_tiny2.png');
                }
                else if (my.sprite.extraLives.texture.key === 'playerParts' && my.sprite.extraLives.frame.name === 'meteorBrown_tiny2.png') {
                    bullet.y = -100;
                    my.sprite.extraLives.setTexture('playerParts', 'pill_blue.png');
                }
            }
        }

        // Check for collision with the enemy ships
        for (let bullet of my.sprite.playerBullet) {
            if (this.collides(my.sprite.upAndDownSideToSideShipSideToSideShip, bullet)) {

                // start animation
                this.puff = this.add.sprite(my.sprite.upAndDownSideToSideShipSideToSideShip.x, my.sprite.upAndDownSideToSideShipSideToSideShip.y, "whitePuff03").setScale(0.25).play("puff");
                // clear out bullet
                bullet.y = -100;
                my.sprite.upAndDownSideToSideShipSideToSideShip.visible = false;
                my.sprite.upAndDownSideToSideShipSideToSideShip.x = -100;
                // Update score
                this.myScore += my.sprite.upAndDownSideToSideShipSideToSideShip.scorePoints;
                this.updateScore();
                // Have new enemy appear after end of animation
                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    my.sprite.upAndDownSideToSideShipSideToSideShip.visible = true;
                    my.sprite.upAndDownSideToSideShipSideToSideShip.x = Math.random() * this.game.config.width;
                }, this);
            }
        }

        // Check for collision with the enemy ships
        for (let bullet of my.sprite.playerBullet) {
            if (my.sprite.spineShip.visible && this.collides(my.sprite.spineShip, bullet)) {

                // start animation
                this.puff = this.add.sprite(my.sprite.spineShip.x, my.sprite.spineShip.y, "whitePuff03").setScale(0.25).play("puff");
                // clear out bullet
                bullet.y = -100;
                my.sprite.spineShip.visible = false;
                my.sprite.spineShip.x = -100;
                // Update score
                this.myScore += my.sprite.spineShip.scorePoints;
                this.updateScore();
                // Have new enemy appear after end of animation
                this.puff.on(Phaser.Animations.Events.ANIMATION_START, () => {
                    // Choose a random point from the spline
                    const randomT = Math.random(); // Random parameter along the spline
                    const point = this.curve.getPoint(randomT); // Get the point on the spline at the random parameter
                    my.sprite.spineShip.x = point.x;
                    my.sprite.spineShip.y = point.y;
                }, this);

                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    // Respawn the spineShip
                    my.sprite.spineShip.visible = true;
                }, this);

            }
        }

        // Check for collision with the player
        for (let bullet of my.sprite.spineShipBullet) {
            if (this.collides(my.sprite.player, bullet)) {
                bullet.y = -100;
                this.myLives -= 1;
                if (this.myLives == 0) {
                    this.updateLives();
                    this.scene.start("gameOver");
                }
                this.updateLives();
            }
        }

        // Check for collision with the player
        for (let bullet of my.sprite.upAndDownSideToSideShipBullet) {
            if (this.collides(my.sprite.player, bullet)) {
                bullet.y = -100;
                this.myLives -= 1;
                if (this.myLives == 0) {
                    this.updateLives();
                    this.scene.start("gameOver");
                }
                this.updateLives();
            }
        }

        // Check if the extra life is off the screen vertically (below the screen)
        if (my.sprite.extraLives.y > this.game.config.height) {
            // Destroy the extra life sprite
            my.sprite.extraLives.destroy();
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.playerBullet) {
            bullet.y -= this.playerBulletSpeed;
        }
        for (let bullet of my.sprite.spineShipBullet) {
            bullet.y += this.enemyBulletSpeed;
        }
        for (let bullet of my.sprite.upAndDownSideToSideShipBullet) {
            bullet.y += this.enemyBulletSpeed;
        }
    }

    // Emit an enemy bullet// Emit an enemy bullet
    emitEnemyBullet() {
        let my = this.my;

        // Check if low enemy ship exists and is visible
        if (my.sprite.spineShip && my.sprite.spineShip.visible) {
            // Create bullet sprite at the position of the low enemy ship
            let spineShipBullet = this.add.sprite(
                my.sprite.spineShip.x,
                my.sprite.spineShip.y + (my.sprite.spineShip.displayHeight / 2),
                "playerParts",
                "laserGreen02.png"
            );

            // Add bullet to the array
            my.sprite.spineShipBullet.push(spineShipBullet);
        }

        // Check if high enemy ship exists and is visible
        if (my.sprite.upAndDownSideToSideShipSideToSideShip && my.sprite.upAndDownSideToSideShipSideToSideShip.visible) {
            // Create bullet sprite at the position of the high enemy ship
            let upAndDownSideToSideShipBullet = this.add.sprite(
                my.sprite.upAndDownSideToSideShipSideToSideShip.x,
                my.sprite.upAndDownSideToSideShipSideToSideShip.y + (my.sprite.upAndDownSideToSideShipSideToSideShip.displayHeight / 2),
                "playerParts",
                "laserGreen02.png"
            );

            // Add bullet to the array
            my.sprite.upAndDownSideToSideShipBullet.push(upAndDownSideToSideShipBullet);
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    // Update the score text
    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    // Update the lives text
    updateLives() {
        let my = this.my;
        my.text.lives.setText("Lives: " + this.myLives);

        if (this.myLives === 0) {
            // Pass the score to the GameOverScene
            this.scene.start("gameOver", { score: this.myScore });
        }
    }

    // Decrementing the time
    decrementTime() {
        this.myTime--;
        this.updateTime();
        if (this.myTime === 0) {
            this.scene.start("gameOver");
        }
    }
    // Update the time text
    updateTime() {
        let my = this.my;
        my.text.time.setText("Time left: " + this.myTime);
    }
}