/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {

    export class paperPostProcess extends PostProcess {

        private _othertexture: Nullable<Texture> = null;
    
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean) {
            super(name, 
                "paper", 
                null,
                ["othertexture"], 
                options, 
                camera, 
                samplingMode, 
                engine, 
                reusable);

            this._othertexture = imgUrl ? new Texture(imgUrl, camera.getScene(), true) : null;

            this.onApplyObservable.add((effect: Effect) => {
                effect.setTexture("othertexture", this._othertexture);
            });
        }
    }
} 