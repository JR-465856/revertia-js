abstract class Controls {
    private static buttonStates: Array<boolean>;
    private static buttonListeners: Array<Controls.ButtonFunction>;
    private static initialized: boolean = false;

    private constructor() { }

    public static register(func:Controls.ButtonFunction): void {
        // Initialize if Controls hasn't already
        if (!Controls.initialized) {
            // Initialize arrays
            if (Controls.buttonStates == null) Controls.buttonStates = [];
            if (Controls.buttonListeners == null) Controls.buttonListeners = [];
            // Set button states
            Controls.buttonStates[Controls.Button.Down] = controller.down.isPressed();
            Controls.buttonStates[Controls.Button.Up] = controller.up.isPressed();
            Controls.buttonStates[Controls.Button.Right] = controller.right.isPressed();
            Controls.buttonStates[Controls.Button.Left] = controller.left.isPressed();
            Controls.buttonStates[Controls.Button.A] = controller.A.isPressed();
            Controls.buttonStates[Controls.Button.B] = controller.B.isPressed();

            // On pressed
            controller.down.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.Down] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Down, true);
                });
            });
            controller.up.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.Up] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Up, true);
                });
            });
            controller.right.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.Right] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Right, true);
                });
            });
            controller.left.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.Left] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Left, true);
                });
            });
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.A] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.A, true);
                });
            });
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
                Controls.buttonStates[Controls.Button.B] = true;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.B, true);
                });
            });

            // On released
            controller.down.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.Down] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Down, false);
                });
            });
            controller.up.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.Up] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Up, false);
                });
            });
            controller.right.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.Right] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Right, false);
                });
            });
            controller.left.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.Left] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.Left, false);
                });
            });
            controller.A.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.A] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.A, false);
                });
            });
            controller.B.onEvent(ControllerButtonEvent.Released, () => {
                Controls.buttonStates[Controls.Button.B] = false;
                Controls.buttonListeners.forEach((value:Controls.ButtonFunction, index:number) => {
                    value(Controls.Button.B, false);
                });
            });
        }

        // Register the function
        Controls.buttonListeners.push(func);
    }
}

namespace Controls {
    export type ButtonFunction = (buttonType:Controls.Button, pressed:boolean) => void;

    export enum Button {
        Down,
        Up,
        Right,
        Left,
        A,
        B
    }
}
