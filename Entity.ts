// Entity class
abstract class Entity {
    protected hitbox: Entity.Hitbox;
}

namespace Entity {
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
        // parent:Sprite     - The sprite to attach to the hitbox for decoration
        // size:Coordinate   - The size of the hitbox
        // offset:Coordinate -
        constructor(parent:Sprite, size:Coordinate=new Coordinate(1,1), offset:Coordinate=new Coordinate(0,0)) {
            // Load hitbox hitboxList
            if (Entity.Hitbox.hitboxList == undefined) Entity.Hitbox.hitboxList = [];

            // Main properties
            this.offset = offset
            this.size = size
            this.parent = parent;

            // Hitbox sprite
            let hitboxImage = image.create(this.size.x, this.size.y);
            hitboxImage.fill(5);
            this.boundary = sprites.create(hitboxImage, Entity.Hitbox.hitboxKind)

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
        public setOffset(offset:Coordinate) { this.offset = offset;}

        // Deregister
        // Removes a Hitbox, no longer recognizing it in the static sense
        // WARNING: Must be called on removal or the class may become unstable!
        public deregister(): void {
            let index = -1;
            let found = Entity.Hitbox.hitboxList.find(function(obj:Entity.Hitbox, index:number): boolean {
                if (obj == this) { index = index; return true;}
                return false;
            });

            if (index == -1) {
                // Theoretically this error should be impossible unless something
                // is seriously wrong with the environment
                throw "Cannot deregister a Hitbox that is not recognized in the static sense.";
            } else {
                Entity.Hitbox.hitboxList.splice(index, 1);
            }
        }
        
        // Update
        // Updates hitbox display sprite position
        public update(): void {
            this.parent.x = this.boundary.x + this.offset.x
            this.parent.y = this.boundary.y + this.offset.y
        }

        // Static repair (individual)
        // Removes hitbox at given index if it is invalid (improperly removed)
        // Returns true if the hitbox at the index was valid, otherwise false
        public static repair(index: number): boolean {
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
            Entity.Hitbox.hitboxList.forEach(function(obj:Entity.Hitbox, index:number): void {
                let valid = Entity.Hitbox.repair(index);
                if (valid) obj.update();
            });
        }
    }
}
