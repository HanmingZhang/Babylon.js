
declare module BABYLON {
    class pixelationPostProcess extends PostProcess {
        private _pixel_w;
        private _pixel_h;
        constructor(name: string, pixel_size: number[], options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}
