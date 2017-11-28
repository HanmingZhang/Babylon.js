/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {

    export class frostPostProcess extends PostProcess {
        public degree = 1;
        //@serializeAsTexture("Texture")
        public othertexture: Nullable<Texture> = null;
        private _lastTime: number = 0;
        private _lastDeltaTime: number = 0;
    
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean) {
            super(name, "frost", ["time","width", "height"], ["othertexture"], options, camera, samplingMode, engine, reusable);

            this.othertexture = imgUrl ? new Texture(imgUrl, camera.getScene(), true) : null;

            //camera.getEngine().getRenderWidth;
            let deltaTime = camera.getScene().getEngine().getDeltaTime();
            if (deltaTime !== this._lastDeltaTime) {
                this._lastDeltaTime = deltaTime;
                this._lastTime += this._lastDeltaTime;
            }

            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;

            this.onApplyObservable.add((effect: Effect) => {
                effect.setTexture("othertexture", this.othertexture);
                //effect.setFloat("time", this._lastTime / 100000);
                effect.setFloat("width", camera.getEngine().getRenderWidth());
                effect.setFloat("height", camera.getEngine().getRenderHeight());
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('time', cosTimeZeroOne * 10);
            });
        }
    }
} 