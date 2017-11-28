
declare module BABYLON {
    class EdgeDetectionPostProcess extends PostProcess {
        private _edgeThickness;
        private _minEdgeThickness;
        private _maxEdgeThickness;
        constructor(name: string, camera: Camera, edgeThickness: number);
    }
}
