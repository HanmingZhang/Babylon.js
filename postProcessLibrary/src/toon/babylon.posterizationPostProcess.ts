/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    export class PosterizationPostProcess extends PostProcess{

        private _gamma:number = 0.6;

        private _numColors:number = 8.0;

        constructor(name: string, camera: Camera, gamma: number, numColors: number) {
            super(name, 
                "posterization", 
                ["gamma", "numColors"], 
                null, 
                { 
                    width: camera.getEngine().getRenderWidth(), 
                    height: camera.getEngine().getRenderHeight()
                },
                camera, 
                Texture.TRILINEAR_SAMPLINGMODE, 
                camera.getEngine(), 
                true);
            
            
            console.log("input gamma", gamma);
            this._gamma = gamma;

            console.log("input numColors", numColors);
            this._numColors = numColors;


            this.onApply = (effect: Effect) => {
                effect.setFloat("gamma", this._gamma);
                effect.setFloat("numColors", this._numColors);
            };

        }
    }
}
