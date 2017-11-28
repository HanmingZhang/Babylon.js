
declare module BABYLON {
    class rainPostProcess extends PostProcess {
        degree: number;
        private _lastTime;
        private _lastDeltaTime;
        constructor(name: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}
