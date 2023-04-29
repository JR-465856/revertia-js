// Entity class
abstract class Entity {
    private hitbox: Entity.Hitbox;
    private animations: Entity.Animation.IAnimationDictionary;

    private static tickListener: Runtime.RuntimeListener;
    private doTick: boolean = false;
    private timeInit: number;

    private static registeredEntities: Array<Entity>;

    // Constructor
    // To create a working Entity:
    // 1. Call super() in constructor once
    // 2. Call initializeHitbox()
    // 3. Override the onTick function and do setDoTick(true)
    // To destroy a working Entity, do destroy()
    constructor() {
        // Initialize registered entities
        if (Entity.registeredEntities == undefined) { Entity.registeredEntities = [];}
        // Initialize tick listener
        if (Entity.tickListener == undefined) {
            Entity.tickListener = new Runtime.RuntimeListener(
                Runtime.TickType.Update,
                () => {
                    Entity.registeredEntities.forEach((value:Entity, index:number) => {
                        if (value.doTick) { value.onTick();}
                    });
                }
            )
            Runtime.register(Entity.tickListener);
        }
        // Register entity
        this.timeInit = game.runtime();
        Entity.registeredEntities.push(this);
    }

    //                  STATIC FUNCTIONS
    // Find entity by hitbox sprite
    public static findEntityByHitboxSprite(hitboxSprite:Sprite): Entity {
        let result = Entity.registeredEntities.find((value:Entity, index:number) => {
            return false;
        });
        return result ? result : null;
    }

    //                  HITBOX FUNCTIONS
    // Creates the hitbox
    // Don't ask why this isn't already done in the constructor
    //   image:Image           - Display image for animations and decoration that will be attached to the hitbox
    //   hitboxSize:Coordinate - Dimensions of the hitbox
    //   hitboxSize:Coordinate - Offset of the display image from the hitbox
    public initializeHitbox(displayImage:Image, hitboxSize:Coordinate, hitboxOffset:Coordinate) {
        let hitbox = new Entity.Hitbox(Entity.Hitbox.createDisplaySprite(displayImage), hitboxSize, hitboxOffset);
        this.hitbox = hitbox;
    }
    // Get hitbox
    public getHitbox(): Entity.Hitbox { return this.hitbox;}

    //                  GENERAL FUNCTIONS
    // Finds the index of the entity in the entity registry
    private getRegistryIndex(): number {
        let index;
        let result = Entity.registeredEntities.find((v:Entity, i:number) => {
            index = i;
            return v == this;
        });
        return result ? null : index;
    }

    
    // On destroy
    // Called first-things-first when destroy() is called
    // Meant to be overriden
    public onDestroy(): void { }
    // Deregisters and removes the entity
    // Also removes the hitbox and display sprite (if the hitbox was initialized)
    // Calls onDestroy() BEFORE doing everything
    public destroy(): void {
        this.onDestroy();
        if (this.hitbox) {
            this.hitbox.deregister();
            this.hitbox.remove();
            this.hitbox.getParent().destroy();
            this.hitbox = null;
        }
        this.doTick = false;
        let index = this.getRegistryIndex();
        if (index != null) Entity.registeredEntities.splice(index, 1);
    }

    //                  PHYSICS FUNCTIONS
    // Position, velocity, and acceleration
    public setHitboxPosition(pos:Coordinate): void { this.hitbox.setPosition(pos);}
    public getHitboxPosition(): Coordinate { return this.hitbox.getPosition();}
    public setHitboxVelocity(vel:Coordinate): void { this.hitbox.setVelocity(vel);}
    public getHitboxVelocity(): Coordinate { return this.hitbox.getVelocity();}
    public setHitboxAcceleration(accel:Coordinate): void { this.hitbox.setAcceleration(accel);}
    public getHitboxAcceleration(): Coordinate { return this.hitbox.getAcceleration();}

    //                  TICK FUNCTIONS
    // On tick
    // Runs every update if doTick is true
    // tickAge is incremented every time the entity ticks
    // Meant to be overriden
    public onTick(): void { }
    // Set do tick
    public setDoTick(doTick:boolean): void { this.doTick = doTick;}
    public getDoTick(): boolean { return this.doTick;}
    // Get age of Entity in ms
    public getAge(): number { return game.runtime()-this.timeInit;}
}

namespace Entity {
    // Animation
    export class Animation {
        private parent: Sprite;
        private images: Array<Image>;

        private flippedX: boolean = false;
        private flippedY: boolean = false;

        private interval = 500;
        private looping = false;

        constructor() { }

        public play() {
            animation.runImageAnimation(
                this.parent,
                this.images,
                this.interval,
                this.looping
            );
        }

        public getParent(): Sprite { return this.parent;}
        public setParent(parent: Sprite): void { this.parent = parent;}

        public getFrames(): Array<Image> { return this.images;}
        public setFrames(images: Array<Image>): void { this.images = images;}

        public getInterval(): number { return this.interval;}
        public setInterval(interval: number): void { this.interval = interval;}

        public getLooping(): boolean { return this.looping;}
        public setLooping(looping:boolean): void { this.looping = looping;}

        public getFlipX(): boolean { return this.flippedX;}
        public getFlipY(): boolean { return this.flippedY;}
        public setFlipX(flippedX:boolean): void { this.flippedX = flippedX;}
        public setFlipY(flippedY:boolean): void { this.flippedY = flippedY;}
    }
    export namespace Animation {
        export interface IAnimationDictionary {
            [key: string]: Entity.Animation;
        }
    }

    // Hitbox
    export class Hitbox {
        private static hitboxList: Array<Entity.Hitbox>;
        private static hitboxListener: Runtime.RuntimeListener;
        private static hitboxKind: number;
        private static displayKind: number;

        private boundary: Sprite;
        private parent: Sprite;

        private offset: Coordinate;
        private size: Coordinate;

        // Constructor
        // parent:Sprite     - Sprite to attach to the hitbox for decoration
        // size:Coordinate   - Size of the hitbox
        // offset:Coordinate - Offset of the parent from the hitbox
        constructor(parent:Sprite, size:Coordinate, offset:Coordinate) {
            // Initialize
            if (Entity.Hitbox.hitboxList == undefined) Entity.Hitbox.hitboxList = [];
            if (Entity.Hitbox.hitboxKind == undefined) Entity.Hitbox.hitboxKind = SpriteKind.create();
            if (Entity.Hitbox.displayKind == undefined) Entity.Hitbox.displayKind = SpriteKind.create();
            if (Entity.Hitbox.hitboxListener == undefined) {
                Entity.Hitbox.hitboxListener = new Runtime.RuntimeListener(
                    Runtime.TickType.Paint,
                    () => {
                        Entity.Hitbox.globalUpdate();
                    }
                );
                Runtime.register(Entity.Hitbox.hitboxListener);
            }

            // Main properties
            this.offset = offset;
            this.size = size;
            this.parent = parent;

            // Hitbox sprite
            let hitboxImage = image.create(this.size.getX(), this.size.getY());
            hitboxImage.fill(5);
            this.boundary = sprites.create(hitboxImage, Entity.Hitbox.hitboxKind);
            this.boundary.setFlag(SpriteFlag.Invisible, true);

            // Register
            Entity.Hitbox.hitboxList.push(this);
        }

        // Sprite functions
        public getSprite(): Sprite { return this.boundary;}
        public getParent(): Sprite { return this.parent;}
        public setParent(parent:Sprite): void { this.parent = parent;}
        // Size and offset
        public getSize(): Coordinate { return this.size;}
        public getOffset(): Coordinate { return this.offset;}
        public setOffset(offset:Coordinate): void { this.offset = offset;}
        // Physics
        public setPosition(pos:Coordinate): void { this.boundary.setPosition(pos.getX(), pos.getY());}
        public getPosition(): Coordinate { return new Coordinate(this.boundary.x, this.boundary.y);}
        public setVelocity(vel:Coordinate): void { this.boundary.setVelocity(vel.getX(), vel.getY());}
        public getVelocity(): Coordinate { return new Coordinate(this.boundary.vx, this.boundary.vy);}
        public setAcceleration(accel:Coordinate): void { this.boundary.ax = accel.getX(); this.boundary.ay = accel.getY();}
        public getAcceleration(): Coordinate { return new Coordinate(this.boundary.ax, this.boundary.ay);}
        
        // Deregister
        // Deregisters a Hitbox, no longer recognizing it in the static sense
        // Returns true if the Hitbox could be deregistered, otherwise false
        // WARNING: Must be called on removal or the class may become unstable!
        //          To completely delete a hitbox, one should call deregister() and THEN remove()
        public deregister(): boolean {
            let index = -1;
            let found = Entity.Hitbox.hitboxList.find((obj: Entity.Hitbox, index: number) => {
                if (obj == this) { index = index; return true; }
                return false;
            });

            if (index == -1) return false;
            Entity.Hitbox.hitboxList.splice(index, 1);
            return true;
        }
        
        // Remove
        // Destroys the boundary sprite while preserving the parent sprite
        // Returns true if boundary sprite existed (and was subsequently removed), otherwise false
        // WARNING: To completely delete a hitbox, one should call deregister() and THEN remove()
        public remove(): boolean {
            if (this.boundary) {
                this.boundary.destroy();
                this.boundary = null;
                return true;
            }
            return false;
        }

        // Update
        // Updates hitbox display sprite position
        public update(): void {
            this.parent.x = this.boundary.x + this.offset.getX();
            this.parent.y = this.boundary.y + this.offset.getY();
        }

        // Creates a "display" sprite
        // The sprite is only for visual effect and does not collide
        // Meant to be used as a parent for a Hitbox
        public static createDisplaySprite(displayImage:Image): Sprite {
            let display = sprites.create(displayImage, Entity.Hitbox.displayKind);
            display.setFlag(SpriteFlag.Ghost, true);
            return display;
        }
        
        // Static repair (individual)
        // Removes hitbox at given index if it is invalid (improperly removed)
        // Returns true if the hitbox at the index was valid, otherwise false
        public static repair(index:number): boolean {
            let obj = Entity.Hitbox.hitboxList[index];
            if ((obj == null) || (obj == undefined)) {
                Entity.Hitbox.hitboxList.splice(index, 1);
                return false;
            } else if ((obj.getSprite() == null) || (obj.getSprite() == undefined)) {
                Entity.Hitbox.hitboxList.splice(index, 1);
                return false;
            } else if ((obj.getParent() == null) || (obj.getParent() == undefined)) {
                Entity.Hitbox.hitboxList.splice(index, 1);
                return false;
            }
            return true;
        }

        // Global update
        // Updates all hitbox display sprite positions
        public static globalUpdate(): void {
            Entity.Hitbox.hitboxList.forEach((obj: Entity.Hitbox, index: number) => {
                let valid = Entity.Hitbox.repair(index);
                if (valid) obj.update();
            });
        }
    }
}





// Sample entity
class SampleEntity extends Entity {
    private static sw2: number = screen.width>>1;
    private static sh2: number = screen.height>>1;

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
        const t = this.getAge()/1000;
        this.setHitboxPosition(new Coordinate(
            SampleEntity.sw2*(Math.cos(t)+1),
            SampleEntity.sh2*(Math.sin(t)+1)
        ));
    }
}

// Visual effect entity
class VisualEffect extends Entity {
    private static vfxListener: Runtime.RuntimeListener;
    private static vfxRegistry: Array<VisualEffect>;
    private displayImage: Image;
    private pos: Coordinate;

    constructor(displayImage:Image) {
        super();

        if (VisualEffect.vfxRegistry == null) VisualEffect.vfxRegistry = [];
        if (VisualEffect.vfxListener == null) {
            VisualEffect.vfxListener = new Runtime.RuntimeListener(
                Runtime.TickType.Paint,
                () => {
                    VisualEffect.vfxRegistry.forEach((value:VisualEffect, index:number) => {
                        screen.drawTransparentImage(
                            value.displayImage,
                            value.pos.getX()-scene.cameraLeft(),
                            value.pos.getY()-scene.cameraTop()
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

    public setPosition(pos:Coordinate): void { this.pos = pos;}
    public getPosition(): Coordinate { return this.pos;}
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

        this.rand = new Math.FastRandom(Math.random()*0xFFFF);
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





control.runInParallel(() => {
    for (let i = 0; i < 6; i++) {
        let samp = new SampleEntity();
        pause(1000);
    }

    for (let i = 0; i < 15; i++) {
        let vfxtest = new Firefly();
        vfxtest.setPosition(new Coordinate(Math.randomRange(0, screen.width), screen.height - 1));
    }

    scene.setBackgroundImage(img`
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7776677777777767777777777777777777777777777667777777776777777777777777777777777777766777777777677777777777777777777777777776677777777767777777777777777777777777
    7666777777777667777777777777777777777767766677777777766777777777777777777777776776667777777776677777777777777777777777677666777777777667777777777777777777777767
    7767766777667766777766777777777777777766776776677766776677776677777777777777776677677667776677667777667777777777777777667767766777667766777766777777777777777766
    6666667767766766776766777777777777776676666666776776676677676677777777777777667666666677677667667767667777777777777766766666667767766766776766777777777777776676
    6666677766766666766667777777777777666677666667776676666676666777777777777766667766666777667666667666677777777777776666776666677766766666766667777777777777666677
    6666676666666676666677767777776667776667666667666666667666667776777777666777666766666766666666766666777677777766677766676666676666666676666677767777776667776667
    6666666666666776677666667766677766777666666666666666677667766666776667776677766666666666666667766776666677666777667776666666666666666776677666667766677766777666
    6666666666666766667766677677667766666666666666666666676666776667767766776666666666666666666667666677666776776677666666666666666666666766667766677677667766666666
    66b666666666666666666667667776676666666666b666666666666666666667667776676666666666b666666666666666666667667776676666666666b6666666666666666666676677766766666666
    66b6666666666666666666666b6776666666666666b6666666666666666666666b6776666666666666b6666666666666666666666b6776666666666666b6666666666666666666666b67766666666666
    66b6666666666666666666666bb676666666666666b6666666666666666666666bb676666666666666b6666666666666666666666bb676666666666666b6666666666666666666666bb6766666666666
    66b66666669bb666666669966bbb66666666666666b66666669bb666666669966bbb66666666666666b66666669bb666666669966bbb66666666666666b66666669bb666666669966bbb666666666666
    66b66666699dbb666666dd9666bb66666666666666b666666999bb666666999666bb66666666666666b666666999bb666666999666bb66666666666666b666666999bb666666999666bb666666666666
    6bb6669669966bbb69666d9966bb6666666666666bb6669669966bbb69666d9966bb6666666666666bb6669669966bbb69666d9966bb6666666666666bb6669669966bbb69666d9966bb666666666666
    6bb666d96696d9bbb9966d9966bbb666666666666bb666d96696d9bbb9966d9966bbb666666666666bb666d96696d9bbb9966d9966bbb666666666666bb666d96696d9bbb9966d9966bbb66666666666
    6bb66dd9999d996bb99ddd96666bb666666666666bb66dd9999d996bb99ddd96666bb666666666666bb66dd9999d996bb99ddd96666bb666666666666bb66dd9999d996bb99ddd96666bb66666666666
    bbb666d9999d996bb99dd99669dbbb6696666666bbb666d9999d996bb99dd99669dbbb6696666666bbb666d9999d996bb99dd99669dbbb6696666666bbb666d9999d996bb99dd99669dbbb6696666666
    bbbdd6d9999d999bbb9dd999996bbb6699966666bbbdd6d9999d999bbb9dd999996bbb6699966666bbbdd6d9999d999bbb9dd999996bbb6699966666bbbdd6d9999d999bbb9dd999996bbb6699966666
    bbb6ddd9999d9999bb9dd9999d6bbb9699666666bbb6ddd9999d9999bb9dd9999d6bbb9699666666bbb6ddd9999d9999bb9dd9999d6bbb9699666666bbb6ddd9999d9999bb9dd9999d6bbb9699666666
    bbb6ddd999d99999bbbdd9999d9bbb9999669966bbb6ddd999d99999bbbdd9999d9bbb9999669966bbb6ddd999d99999bbbdd9999d9bbb9999669966bbb6ddd999d99999bbbdd9999d9bbb9999669966
    bbbdddd999d999999bbdd9999d9bbbb9999d9996bbbdddd999d999999bbdd9999d9bbbb9999d9996bbbdddd999d999999bbdd9999d9bbbb9999d9996bbbdddd999d999999bbdd9999d9bbbb9999d9996
    bb9dddd99dd9999999bb9999dd9bbbb9999d9999bb9dddd99dd9999999bb9999dd9bbbb9999d9999bb9dddd99dd9999999bb9999dd9bbbb9999d9999bb9dddd99dd9999999bb9999dd9bbbb9999d9999
    bb99ddddd999999999bbb999d999bbb9999d9999bb99ddddd999999999bbb999d999bbb9999d9999bb99ddddd999999999bbb999d999bbb9999d9999bb99ddddd999999999bbb999d999bbb9999d9999
    bb99dddd9999999999dbbbbdd999bbb9999d999bbb99dddd9999999999dbbbbdd999bbb9999d999bbb99dddd9999999999dbbbbdd999bbb9999d999bbb99dddd9999999999dbbbbdd999bbb9999d999b
    bb99ddd99999999999ddbbbb9999bbbb999d999bbb99ddd99999999999ddbbbb9999bbbb999d999bbb99ddd99999999999ddbbbb9999bbbb999d999bbb99ddd99999999999ddbbbb9999bbbb999d999b
    bb99ddd99999999999ddbbbbbb99bbbb999d999bbb99ddd99999999999ddbbbbbb99bbbb999d999bbb99ddd99999999999ddbbbbbb99bbbb999d999bbb99ddd99999999999ddbbbbbb99bbbb999d999b
    b9999dd9999999999ddddbbbbbbbbbbbb999d99bb9999dd9999999999ddddbbbbbbbbbbbb999d99bb9999dd9999999999ddddbbbbbbbbbbbb999d99bb9999dd9999999999ddddbbbbbbbbbbbb999d99b
    b9999ddd999999999dd99999bbbbbbbbb999d99bb9999ddd999999999dd99999bbbbbbbbb999d99bb9999ddd999999999dd99999bbbbbbbbb999d99bb9999ddd999999999dd99999bbbbbbbbb999d99b
    b9999dddd99999999dd999999bbbbbbbb999d9bbb9999dddd99999999dd999999bbbbbbbb999d9bbb9999dddd99999999dd999999bbbbbbbb999d9bbb9999dddd99999999dd999999bbbbbbbb999d9bb
    b9999ddddd999999ddd9999999bbbbbbb999dbbbb9999ddddd999999ddd9999999bbbbbbb999dbbbb9999ddddd999999ddd9999999bbbbbbb999dbbbb9999ddddd999999ddd9999999bbbbbbb999dbbb
    dd99999ddddd9999ddd999999999bbbbb999bbbbdd99999ddddd9999ddd999999999bbbbb999bbbbdd99999ddddd9999ddd999999999bbbbb999bbbbdd99999ddddd9999ddd999999999bbbbb999bbbb
    9d99999ddddddd9ddd9999999999bbbbb99bbbb99d99999ddddddd9ddd9999999999bbbbb99bbbb99d99999ddddddd9ddd9999999999bbbbb99bbbb99d99999ddddddd9ddd9999999999bbbbb99bbbb9
    9d999999dddddddddd9999999999bbbbb99bbb999d999999dddddddddd9999999999bbbbb99bbb999d999999dddddddddd9999999999bbbbb99bbb999d999999dddddddddd9999999999bbbbb99bbb99
    9d999999ddddddddd99999999999bbbbb99bb9999d999999ddddddddd99999999999bbbbb99bb9999d999999ddddddddd99999999999bbbbb99bb9999d999999ddddddddd99999999999bbbbb99bb999
    9dd99999ddddddd9999999999999bbbbb99bbd999dd99999ddddddd9999999999999bbbbb99bbd999dd99999ddddddd9999999999999bbbbb99bbd999dd99999ddddddd9999999999999bbbbb99bbd99
    99dd9999dddddd99999999999999bbbbb99bbd9999dd9999dddddd99999999999999bbbbb99bbd9999dd9999dddddd99999999999999bbbbb99bbd9999dd9999dddddd99999999999999bbbbb99bbd99
    99ddd999dddddd99999999999999bbbbb9bbbdd999ddd999dddddd99999999999999bbbbb9bbbdd999ddd999dddddd99999999999999bbbbb9bbbdd999ddd999dddddd99999999999999bbbbb9bbbdd9
    9999dddddddddd9999999999999bbbbbb9bbb9d99999dddddddddd9999999999999bbbbbb9bbb9d99999dddddddddd9999999999999bbbbbb9bbb9d99999dddddddddd9999999999999bbbbbb9bbb9d9
    9999dddddddddd9999999999999bbbbbbbbb99d99999dddddddddd9999999999999bbbbbbbbb99d99999dddddddddd9999999999999bbbbbbbbb99d99999dddddddddd9999999999999bbbbbbbbb99d9
    999999dddddddd9999999999999bbbbbbbbb99dd999999dddddddd9999999999999bbbbbbbbb99dd999999dddddddd9999999999999bbbbbbbbb99dd999999dddddddd9999999999999bbbbbbbbb99dd
    d9999999dddddd999999999999bbbbbbbbb9999dd9999999dddddd999999999999bbbbbbbbb9999dd9999999dddddd999999999999bbbbbbbbb9999dd9999999dddddd999999999999bbbbbbbbb9999d
    dd9999999ddddd999999999999bbbbbbbbb99999dd9999999ddddd999999999999bbbbbbbbb99999dd9999999ddddd999999999999bbbbbbbbb99999dd9999999ddddd999999999999bbbbbbbbb99999
    dd9999999ddddd999999999999bbbbbbbb999999dd9999999ddddd999999999999bbbbbbbb999999dd9999999ddddd999999999999bbbbbbbb999999dd9999999ddddd999999999999bbbbbbbb999999
    9d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb999999
    9d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb999999
    9d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb999999
    9d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb9999999d9999999ddddd99999999999bbbbbbbbb999999
    9dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb9999999
    9dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb99999999dd999999ddddd99999999999bbbbbbbb9999999
    ddd999999ddddd99999999999bbbbbbbb9999999ddd999999ddddd99999999999bbbbbbbb9999999ddd999999ddddd99999999999bbbbbbbb9999999ddd999999ddddd99999999999bbbbbbbb9999999
    dd9999999ddddd99999999999bbbbbbbb9999999dd9999999ddddd99999999999bbbbbbbb9999999dd9999999ddddd99999999999bbbbbbbb9999999dd9999999ddddd99999999999bbbbbbbb9999999
    dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999
    dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999dd9999999dddddd9999999999bbbbbbbb9999999
    dd9999999dddddd9999999999bbbbbbb99999999dd9999999dddddd9999999999bbbbbbb99999999dd9999999dddddd9999999999bbbbbbb99999999dd9999999dddddd9999999999bbbbbbb99999999
    d99999999dddddd9999999999bbbbbbb9999999dd99999999dddddd9999999999bbbbbbb9999999dd99999999dddddd9999999999bbbbbbb9999999dd99999999dddddd9999999999bbbbbbb9999999d
    d99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999dd
    d99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999ddd99999999dddddd9999999999bbbbbbb999999dd
    999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd
    999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd
    999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd999999999ddddddd999999999bbbbbbb99999ddd
    999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd
    999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd999999999dddddddd99999999bbbbbbb9999dddd
    999999999dddddddd99999999bbbbbbb9999ddd9999999999dddddddd99999999bbbbbbb9999ddd9999999999dddddddd99999999bbbbbbb9999ddd9999999999dddddddd99999999bbbbbbb9999ddd9
    9999999999dddddddd999999bbbbbbbb9999ddd99999999999dddddddd999999bbbbbbbb9999ddd99999999999dddddddd999999bbbbbbbb9999ddd99999999999dddddddd999999bbbbbbbb9999ddd9
    d999999999dddddddd999999bbbbbbbbddddddddd999999999dddddddd999999bbbbbbbbddddddddd999999999dddddddd999999bbbbbbbbddddddddd999999999dddddddd999999bbbbbbbbdddddddd
    ddddd99999dddddddd999999bbbbbbbbbdddddddddddd99999dddddddd999999bbbbbbbbbdddddddddddd99999dddddddd999999bbbbbbbbbdddddddddddd99999dddddddd999999bbbbbbbbbddddddd
    dddddddd99ddddddddd999ddbbbbbbbbbddddddddddddddd99ddddddddd999ddbbbbbbbbbddddddddddddddd99ddddddddd999ddbbbbbbbbbddddddddddddddd99ddddddddd999ddbbbbbbbbbddddddd
    ddddddddddddddddddd9ddddbbbbbbbbbdddddddddddddddddddddddddd9ddddbbbbbbbbbdddddddddddddddddddddddddd9ddddbbbbbbbbbdddddddddddddddddddddddddd9ddddbbbbbbbbbddddddd
    ddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbdddddd
    ddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbddddddddddddddddddddddddddddddbbbbbbbbbbdddddd
    dddddddddddddddddddddddbbbbbbbbbbbdddddddddddddddddddddddddddddbbbbbbbbbbbdddddddddddddddddddddddddddddbbbbbbbbbbbdddddddddddddddddddddddddddddbbbbbbbbbbbdddddd
    dddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddd
    dddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddd
    dddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddd
    dddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddddddddddddddddddddddddddbbbbbbbbbbbbddddd
    ddddddddddddddddddd7777777777bbbbbbdddddddddddddddddddddddd7777777777bbbbbbdddddddddddddddddddddddd7777777777bbbbbbdddddddddddddddddddddddd7777777777bbbbbbddddd
    dddddddddddddd77777777777777777777bddddddddddddddddddd77777777777777777777bddddddddddddddddddd77777777777777777777bddddddddddddddddddd77777777777777777777bddddd
    ddddddddddd7777777777777777777777777ddddddddddddddd7777777777777777777777777ddddddddddddddd7777777777777777777777777ddddddddddddddd7777777777777777777777777dddd
    dddddddd777777777777777777777777777777dddddddddd777777777777777777777777777777dddddddddd777777777777777777777777777777dddddddddd777777777777777777777777777777dd
    ddddd77777777777777777777777777777777777ddddd77777777777777777777777777777777777ddddd77777777777777777777777777777777777ddddd77777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    7777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777
    `)
})
