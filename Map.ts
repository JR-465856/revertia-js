abstract class Map {
    private static currentLevel: Map.Level;

    private static entityEffects: Array<Entity>;

    // Load a Level
    // Sets static currentLevel to the Level
    // Loads the level by its load order
    // Default load order:
    //  1. Set TileMap to Level TileMapData
    //  2. Handle TileBehaviors
    //  3. Call Level onLoad
    public static loadLevel(newLevel: Map.Level) {
        this.currentLevel = newLevel;

        // Load map
        newLevel.getLoadOrder().forEach(loadSequence => {
            switch (loadSequence) {
                case Map.LoadSequence.SetTileMap: // Set TileMapData
                    tiles.setCurrentTilemap(newLevel.getTileMap());

                    break;

                case Map.LoadSequence.HandleTileBehaviors: // Handle TileBehaviors;
                    const tileMap = newLevel.getTileMap();
                    let tx;
                    let ty;
                    for (tx = 1; tx <= tileMap.width; tx++) {
                        for (ty = 1; ty <= tileMap.height; ty++) {
                            const tileImage = tiles.tileImageAtLocation(tiles.getTileLocation(tx, ty));
                            const behavior = Map.TileBehavior.getBehaviorFromImage(tileImage);
                            if (behavior != null) behavior.runAtLocation(new Coordinate(tx, ty));
                        }
                    }

                    break;

                case Map.LoadSequence.OnLoad: // Call OnLoad
                    const onLoad = newLevel.getOnLoad();
                    if (onLoad != null) onLoad();

                    break;

            }
        });
    }

    public static getLevel() { return Map.currentLevel;}

    public static setTileImageAtMapPos(location:Coordinate, tileImage:Image): void {
        tiles.setTileAt(Map.mapPosToLocation(location), tileImage);
    }
    public static setTransparencyAtMapPos(location:Coordinate): void {
        tiles.setTileAt(Map.mapPosToLocation(location), assets.tile`transparency16`);
    }
    public static getTileImageAtMapPos(location:Coordinate): Image {
        return tiles.getTileImage(Map.mapPosToLocation(location));
    }

    public static getDefaultLoadOrder(): Array<Map.LoadSequence> {
        return [
            Map.LoadSequence.SetTileMap,
            Map.LoadSequence.HandleTileBehaviors,
            Map.LoadSequence.OnLoad
        ];
    }

    public static standardPosToMapPos(pos:Coordinate): Coordinate {
        return new Coordinate(
            pos.getX() == 0 ? 1 : Math.ceil(pos.getX()/16),
            pos.getY() == 0 ? 1 : Math.ceil(pos.getY()/16)
        )
    }
    public static mapPosToStandardPos(location:Coordinate): Coordinate {
        return location.scale(16);
    }
    public static mapPosToStandardPosCenter(location:Coordinate): Coordinate {
        return location.scale(16).add(new Coordinate(8, 8));
    }
    public static mapPosToLocation(location:Coordinate): tiles.Location {
        return tiles.getTileLocation(location.getX(), location.getY());
    }
    public static locationToMapPos(location:tiles.Location): Coordinate {
        return new Coordinate(location.column, location.row);
    }
}

namespace Map {
    // Level load sequence
    // Recommended to include all sequences in an order to properly load a Level
    // A sequence can be omitted if wanted
    export enum LoadSequence {
        SetTileMap,
        HandleTileBehaviors,
        OnLoad
    }

    // Levels
    // Contains TileMapData and a background
    // Loaded using Map.loadLevel()
    // When loaded, TileBehaviors are automatically handled
    export class Level {
        private loadOrder: Array<Map.LoadSequence>;
        private onLoad: () => void;

        private tilemap: tiles.TileMapData;
        private background: Image;

        constructor(
            tilemap:tiles.TileMapData,
            background:Image,
            loadOrder:Array<Map.LoadSequence>,
            onLoad:()=>void=null
            )  {
            this.tilemap = tilemap;
            this.background = background;
            this.loadOrder = loadOrder;
            this.onLoad = onLoad;
        }

        public setTileMap(tilemap:tiles.TileMapData): void { this.tilemap = tilemap;}
        public getTileMap(): tiles.TileMapData { return this.tilemap;}

        public setBackground(background:Image): void { this.background = background;}
        public getBackground(): Image { return this.background;}

        public setOnLoad(onLoad:()=>void): void { this.onLoad = onLoad;}
        public getOnLoad(): () => void { return this.onLoad;}

        public setLoadOrder(loadOrder: Array<Map.LoadSequence>): void { this.loadOrder = loadOrder;}
        public getLoadOrder(): Array<Map.LoadSequence> { return this.loadOrder;}
    }
    
    export type TileBehaviorCallback = (location:Coordinate) => void;

    export class TileBehavior {
        private static behaviorRegistry: Array<TileBehavior>;
        private tileImage: Image;
        private callback: TileBehaviorCallback;

        public static getBehaviorFromImage(tileImage: Image) {
            if (Map.TileBehavior.behaviorRegistry == null) Map.TileBehavior.behaviorRegistry = [];
            
            return Map.TileBehavior.behaviorRegistry.find(value => value.tileImage == tileImage);
        }

        constructor(tileImage:Image, callback:Map.TileBehaviorCallback) {
            if(Map.TileBehavior.behaviorRegistry == null) Map.TileBehavior.behaviorRegistry = [];

            this.tileImage = tileImage;
            this.callback = callback;
        }

        // Note: runAtLocation uses map coordinates, not standard
        public runAtLocation(location:Coordinate): void { this.callback(location);}

        public setTileImage(tileImage:Image): void { this.tileImage = tileImage;}
        public getTileImage(): Image { return this.tileImage;}

        public setCallback(callback:Map.TileBehaviorCallback): void { this.callback = callback;}
        public getCallback(): Map.TileBehaviorCallback { return this.callback;}

        public register(): void {
            TileBehavior.behaviorRegistry.push(this);
        }

        public deregister(): boolean {
            return TileBehavior.behaviorRegistry.removeElement(this);
        }
    }
}
