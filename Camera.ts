class Camera {
    private static currentCamera: Camera;
    private static cameraUpdate: Runtime.RuntimeListener;
    private pos: Coordinate;

    constructor() {
        // Initialize
        if (Camera.cameraUpdate == undefined) {
            Camera.cameraUpdate = new Runtime.RuntimeListener(
                Runtime.TickType.Paint,
                () => {
                    if (Camera.currentCamera != undefined) {
                        const camPos = Camera.currentCamera.getPosition();
                        scene.centerCameraAt(
                            Math.floor(camPos.getX()),
                            Math.floor(camPos.getY())
                        );
                    }
                }
            );
            Runtime.register(Camera.cameraUpdate);
        }

        // Set initial position
        this.pos = Coordinate.zero();
    }

    public focus(): void {
        Camera.currentCamera = this;
    }

    public setPosition(newPos:Coordinate): void { this.pos = newPos;}
    public getPosition(): Coordinate { return this.pos;}
}
