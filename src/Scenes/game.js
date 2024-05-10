// Name: Sandra Sorensen
// Asssigment: Gallery shooter game
class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");

        this.my = { sprite: {}, text: {} };
        this.playerBullet = [];
        this.spineShipBullet = [];
        this.upAndDownSideToSideShipBullet = [];
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
        this.player = this.add.sprite(this.game.config.width / 2, this.game.config.height - 40, "playerParts", "playerShip1_blue.png");
        this.player.setScale(1);

        // Enemies
        this.spineShip = this.add.follower(this.curve, 10, 10, "enemyParts", "shipGreen_manned.png");
        this.upAndDownSideToSideShipSideToSideShip = this.add.sprite((this.game.config.width / 3) * 2, 80, "enemyParts", "shipGreen_manned.png");

        this.spineShip.startFollow({
            positionOnPath: true,
            duration: 8000,
            yoyo: true,
            repeat: -1,
            rotateToPath: true,
            rotationOffset: 0
        });

        // Set score points for both enemy ships
        this.spineShip.scorePoints = 25;
        this.upAndDownSideToSideShipSideToSideShip.scorePoints = 25;

        // Extra lives
        this.extraLives = this.add.sprite(this.game.config.width / 2, 80, "playerParts", "meteorBrown_med3.png");

        // Using code snippets from class
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

        // Found inspiration for the timing events at https://labs.phaser.io/view.html?src=src/time%5Ctimer%20event.js
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
        // Moving player left
        if (this.left.isDown) {
            if (this.player.x > (this.player.displayWidth / 2)) {
                this.player.x -= this.playerSpeed;
            }
        }

        // Moving player right
        if (this.right.isDown) {
            if (this.player.x < (this.game.config.width - (this.player.displayWidth / 2))) {
                this.player.x += this.playerSpeed;
            }
        }

        // Check for player bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            if (this.playerBullet.length < this.maxPlayerBullets) {
                this.playerBullet.push(this.add.sprite(
                    this.player.x, this.player.y - (this.player.displayHeight / 2), "playerParts", "laserBlue03.png")
                );
                // Play sound
                this.sound.play("laserSound", {
                    volume: 1
                });
            }
        }

        // Update the position of the upAndDownSideToSideShipSideToSideShip
        this.upAndDownSideToSideShipSideToSideShip.x += this.upAndDownSideToSideShipSideToSideShipSpeedX;
        this.upAndDownSideToSideShipSideToSideShip.y += this.upAndDownSideToSideShipSideToSideShipSpeedY;

        // Reverse direction when reaching the edges of the screen
        if (this.upAndDownSideToSideShipSideToSideShip.y <= 0 || this.upAndDownSideToSideShipSideToSideShip.y >= this.game.config.height) {
            this.upAndDownSideToSideShipSideToSideShipSpeedY *= -1;
        }
        if (this.upAndDownSideToSideShipSideToSideShip.x <= 0 || this.upAndDownSideToSideShipSideToSideShip.x >= this.game.config.width) {
            this.upAndDownSideToSideShipSideToSideShipSpeedX *= -1;
        }


        // Make the extra life move smoothly down
        this.extraLives.y += this.extraLivesSpeed;

        if (this.collides(this.player, this.extraLives) && this.extraLives.frame.name === 'pill_blue.png') {
            this.myLives += 1;
            this.extraLives.y = -100;
            this.extraLives.destroy();
            this.updateLives();
        }
        else if (this.collides(this.player, this.extraLives) && this.extraLives.frame.name !== 'pill_blue.png') {
            this.myLives -= 0.5;
            this.extraLives.y = -100;
            this.extraLives.destroy();
            this.updateLives();
        }

        // Emit enemy bullets at regular intervals
        this.enemyBulletCounter++;
        if (this.enemyBulletCounter >= this.enemyBulletFrequency) {
            this.emitEnemyBullet();
            this.enemyBulletCounter = 0;
        }

        // Filter out player bullets and enemy bullets that have moved off the top edge of the screen
        this.playerBullet = this.playerBullet.filter((playerBullet) => playerBullet.y > -(playerBullet.displayHeight / 2));
        this.spineShipBullet = this.spineShipBullet.filter((bullet) => bullet.y < this.game.config.height + (bullet.displayHeight / 2));
        this.upAndDownSideToSideShipBullet = this.upAndDownSideToSideShipBullet.filter((bullet) => bullet.y < this.game.config.height + (bullet.displayHeight / 2));

        // Using code snippets from class
        // Check for collision with the extra live
        for (let bullet of this.playerBullet) {
            if (this.collides(this.extraLives, bullet)) {
                if (this.extraLives.texture.key === 'playerParts' && this.extraLives.frame.name === 'meteorBrown_med3.png') {
                    bullet.y = -100;
                    this.extraLives.setTexture('playerParts', 'meteorBrown_small2.png');
                }
                else if (this.extraLives.texture.key === 'playerParts' && this.extraLives.frame.name === 'meteorBrown_small2.png') {
                    bullet.y = -100;
                    this.extraLives.setTexture('playerParts', 'meteorBrown_tiny2.png');
                }
                else if (this.extraLives.texture.key === 'playerParts' && this.extraLives.frame.name === 'meteorBrown_tiny2.png') {
                    bullet.y = -100;
                    this.extraLives.setTexture('playerParts', 'pill_blue.png');
                }
            }
        }

        // Using code snippets from class
        // Check for collision with the enemy ships
        for (let bullet of this.playerBullet) {
            if (this.collides(this.upAndDownSideToSideShipSideToSideShip, bullet)) {

                // start animation
                this.puff = this.add.sprite(this.upAndDownSideToSideShipSideToSideShip.x, this.upAndDownSideToSideShipSideToSideShip.y, "whitePuff03").setScale(0.25).play("puff");
                // clear out bullet
                bullet.y = -100;
                this.upAndDownSideToSideShipSideToSideShip.visible = false;
                this.upAndDownSideToSideShipSideToSideShip.x = -100;
                // Update score
                this.myScore += this.upAndDownSideToSideShipSideToSideShip.scorePoints;
                this.updateScore();
                // Have new enemy appear after end of animation
                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.upAndDownSideToSideShipSideToSideShip.visible = true;
                    this.upAndDownSideToSideShipSideToSideShip.x = Math.random() * this.game.config.width;
                }, this);
            }
        }

        // Using code snippets from class
        // Check for collision with the enemy ships
        for (let bullet of this.playerBullet) {
            if (this.spineShip.visible && this.collides(this.spineShip, bullet)) {

                // start animation
                this.puff = this.add.sprite(this.spineShip.x, this.spineShip.y, "whitePuff03").setScale(0.25).play("puff");
                // clear out bullet
                bullet.y = -100;
                this.spineShip.visible = false;
                this.spineShip.x = -100;
                // Update score
                this.myScore += this.spineShip.scorePoints;
                this.updateScore();
                // Have new enemy appear after end of animation
                this.puff.on(Phaser.Animations.Events.ANIMATION_START, () => {
                    // Choose a random point from the spline
                    const randomT = Math.random(); // Random parameter along the spline
                    const point = this.curve.getPoint(randomT); // Get the point on the spline at the random parameter
                    this.spineShip.x = point.x;
                    this.spineShip.y = point.y;
                }, this);

                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    // Respawn the spineShip
                    this.spineShip.visible = true;
                }, this);

            }
        }

        // Check for collision with the player
        for (let bullet of this.spineShipBullet) {
            if (this.collides(this.player, bullet)) {
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
        for (let bullet of this.upAndDownSideToSideShipBullet) {
            if (this.collides(this.player, bullet)) {
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
        if (this.extraLives.y > this.game.config.height) {
            // Destroy the extra life sprite
            this.extraLives.destroy();
        }

        // Make all of the bullets move
        for (let bullet of this.playerBullet) {
            bullet.y -= this.playerBulletSpeed;
        }
        for (let bullet of this.spineShipBullet) {
            bullet.y += this.enemyBulletSpeed;
        }
        for (let bullet of this.upAndDownSideToSideShipBullet) {
            bullet.y += this.enemyBulletSpeed;
        }
    }

    // Emit an enemy bullet// Emit an enemy bullet
    emitEnemyBullet() {
        let my = this.my;

        // Check if low enemy ship exists and is visible
        if (this.spineShip && this.spineShip.visible) {
            // Create bullet sprite at the position of the low enemy ship
            let spineShipBullet = this.add.sprite(
                this.spineShip.x,
                this.spineShip.y + (this.spineShip.displayHeight / 2),
                "playerParts",
                "laserGreen02.png"
            );

            // Add bullet to the array
            this.spineShipBullet.push(spineShipBullet);
        }

        // Check if high enemy ship exists and is visible
        if (this.upAndDownSideToSideShipSideToSideShip && this.upAndDownSideToSideShipSideToSideShip.visible) {
            // Create bullet sprite at the position of the high enemy ship
            let upAndDownSideToSideShipBullet = this.add.sprite(
                this.upAndDownSideToSideShipSideToSideShip.x,
                this.upAndDownSideToSideShipSideToSideShip.y + (this.upAndDownSideToSideShipSideToSideShip.displayHeight / 2),
                "playerParts",
                "laserGreen02.png"
            );

            // Add bullet to the array
            this.upAndDownSideToSideShipBullet.push(upAndDownSideToSideShipBullet);
        }
    }

    // A center-radius AABB collision check
    // Using code snippets from class
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