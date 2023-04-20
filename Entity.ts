// Entity class
abstract class Entity {
    private hitbox: Entity.Hitbox;
    private animations: Entity.Animation.IAnimationDictionary;

    private doTick: boolean = false;
    private tickAge: number = 0;

    private static registeredEntities: Array<Entity>;

    constructor() {
        if (Entity.registeredEntities == undefined) { Entity.registeredEntities = [];}
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
    // Deregisters and removes the entity
    // Also removes the hitbox and display sprite (if the hitbox was initialized)
    public destroy(): void {
        
    }
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
        private static hitboxKind: number = SpriteKind.create();
        private static displayKind: number = SpriteKind.create();

        private boundary: Sprite;
        private parent: Sprite;

        private offset: Coordinate;
        private size: Coordinate;

        // Constructor
        // parent:Sprite     - Sprite to attach to the hitbox for decoration
        // size:Coordinate   - Size of the hitbox
        // offset:Coordinate - Offset of the parent from the hitbox
        constructor(parent:Sprite, size:Coordinate, offset:Coordinate) {
            // Load hitbox hitboxList
            if (Entity.Hitbox.hitboxList == undefined) Entity.Hitbox.hitboxList = [];

            // Main properties
            this.offset = offset;
            this.size = size;
            this.parent = parent;

            // Hitbox sprite
            let hitboxImage = image.create(this.size.getX(), this.size.getY());
            hitboxImage.fill(5);
            this.boundary = sprites.create(hitboxImage, Entity.Hitbox.hitboxKind);

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
        public setOffset(offset: Coordinate) { this.offset = offset;}
        
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
