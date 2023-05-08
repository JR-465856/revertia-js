class Runtime {
    private static initialized = false;

    private static updateFuncs: Array<Runtime.RuntimeListener>;
    private static paintFuncs: Array<Runtime.RuntimeListener>;
    private static shadeFuncs: Array<Runtime.RuntimeListener>;

    // Runtime should not be inherited from
    private constructor() { }

    // Register a listener object
    public static register(listener:Runtime.RuntimeListener): void {
        // Initialize registry
        if (!Runtime.initialized) {
            Runtime.updateFuncs = [];
            Runtime.paintFuncs = [];
            Runtime.shadeFuncs = [];

            game.onUpdate(() => Runtime.updateFuncs.forEach(value => value.execute()));
            game.onPaint(() => Runtime.paintFuncs.forEach(value => value.execute()));
            game.onShade(() => Runtime.shadeFuncs.forEach(value => value.execute()));

            Runtime.initialized = true;
        }
        // Register the listener
        switch(listener.getType()) {
            case Runtime.TickType.Update:
                Runtime.updateFuncs.push(listener);
                break;
            case Runtime.TickType.Paint:
                Runtime.paintFuncs.push(listener);
                break;
            case Runtime.TickType.Shade:
                Runtime.shadeFuncs.push(listener);
                break;
        }
    }

    // Deregister a listener object
    public static deregister(listener:Runtime.RuntimeListener): boolean {
        switch (listener.getType()) {
            case Runtime.TickType.Update:
                return Runtime.updateFuncs.removeElement(listener);
                break;
            case Runtime.TickType.Paint:
                return Runtime.paintFuncs.removeElement(listener);
                break;
            case Runtime.TickType.Shade:
                return Runtime.shadeFuncs.removeElement(listener);
                break;
        }
        return false;
    }
}

namespace Runtime {
    export type tickFunction = () => void;

    export enum TickType {
        Update,
        Paint,
        Shade
    }

    export class RuntimeListener {
        private tickFunction: Runtime.tickFunction;
        private tickType: Runtime.TickType;

        constructor(tickType:Runtime.TickType, tickFunction:Runtime.tickFunction) {
            this.tickType = tickType;
            this.tickFunction = tickFunction;
        }

        public setFunction(newFunction:Runtime.tickFunction): void { this.tickFunction = newFunction;}
        public getFunction(): Runtime.tickFunction { return this.tickFunction;}

        public setType(newType:Runtime.TickType) { this.tickType = newType;}
        public getType(): Runtime.TickType { return this.tickType;}

        public execute(): void {
            this.tickFunction();
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
            const dt = game.runtime()-this.lastUpdate;
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
