/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    
        export class pixelationPostProcess extends PostProcess {

            private _pixel_w: number = 10.0;

            private _pixel_h: number = 10.0;

            constructor(name: string, pixel_size: number[], options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean) {
                super(name, 
                    "pixelation", 
                    ["width", "height", "pixel_w", "pixel_h"],
                    null, 
                    options, 
                    camera, 
                    samplingMode, 
                    engine, 
                    reusable);
                
                this._pixel_w = pixel_size[0];

                this._pixel_h = pixel_size[1];

                this.onApply = (effect: Effect) => {
                    effect.setFloat("width", this.width);
                    effect.setFloat("height", this.height);
                    effect.setFloat("pixel_w", this._pixel_w);
                    effect.setFloat("pixel_h", this._pixel_h);
                };
            }
        }
    } 