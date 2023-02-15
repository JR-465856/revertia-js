class Runtime {
    private static initialized = false;

    private static updateFuncs: Array<Runtime.RuntimeListener>;
    private static paintFuncs: Array<Runtime.RuntimeListener>;
    private static shadeFuncs: Array<Runtime.RuntimeListener>;

    private static readonly maxIndex: number = 1024;
    private static curIndex: number = 1;

    private static updateDelta: Runtime.DeltaTime;
    private static paintDelta: Runtime.DeltaTime;
    private static shadeDelta: Runtime.DeltaTime;

    // Runtime should not be inherited from
    private constructor() {}

    // Register a listener object
    protected static register(listener: Runtime.RuntimeListener): number {
        return 5;
    }
    
    // Get current index
    public static getCurrentIndex(): number { return this.curIndex;}

    // Resolve update type
    
    // Main initialization function
    public static main(): void {
        // Initialize
        if (!Runtime.initialized) {
            Runtime.updateFuncs = [];
            Runtime.paintFuncs = [];

            let updateLt = Runtime.updateDelta.getLastUpdate();
            let updateDt = Runtime.updateDelta.update();
            game.onUpdate(function():void {
                Runtime.updateFuncs.forEach(function(value:Runtime.RuntimeListener,index:number):void {
                    value.execute(updateDt, updateLt);
                });
            });

            let paintLt = Runtime.paintDelta.getLastUpdate();
            let paintDt = Runtime.paintDelta.update();
            game.onPaint(function(): void {
                Runtime.paintFuncs.forEach(function (value: Runtime.RuntimeListener,index:number):void {
                    value.execute(paintDt, paintLt);
                });
            });

            let shadeLt = Runtime.shadeDelta.getLastUpdate();
            let shadeDt = Runtime.shadeDelta.update();
            game.onShade(function(): void {
                Runtime.shadeFuncs.forEach(function(value:Runtime.RuntimeListener,index:number):void {
                    value.execute(shadeDt, shadeLt);
                });
            });

            Runtime.initialized = true;
        }
    }
}

namespace Runtime {
    export type tickFunction = (deltaTime: number, lastUpdate: number) => void

    export class RuntimeListener {
        private onTick: Runtime.tickFunction;
        private tickType: string;

        public constructor(tickType: string, tickFunction: Runtime.tickFunction) {
            if (tickType == "update") {

            } else if (tickType == "paint") {

            } else if (tickType == "shade") {

            }
        }

        public getFunction(): Runtime.tickFunction { return this.onTick;}
        public getType(): string { return this.tickType;}

        public setFunction(newFunction: Runtime.tickFunction): void { this.onTick = newFunction;}
        public setType(newType: string) { this.tickType = newType;}

        public execute(deltaTime: number, lastUpdate: number): void {
            this.onTick(deltaTime, lastUpdate);
        }
    }

    export class DeltaTime {
        private lastUpdate: number = 0;

        public constructor() {
            this.lastUpdate = game.runtime();
        }

        // Returns the delta between the current and last time
        // Sets the time to the current time
        public update(): number {
            let dt = game.runtime() - this.lastUpdate;
            this.lastUpdate = game.runtime();
            return dt;
        }

        // Gets the delta between the last update and current time
        // Does not update the object
        public getDelta(): number {
            return game.runtime() - this.lastUpdate;
        }

        // Gets the time the object was last updated
        public getLastUpdate(): number {
            return this.lastUpdate;
        }
    }

    
}

Runtime.main();
