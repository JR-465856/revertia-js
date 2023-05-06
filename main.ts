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

    public setPosition(pos: Coordinate): void { this.pos = pos; }
    public getPosition(): Coordinate { return this.pos; }
}

// Firefly Entity
class Firefly extends VisualEffect {
    private static sw: number = screen.width;
    private static sh: number = screen.height;
    private static sd: Coordinate = new Coordinate(Firefly.sw, Firefly.sh);
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
        let newPos = this.getPosition().add(new Coordinate(
            this.rand.randomRange(-1, 1),
            this.rand.randomRange(-1, 1)
        )).clamp(Coordinate.zero(), Firefly.sd);
        this.setPosition(newPos);
    }
}





// Create sample entities
control.runInParallel(() => {
    for (let i = 0; i < 6; i++) {
        let samp = new SampleEntity();
        pause(1000);
    }

    for (let i = 0; i < 15; i++) {
        let vfxtest = new Firefly();
        vfxtest.setPosition(new Coordinate(Math.randomRange(0, screen.width), screen.height - 1));
    }
})

// Set tilemap
let mapBeginning = new Map.Level(tilemap`mapBeginning`);
Map.setLevel(mapBeginning);
Player.getEntity().setHitboxPosition(new Coordinate(50, 50));
