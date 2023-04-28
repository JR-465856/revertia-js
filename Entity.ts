// Entity class
abstract class Entity {
    private hitbox: Entity.Hitbox;
    private animations: Entity.Animation.IAnimationDictionary;

    private static tickListener: Runtime.RuntimeListener;
    private doTick: boolean = false;
    private tickAge: number = 0;

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
                        if (value.doTick) { value.tickAge += 1; value.onTick();}
                    });
                }
            )
            Runtime.register(Entity.tickListener);
        }
        // Register entity
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

    // Deregisters and removes the entity
    // Also removes the hitbox and display sprite (if the hitbox was initialized)
    public destroy(): void {
        if (this.hitbox) {
            this.hitbox.deregister();
            this.hitbox.remove();
            this.hitbox.getParent().destroy();
            this.hitbox = null;
        }
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
    // Other tick functions
    public setDoTick(doTick:boolean): void { this.doTick = doTick;}
    public getDoTick(): boolean { return this.doTick;}
    public getTickAge(): number { return this.tickAge;}
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
const sw = screen.width;
const sw2 = screen.width>>1;
const sh = screen.height;
const sh2 = screen.height>>1;
class SampleEntity extends Entity {
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
        this.setHitboxPosition(new Coordinate(
            Math.cos(this.getTickAge()/50)*sw2+sw2,
            Math.sin(this.getTickAge()/50)*sh2+sh2
        ));
    }
}

let samp = new SampleEntity();
