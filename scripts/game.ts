/**
 * Block class for drawing bars of different sizes.
 * Used by player and on its own.
 */
class Block {

    private _height: number = 45;
    private _width: number = 150;
    x: number;
    y: number;
    alive: boolean = true;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Draws the block object
     * @param ctx The canvas rendering context.
     */
    public draw(ctx: CanvasRenderingContext2D) {
        if (this.alive) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    /**
     * Returns the width.
     */
    get width(): number {
        return this._width;
    }

    /**
     * Returns the height.
     */
    get height(): number {
        return this._height;
    }

    /**
     * @param value Sets the height.
     */
    set height(value: number) {
        this._height = value;
    }

}

/**
 * The player class that handles player movement.
 */
class Player {
    bar: Block;
    public moveBlock: boolean = null;

    constructor(ctx: CanvasRenderingContext2D) {
        this.bar = new Block(575, 690);
        this.bar.height = 25;
        this.bar.draw(ctx);
    }

    /**
     * Sets the player movement to go left.
     */
    public left(): void {
        this.moveBlock = true;
    }

    /**
     * Sets the player movement to go right.
     */
    public right(): void {
        this.moveBlock = false;
    }

    /**
     * Stops the players movement
     */
    public stop(): void {
        this.moveBlock = null;
    }

    /**
     * Moves the players block. Also checks that the player
     * does not go outside the border.
     */
    public move(): void {
        if (this.moveBlock == true) {
            if (this.bar.x >= 5) {
                this.bar.x -= 5;
            }

        } else if (this.moveBlock == false) {
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
    public bound: boolean = true;
    private _dirX;
    private _dirY;
    x;
    y;

    constructor(x: number, y: number, dirX: number, dirY: number) {
        this.x = x;
        this.y = y;
        this._dirX = dirX;
        this._dirY = dirY;
    }

    /**
     * Draws the ball.
     * @param ctx The canvas rendering context.
     */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    }

    public move(): void {
        this.x += this._dirX;
        this.y += this._dirY;
    }

    /**
     * Reverses direction of the ball on the x axis
     */
    public reverseX(): void {
        this._dirX *= -1;
    }

    /**
     * Reverses direction of the ball on the y axis
     */
    public reverseY(): void {
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
    private readonly ctx: CanvasRenderingContext2D;
    private readonly bars: Block[];
    private gameOver: boolean = false;
    private player: Player;
    private ball: Ball;

    constructor(player: Player, ball: Ball, bars: Block[], ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.player = player;
        this.bars = bars;
        this.ball = ball;
        this.animationFrame();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    }

    /**
     * This runs on every animation frame.
     */
    animationFrame = () => {
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
        } else if (this.checkBreakout() == 0) {
            this.writeMessage("Game Over! Du vann tryck på r för att start om.");
        } else {
            this.writeMessage("Game Over! Du förlorade tryck på r för att start om.");
        }
    }

    /**
     * this will move the player if a move key is pressed and move the ball.
     */
    private move(): void {
        if (this.ball.bound) {
            this.ball.x = this.player.bar.x + (this.player.bar.width / 2);
        } else {
            this.ball.move();
        }
        this.player.move();
    }

    /**
     * Writes a message in the middle of the game screen.
     * @param message The message.
     */
    private writeMessage(message: string): void {
        this.ctx.font = "50px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(message, 650, 360);
    }

    /**
     * Counts the number of blocks still visible.
     */
    private checkBreakout(): number {
        let i: number = 0;
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
    private checkBallPos(): void {
        if (this.ball.x <= 0 || this.ball.x >= 1300) {
            this.ball.reverseX();
        }
        if (this.ball.y <= 0) {
            this.ball.reverseY();
        } else if (this.ball.y >= 720) {
            this.gameOver = true;
        }
    }
    /**
     * Checks collision between all the blocks that are alive and the ball.
     */
    private checkCollision(): void {
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
    private checkBarCollision(block: Block): boolean {
        if (this.ball.x >= block.x && this.ball.x <= block.x + block.width &&
            this.ball.y >= block.y && this.ball.y <= block.y + block.height) {
            //If statement triggers that means that collision occurred on the side of bar.
            if (this.ball.x <= block.x + 1 || this.ball.x >= block.x + block.width - 1) {
                this.ball.reverseX();
            } else {
                this.ball.reverseY();
            }
            return true;
        }
        return false;
    }

    /**
     * Draws the blocks the blocks that are alive, ball and player.
     */
    private draw(): void {
        this.ctx.clearRect(0, 0, 1300, 720);
        for (let block of this.bars) {
            block.draw(this.ctx);
        }
        this.ball.draw(this.ctx);
        this.player.bar.draw(this.ctx);
    }

    /**
     * The key up eventlistener that handles key input.
     * @param e The key event.
     */
    keyDownHandler = (e: KeyboardEvent) => {
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
                        if (this.player.moveBlock == false) this.ball.dirX = 5;
                    } else {
                        if (Math.floor(Math.random() * Math.floor(2)) == 1) {
                            this.ball.dirX = 5;
                        }
                    }
                    this.ball.bound = false;
                }
                break;
            }
        }
    }

    /**
     * The key down eventlistener that handles key input.
     * @param e The key event.
     */
    keyUpHandler = (e: KeyboardEvent) => {
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
    }
}

initialize();
/**
 * Initializes the everything.
 */
function initialize(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("game_canvas");
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    let bars: Block[] = [];

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 2; j++) {
            bars.push(new Block((i * 160 + 15), (j * 60 + 20)));
        }
    }
    let ball = new Ball(500, 675, -5, -2);
    new controller(new Player(ctx), ball, bars, ctx);
}
