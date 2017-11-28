/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {

    export class rainPostProcess extends PostProcess {
        public degree = 1;
        private _lastTime: number = 0;
        private _lastDeltaTime: number = 0;
    
        constructor(name: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean) {
            super(name, "rain", ["time","width", "height"], null, options, camera, samplingMode, engine, reusable);

            //camera.getEngine().getRenderWidth;
            let deltaTime = camera.getScene().getEngine().getDeltaTime();
            if (deltaTime !== this._lastDeltaTime) {
                this._lastDeltaTime = deltaTime;
                this._lastTime += this._lastDeltaTime;
            }

            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;

            this.onApplyObservable.add((effect: Effect) => {
                effect.setFloat("width", camera.getEngine().getRenderWidth());
                effect.setFloat("height", camera.getEngine().getRenderHeight());
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('time', cosTimeZeroOne * 10);
            });
        }
    }
} 