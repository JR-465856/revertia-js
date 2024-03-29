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
                    Entity.registeredEntities.forEach(value => {
                        if (value.doTick) { value.onTick();}
                    });
                }
            )
            Runtime.register(Entity.tickListener);
        }
        // Register entity
        this.timeInit = game.runtime();
        this.animations = {};
        Entity.registeredEntities.push(this);
    }

    //                  STATIC FUNCTIONS
    // Find entity by hitbox sprite
    public static findEntityByHitboxSprite(hitboxSprite:Sprite): Entity {
        const result = Entity.registeredEntities.find(value => value.getHitbox().getSprite() == hitboxSprite);
        return result ? result : null;
    }

    //                  HITBOX FUNCTIONS
    // Creates the hitbox
    // Don't ask why this isn't already done in the constructor
    //   image:Image           - Display image for animations and decoration that will be attached to the hitbox
    //   hitboxSize:Coordinate - Dimensions of the hitbox
    //   hitboxSize:Coordinate - Offset of the display image from the hitbox
    public initializeHitbox(displayImage:Image, hitboxSize:Coordinate, hitboxOffset:Coordinate) {
        this.hitbox = new Entity.Hitbox(Entity.Hitbox.createDisplaySprite(displayImage), hitboxSize, hitboxOffset);
    }
    // Get hitbox
    public getHitbox(): Entity.Hitbox { return this.hitbox;}

    //                  GENERAL FUNCTIONS
    // Finds the index of the entity in the entity registry
    private getRegistryIndex(): number {
        let index;
        const result = Entity.registeredEntities.find((v:Entity, i:number) => {
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
        const index = this.getRegistryIndex();
        if (index != null) Entity.registeredEntities.splice(index, 1);
    }

    //                  PHYSICS FUNCTIONS
    // Position
    public setHitboxPosition(pos:Coordinate): void { this.hitbox.setPosition(pos);}
    public setHitboxPositionTopLeft(pos:Coordinate): void { this.hitbox.setPositionTopLeft(pos);}
    public getHitboxPosition(): Coordinate { return this.hitbox.getPosition();}
    public getHitboxPositionTopLeft(): Coordinate { return this.hitbox.getPositionTopLeft();}
    // Velocity and acceleration
    public setHitboxVelocity(vel:Coordinate): void { this.hitbox.setVelocity(vel);}
    public getHitboxVelocity(): Coordinate { return this.hitbox.getVelocity();}
    public setHitboxAcceleration(accel:Coordinate): void { this.hitbox.setAcceleration(accel);}
    public getHitboxAcceleration(): Coordinate { return this.hitbox.getAcceleration();}

    //                  ANIMATION FUNCTIONS
    // Registers an animation under the Entity with a specified label
    // If an animation already exists at the label, it is overriden
    public registerAnimation(label:string, animation:Entity.Animation): void {
        this.animations[label] = animation;
    }
    // Deregisters an animation
    // Returns true if successful, otherwise false
    public deregisterAnimation(label:string) {
        if (this.animations[label] == undefined) return false;
        this.animations[label] = undefined;
        return true;
    }
    // Gets an animation
    public getAnimation(label:string): Entity.Animation {
        return this.animations[label];
    }
    // Plays an animation
    // Returns true if successful, otherwise false
    public playAnimation(label:string): boolean {
        if (this.animations[label] == undefined) return false;
        this.animations[label].play();
        return true;
    }

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
            const hitboxImage = image.create(this.size.getX(), this.size.getY());
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
        // Position
        public setPosition(pos:Coordinate): void { this.boundary.setPosition(pos.getX(), pos.getY());}
        public setPositionTopLeft(pos:Coordinate): void {
            const newPos = pos.add(this.size.scale(0.5));
            this.boundary.setPosition(newPos.getX(), newPos.getY());
        }
        public getPosition(): Coordinate { return new Coordinate(this.boundary.x, this.boundary.y);}
        public getPositionTopLeft(): Coordinate {
            const boundaryPos = new Coordinate(this.boundary.x, this.boundary.y);
            return boundaryPos.add(this.size.scale(0.5));
        }
        // Velocity and acceleration
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
            return Entity.Hitbox.hitboxList.removeElement(this);
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
            const display = sprites.create(displayImage, Entity.Hitbox.displayKind);
            display.setFlag(SpriteFlag.Ghost, true);
            return display;
        }
        
        // Static repair (individual)
        // Removes hitbox at given index if it is invalid (improperly removed)
        // Returns true if the hitbox at the index was valid, otherwise false
        public static repair(index:number): boolean {
            const obj = Entity.Hitbox.hitboxList[index];
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
            Entity.Hitbox.hitboxList.forEach((obj:Entity.Hitbox, index:number) => {
                const valid = Entity.Hitbox.repair(index);
                if (valid) obj.update();
            });
        }
    }
}
