/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {

    export class kuwaharaPostProcess extends PostProcess {

        private _radius: number = 3;

        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean) {
            super(name, 
                "kuwahara", 
                ["radius", "width", "height"], 
                null, 
                { 
                    width: camera.getEngine().getRenderWidth(), 
                    height: camera.getEngine().getRenderHeight()
                },
                camera, 
                samplingMode, 
                engine, 
                reusable);
            

            if(typeof(options) === "number"){
                console.log("input radius", options);
                this._radius = options;
            }

            this.onApplyObservable.add((effect: Effect) => {
                effect.setFloat("radius", this._radius);
                effect.setFloat("width",  this.width);
                effect.setFloat("height", this.height);
            });
        }
    }
} 