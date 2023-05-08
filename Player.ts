abstract class Player {
    private static initialized: boolean = false;

    private static movementSpeed: Coordinate; // x is horizontal, y is jump

    private static playerEntity: Entity;
    private static camera: Camera;

    public static initialize() {
        if (Player.initialized) return;

        this.movementSpeed = new Coordinate(50, -100)

        this.playerEntity = new PlayerEntity();
        this.camera = new Camera();
        this.camera.focus();

        Player.initialized = true;
    }

    public static setMovementSpeed(newSpeed: Coordinate): void { Player.movementSpeed = newSpeed;}
    public static getMovementSpeed(): Coordinate { return Player.movementSpeed;}

    public static getCamera(): Camera { return Player.camera;}
    public static getEntity(): Entity { return this.playerEntity;}
}

class PlayerEntity extends Entity {
    private isWalking: boolean;
    private isIdling: boolean;

    constructor() {
        super();

        // Hitbox
        this.initializeHitbox(
            img`
                8 8 8 8 8 8 8 8 8 8
                8 8 8 8 8 8 8 8 8 8
                . . 5 8 8 8 8 5 . .
                . . 8 8 8 8 8 8 . .
                . . 8 8 8 8 8 8 . .
                6 6 6 6 8 8 6 6 6 6
                6 6 6 6 6 6 6 6 6 6
                8 8 6 6 6 6 6 6 8 8
                8 8 6 6 6 6 6 6 8 8
                . . 6 6 6 6 6 6 . .
                . . 8 8 . . 8 8 . .
                . . 8 8 . . 8 8 . .
                . . 8 8 . . 8 8 . .
            `,
            new Coordinate(10, 13),
            new Coordinate(0, 0)
        );
        this.setHitboxAcceleration(new Coordinate(0, 200));
        this.setHitboxPosition(Coordinate.zero());

        // Idle
        this.isIdling = false;
        const idleAnim = new Entity.Animation();
        idleAnim.setParent(this.getHitbox().getParent());
        idleAnim.setFrames(assets.animation`playerIdle`);
        idleAnim.setInterval(500);
        idleAnim.setLooping(true);
        this.registerAnimation("idle", idleAnim);
        // Walk
        this.isWalking = false;
        const walkAnim = new Entity.Animation();
        walkAnim.setParent(this.getHitbox().getParent());
        walkAnim.setFrames(assets.animation`playerWalk`);
        walkAnim.setInterval(200);
        walkAnim.setLooping(true);
        this.registerAnimation("walk", walkAnim);
        // Jump
        const jumpAnim = new Entity.Animation();
        jumpAnim.setParent(this.getHitbox().getParent());
        jumpAnim.setFrames(assets.animation`playerJump`);
        jumpAnim.setInterval(100);
        jumpAnim.setLooping(false);
        this.registerAnimation("jump", jumpAnim);
        // Land
        const landAnim = new Entity.Animation();
        landAnim.setParent(this.getHitbox().getParent());
        landAnim.setFrames(assets.animation`playerLand`);
        landAnim.setInterval(150);
        landAnim.setLooping(true);
        this.registerAnimation("land", landAnim);
        
        this.setDoTick(true);
    }

    public isMovingX(): boolean {
        return (Math.abs(this.getHitboxVelocity().getX()) > 0);
    }
    public isMovingY(): boolean {
        return (Math.abs(this.getHitboxVelocity().getY()) > 0);
    }
    
    public onTick(): void {
        // Left and right movement
        if (Controls.getPressed(Controls.Button.Left) && Controls.getPressed(Controls.Button.Right)) {
            this.setHitboxVelocity(this.getHitboxVelocity().setX(0));
        } else if (Controls.getPressed(Controls.Button.Left)) {
            const vx = Player.getMovementSpeed().getX()*-1;
            this.setHitboxVelocity(this.getHitboxVelocity().setX(vx));
        } else if (Controls.getPressed(Controls.Button.Right)) {
            const vx = Player.getMovementSpeed().getX();
            this.setHitboxVelocity(this.getHitboxVelocity().setX(vx));
        } else {
            this.setHitboxVelocity(this.getHitboxVelocity().setX(0));
        }

        // Jumping
        if (Controls.getPressed(Controls.Button.Up) && this.getHitbox().getSprite().isHittingTile(CollisionDirection.Bottom)) {
            const vy = Player.getMovementSpeed().getY();
            this.setHitboxVelocity(this.getHitboxVelocity().setY(vy));
            this.playAnimation("jump");
            this.isIdling = false;
            this.isWalking = false;
        }

        // Animations
        if (this.isMovingX() && !this.isMovingY() && !this.isWalking) {
            this.playAnimation("walk");
            this.isIdling = false;
            this.isWalking = true;
        } else if (!this.isMovingX() && !this.isMovingY() && !this.isIdling) {
            this.playAnimation("idle");
            this.isIdling = true;
            this.isWalking = false;
        }

        // Camera
        const playerCam = Player.getCamera();
        const camOffset = this.getHitboxPosition().sub(playerCam.getPosition()).scale(0.3);
        playerCam.setPosition(playerCam.getPosition().add(camOffset));
    }
}

Player.initialize();
