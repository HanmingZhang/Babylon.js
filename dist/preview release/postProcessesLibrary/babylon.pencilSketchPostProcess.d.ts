
declare module BABYLON {
    class pencilSketchPostProcess extends PostProcess {
        private _brighttexture;
        private _darktexture;
        constructor(name: string, imgUrls: string[], options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}
