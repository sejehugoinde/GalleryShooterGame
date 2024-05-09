// Name: Sandra Sorensen
// Asssigment: Gallery shooter game

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("gameOver");
        this.spaceKey = null;
        this.my = { sprite: {}, text: {} };
    }

    preload() {
        this.load.bitmapFont("rocketSquare", "./assets/KennyRocketSquare.png", "./assets/KennyRocketSquare.fnt");
        this.load.image("black", "./assets/black.png");
    }

    create(data) {
        // Access the score from the data object
        const score = data.score;

        // Display the "GAME OVER" text in the game over screen
        const gameOverText = this.add.bitmapText(0, 0, 'rocketSquare', 'GAME OVER');
        // Set tint color
        gameOverText.setTint(0xff69b4);
        // Set text origin to center
        gameOverText.setOrigin(0.5);
        // Calculate center of the screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY - 50; // Adjusted position for "GAME OVER" text
        // Set position to the center of the screen
        gameOverText.setPosition(centerX, centerY);

        // Display the score text in the game over screen
        const scoreText = this.add.bitmapText(0, 0, 'rocketSquare', 'Score: ' + score);
        // Set tint color
        scoreText.setTint(0xff69b4);
        // Set text origin to center
        scoreText.setOrigin(0.5);
        // Set position below "GAME OVER" text
        scoreText.setPosition(centerX, centerY + 50); // Adjusted position for score text

        // Display the instruction text in the game over screen
        const instructionText = this.add.bitmapText(0, 0, 'rocketSquare', 'Tap esc to return to start page\nTap space bar to restart game');
        // Set tint color
        instructionText.setTint(0xff69b4);
        // Set text origin to center
        instructionText.setOrigin(0.5);
        // Set position below score text
        instructionText.setPosition(centerX, centerY + 100); // Adjusted position for instruction text

        // Event listener for space key down event
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Event listener for space key down event
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }
    
    update() {

        if (this.spaceKey.isDown) {
            this.scene.start("gameScene");
        }

        if (this.escKey.isDown) {
            this.scene.start("startScene");
        }
    }
}
