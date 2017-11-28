
declare module BABYLON {
    class frostPostProcess extends PostProcess {
        degree: number;
        othertexture: Nullable<Texture>;
        private _lastTime;
        private _lastDeltaTime;
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}
