/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    export class EdgeDetectionPostProcess extends PostProcess{

        private _edgeThickness:number = 1.0;

        private _minEdgeThickness:number = 0.5;

        private _maxEdgeThickness:number = 4.0;


        constructor(name: string, camera: Camera, edgeThickness: number, sceneSampler: PostProcess) {
            super(name, 
                "sobeledgedetection", 
                ["width", "height", "edgeThickness"], 
                ["sceneSampler"], 
                { 
                    width: camera.getEngine().getRenderWidth(), 
                    height: camera.getEngine().getRenderHeight()
                },
                camera, 
                Texture.TRILINEAR_SAMPLINGMODE, 
                camera.getEngine(), 
                true);
            
            
            console.log("input thickness", edgeThickness);

            // set the thickness value of edge detection post process
            this._edgeThickness = Math.min(Math.max(edgeThickness, this._minEdgeThickness), this._maxEdgeThickness);


            this.onApply = (effect: Effect) => {
                effect.setTextureFromPostProcess("sceneSampler", sceneSampler);
                effect.setFloat("width", this.width);
                effect.setFloat("height", this.height);
                effect.setFloat("edgeThickness",this._edgeThickness); 
            };

        }
    }
}
