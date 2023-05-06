abstract class Map {
    private static currentLevel: Map.Level;

    private static entityEffects: Array<Entity>;

    public static setLevel(newLevel: Map.Level) {
        this.currentLevel = newLevel;
        tiles.setCurrentTilemap(newLevel.getTileMap());
    }
    public static getLevel() { return Map.currentLevel;}
}

namespace Map {
    export class Level {
        private levelTilemap: tiles.TileMapData;

        constructor(tilemap: tiles.TileMapData)  {
            this.levelTilemap = tilemap;
        }

        public getTileMap(): tiles.TileMapData { return this.levelTilemap;}
    }
}
