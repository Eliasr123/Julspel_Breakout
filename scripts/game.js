/**
 * Block class for drawing bars of different sizes.
 * Used by player and on its own.
 */
class Block {
    constructor(x, y) {
        this._height = 45;
        this._width = 150;
        this.alive = true;
        this.x = x;
        this.y = y;
    }
    /**
     * Draws the block object
     * @param ctx The canvas rendering context.
     */
    draw(ctx) {
        if (this.alive) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    /**
     * Returns the width.
     */
    get width() {
        return this._width;
    }
    /**
     * Returns the height.
     */
    get height() {
        return this._height;
    }
    /**
     * @param value Sets the height.
     */
    set height(value) {
        this._height = value;
    }
}
/**
 * The player class that handles player movement.
 */
class Player {
    constructor(ctx) {
        this.moveBlock = null;
        this.bar = new Block(575, 690);
        this.bar.height = 25;
        this.bar.draw(ctx);
    }
    /**
     * Sets the player movement to go left.
     */
    left() {
        this.moveBlock = true;
    }
    /**
     * Sets the player movement to go right.
     */
    right() {
        this.moveBlock = false;
    }
    /**
     * Stops the players movement
     */
    stop() {
        this.moveBlock = null;
    }
    /**
     * Moves the players block. Also checks that the player
     * does not go outside the border.
     */
    move() {
        if (this.moveBlock == true) {
            if (this.bar.x >= 5) {
                this.bar.x -= 5;
            }
        }
        else if (this.moveBlock == false) {
            if (this.bar.x <= 1295 - this.bar.width) {
                this.bar.x += 5;
            }
        }
    }
}
/**
 * The ball object that is used to break out.
 */
class Ball {
    constructor(x, y, dirX, dirY) {
        this.bound = true;
        this.x = x;
        this.y = y;
        this._dirX = dirX;
        this._dirY = dirY;
    }
    /**
     * Draws the ball.
     * @param ctx The canvas rendering context.
     */
    draw(ctx) {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    }
    move() {
        this.x += this._dirX;
        this.y += this._dirY;
    }
    /**
     * Reverses direction of the ball on the x axis
     */
    reverseX() {
        this._dirX *= -1;
    }
    /**
     * Reverses direction of the ball on the y axis
     */
    reverseY() {
        this._dirY *= -1;
    }
    /**
     * @param value Sets the new value of the x dir.
     */
    set dirX(value) {
        this._dirX = value;
    }
}
/**
 * The controller that handles the entire game.
 * Such as drawing the objects, movement, collision, event listeners.
 */
class controller {
    constructor(player, ball, bars, ctx) {
        this.gameOver = false;
        /**
         * This runs on every animation frame.
         */
        this.animationFrame = () => {
            if (this.checkBreakout() == 0) {
                this.gameOver = true;
            }
            if (!this.gameOver) {
                this.move();
                this.checkBallPos();
                this.checkCollision();
                this.checkBarCollision(this.player.bar);
                this.draw();
                requestAnimationFrame(this.animationFrame);
            }
            else if (this.checkBreakout() == 0) {
                this.writeMessage("Game Over! Du vann tryck på r för att starta om.");
            }
            else {
                this.writeMessage("Game Over! Du förlorade tryck på r för att starta om.");
            }
        };
        /**
         * The key up eventlistener that handles key input.
         * @param e The key event.
         */
        this.keyDownHandler = (e) => {
            switch (e.key) {
                case "a": {
                    this.player.left();
                    break;
                }
                case "d": {
                    this.player.right();
                    break;
                }
                case "ArrowLeft": {
                    this.player.left();
                    break;
                }
                case "ArrowRight": {
                    this.player.right();
                    break;
                }
                case "r": {
                    this.gameOver = true;
                    document.removeEventListener("keyup", this.keyUpHandler);
                    document.removeEventListener("keydown", this.keyDownHandler);
                    initialize();
                }
                case " ": {
                    if (this.ball.bound) {
                        if (this.player.moveBlock != null) {
                            if (this.player.moveBlock == false)
                                this.ball.dirX = 5;
                        }
                        else {
                            if (Math.floor(Math.random() * Math.floor(2)) == 1) {
                                this.ball.dirX = 5;
                            }
                        }
                        this.ball.bound = false;
                    }
                    break;
                }
            }
        };
        /**
         * The key down eventlistener that handles key input.
         * @param e The key event.
         */
        this.keyUpHandler = (e) => {
            switch (e.key) {
                case "a": {
                    this.player.stop();
                    break;
                }
                case "d": {
                    this.player.stop();
                    break;
                }
                case "ArrowLeft": {
                    this.player.stop();
                    break;
                }
                case "ArrowRight": {
                    this.player.stop();
                    break;
                }
            }
        };
        this.ctx = ctx;
        this.player = player;
        this.bars = bars;
        this.ball = ball;
        this.animationFrame();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    }
    /**
     * this will move the player if a move key is pressed and move the ball.
     */
    move() {
        if (this.ball.bound) {
            this.ball.x = this.player.bar.x + (this.player.bar.width / 2);
        }
        else {
            this.ball.move();
        }
        this.player.move();
    }
    /**
     * Writes a message in the middle of the game screen.
     * @param message The message.
     */
    writeMessage(message) {
        this.ctx.font = "50px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(message, 650, 360);
    }
    /**
     * Counts the number of blocks still visible.
     */
    checkBreakout() {
        let i = 0;
        for (let block of this.bars) {
            if (block.alive) {
                i++;
            }
        }
        return i;
    }
    /**
     * This checks the position of the ball and reverses direction if it hits a wall.
     */
    checkBallPos() {
        if (this.ball.x <= 0 || this.ball.x >= 1300) {
            this.ball.reverseX();
        }
        if (this.ball.y <= 0) {
            this.ball.reverseY();
        }
        else if (this.ball.y >= 720) {
            this.gameOver = true;
        }
    }
    /**
     * Checks collision between all the blocks that are alive and the ball.
     */
    checkCollision() {
        for (let bar of this.bars) {
            if (bar.alive && this.checkBarCollision(bar)) {
                bar.alive = false;
            }
        }
    }
    /**
     * This returns true if a collision occurred else false.
     * @param block
     */
    checkBarCollision(block) {
        if (this.ball.x >= block.x && this.ball.x <= block.x + block.width &&
            this.ball.y >= block.y && this.ball.y <= block.y + block.height) {
            //If statement triggers that means that collision occurred on the side of bar.
            if (this.ball.x <= block.x + 1 || this.ball.x >= block.x + block.width - 1) {
                this.ball.reverseX();
            }
            else {
                this.ball.reverseY();
            }
            return true;
        }
        return false;
    }
    /**
     * Draws the blocks the blocks that are alive, ball and player.
     */
    draw() {
        this.ctx.clearRect(0, 0, 1300, 720);
        for (let block of this.bars) {
            block.draw(this.ctx);
        }
        this.ball.draw(this.ctx);
        this.player.bar.draw(this.ctx);
    }
}
initialize();
/**
 * Initializes the everything.
 */
function initialize() {
    const canvas = document.getElementById("game_canvas");
    const ctx = canvas.getContext("2d");
    let bars = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 2; j++) {
            bars.push(new Block((i * 160 + 15), (j * 60 + 20)));
        }
    }
    let ball = new Ball(500, 675, -5, -2);
    new controller(new Player(ctx), ball, bars, ctx);
}
//# sourceMappingURL=game.js.map