// Name: Sandra Sorensen
// Asssigment: Gallery shooter game

class StartScene extends Phaser.Scene {
    constructor() {
        super("startScene");
        this.spaceKey = null;
    }

    preload() {
        // Load bitmap font
        this.load.bitmapFont("rocketSquare", "./assets/KennyRocketSquare.png", "./assets/KennyRocketSquare.fnt");

        // Load background
        this.load.image("black", "./assets/black.png");
    }

    create() {
        this.load.setPath("./assets/");

        // Add background
        const backgroundImage = this.add.image(0, 0, "black").setOrigin(0, 0);

        // Set the scale of the background image to fill the entire screen
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );
        // Add bitmap text
        const text = this.add.bitmapText(0, 0, 'rocketSquare', 'Gallery shooter\nPress space bar to \nbegin the game');
        // Set tint color
        text.setTint(0xff69b4);

        // Calculate center of the screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Set text origin to center
        text.setOrigin(0.5);

        // Set initial position to the center of the screen
        text.setPosition(centerX, centerY);


        // Found inspiration for the animations at https://labs.phaser.io/view.html?src=src/time%5Ctimer%20event.js
        // Create a tween animation to scale the text
        this.tweens.add({
            targets: text,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000, // Duration of the animation in milliseconds
            yoyo: true, // Play the animation in reverse after it finishes
            repeat: -1, // Repeat indefinitely
        });

        // Event listener for space key down event
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Event listener for h key down event for seeing highscore
        this.hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    }

    update() {
        if (this.spaceKey.isDown) {
            this.scene.start("gameScene");
        }
    }
}
