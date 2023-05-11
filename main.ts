// Sample entity
class SampleEntity extends Entity {
    private static sw2: number = screen.width >> 1;
    private static sh2: number = screen.height >> 1;

    constructor() {
        super();
        this.initializeHitbox(
            img`
                9 3 3 3 3 3 3 3 3 3 3 3 3 3 3 2
                3 9 3 3 3 3 3 3 3 3 3 3 3 3 2 3
                3 3 9 3 3 3 3 3 3 3 3 3 3 2 3 3
                3 3 3 9 3 3 3 3 3 3 3 3 2 3 3 3
                3 3 3 3 9 3 3 3 3 3 3 2 3 3 3 3
                3 3 3 3 3 9 d 3 3 d 2 3 3 3 3 3
                3 3 3 3 3 b 9 8 8 2 b 3 3 3 3 3
                3 3 3 3 3 3 8 6 6 8 3 3 3 3 3 3
                3 3 3 3 3 3 8 6 6 8 3 3 3 3 3 3
                3 3 3 3 3 b 2 c c 9 b 3 3 3 3 3
                3 3 3 3 3 2 c 3 3 c 9 3 3 3 3 3
                3 3 3 3 2 3 3 3 3 3 3 9 3 3 3 3
                3 3 3 2 3 3 3 3 3 3 3 3 9 3 3 3
                3 3 2 3 3 3 3 3 3 3 3 3 3 9 3 3
                3 2 3 3 3 3 3 3 3 3 3 3 3 3 9 3
                2 3 3 3 3 3 3 3 3 3 3 3 3 3 3 9
            `,
            new Coordinate(16, 16),
            Coordinate.zero()
        );
        this.setDoTick(true);
    }

    public onTick() {
        const t = this.getAge() / 1000;
        this.setHitboxPosition(new Coordinate(
            SampleEntity.sw2 * (Math.cos(t) + 1),
            SampleEntity.sh2 * (Math.sin(t) + 1)
        ));
    }
}

// Visual effect entity
class VisualEffect extends Entity {
    private static vfxListener: Runtime.RuntimeListener;
    private static vfxRegistry: Array<VisualEffect>;
    private displayImage: Image;
    private pos: Coordinate;

    constructor(displayImage: Image) {
        super();

        if (VisualEffect.vfxRegistry == null) VisualEffect.vfxRegistry = [];
        if (VisualEffect.vfxListener == null) {
            VisualEffect.vfxListener = new Runtime.RuntimeListener(
                Runtime.TickType.Paint,
                () => {
                    VisualEffect.vfxRegistry.forEach((value: VisualEffect, index: number) => {
                        screen.drawTransparentImage(
                            value.displayImage,
                            value.pos.getX() - scene.cameraLeft(),
                            value.pos.getY() - scene.cameraTop()
                        );
                    });
                }
            );
            Runtime.register(VisualEffect.vfxListener);
        }

        this.displayImage = displayImage;
        this.pos = Coordinate.zero();
        VisualEffect.vfxRegistry.push(this);
    }

    public onDestroy(): void {
        VisualEffect.vfxRegistry.removeElement(this);
    }

    public setPosition(pos:Coordinate): void { this.pos = pos; }
    public getPosition(): Coordinate { return this.pos; }
}

// Firefly Entity
class Firefly extends VisualEffect {
    private rand: Math.FastRandom;

    constructor() {
        super(img`
            8 . 8
            . 5 .
        `);

        this.rand = new Math.FastRandom(Math.random() * 0xFFFF);
        this.setDoTick(true);
    }

    public onTick() {
        const newPos = this.getPosition().add(new Coordinate(
            this.rand.randomRange(-1, 1),
            this.rand.randomRange(-1, 1)
        ));
        this.setPosition(newPos);
    }
}

// Firefly emitter
class FireflyEmitter extends Entity {
    private activeFireflies: Array<Firefly>;

    private pos: Coordinate;
    private radius: number;
    private maxFireflies: number;
    private spawnRate: number;

    private spawnDeadline: number;

    // Constructor
    // Spawn rate is in fireflies per second
    constructor(pos:Coordinate, radius:number, maxFireflies:number, spawnRate:number) {
        super();

        this.pos = pos;
        this.radius = radius;
        this.maxFireflies = maxFireflies;
        this.spawnRate = 1000/spawnRate;

        this.activeFireflies = [];
        this.spawnDeadline = 0;

        this.setDoTick(true);
    }
    
    public onTick() {
        if ((this.spawnDeadline-game.runtime()) > 0) return;
        this.spawnDeadline = game.runtime()+this.spawnRate;

        const firefly = new Firefly();

        const a = Math.random()*6.283;
        const r = this.radius*Math.sqrt(Math.random())
        const newPos = this.pos.add(new Coordinate(
            r*Math.cos(a),
            r*Math.sin(a)
        ));

        firefly.setPosition(newPos);
        this.activeFireflies.push(firefly);

        if (this.activeFireflies.length > this.maxFireflies) this.activeFireflies.shift().destroy();
    }

    public setPosition(pos:Coordinate): void { this.pos = pos;}
    public getPosition(): Coordinate { return this.pos;}

    public setRadius(radius: number): void { this.radius = radius;}
    public getRadius(): number { return this.radius;}

    public setMaxFireflies(maxFireflies: number): void { this.maxFireflies = maxFireflies;}
    public getMaxFireflies(): number { return this.maxFireflies;}
}





// Behaviors
{
    const playerStart = new Map.TileBehavior(assets.tile`playerStart`, location => {
        const spawnLocation = Map.mapPosToStandardPosCenter(location);
        Player.getEntity().setHitboxPosition(spawnLocation);
        Player.getCamera().setPosition(spawnLocation);
        Map.setTransparencyAtMapPos(location);
    });
    playerStart.register();

    const emitterFirefly = new Map.TileBehavior(assets.tile`emitterFirefly`, location => {
        const spawnLocation = Map.mapPosToStandardPosCenter(location);
        const fireflyEmitter = new FireflyEmitter(spawnLocation, 32, 16, 2);
        Map.setTransparencyAtMapPos(location);
    });
    emitterFirefly.register();
}

// Levels
const levelBeginning = new Map.Level(
    tilemap`mapBeginning`,
    img`1`,
    Map.getDefaultLoadOrder()
);
const levelEntityDemo = new Map.Level(
    tilemap`mapEntityDemo`,
    img`1`,
    Map.getDefaultLoadOrder()
);

Map.loadLevel(levelEntityDemo);
