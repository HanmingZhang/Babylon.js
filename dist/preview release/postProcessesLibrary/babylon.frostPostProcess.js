/// <reference path="../../../dist/preview release/babylon.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BABYLON;
(function (BABYLON) {
    var frostPostProcess = /** @class */ (function (_super) {
        __extends(frostPostProcess, _super);
        function frostPostProcess(name, imgUrl, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "frost", ["time", "width", "height"], ["othertexture"], options, camera, samplingMode, engine, reusable) || this;
            _this.degree = 1;
            //@serializeAsTexture("Texture")
            _this.othertexture = null;
            _this._lastTime = 0;
            _this._lastDeltaTime = 0;
            _this.othertexture = imgUrl ? new BABYLON.Texture(imgUrl, camera.getScene(), true) : null;
            //camera.getEngine().getRenderWidth;
            var deltaTime = camera.getScene().getEngine().getDeltaTime();
            if (deltaTime !== _this._lastDeltaTime) {
                _this._lastDeltaTime = deltaTime;
                _this._lastTime += _this._lastDeltaTime;
            }
            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;
            _this.onApplyObservable.add(function (effect) {
                effect.setTexture("othertexture", _this.othertexture);
                //effect.setFloat("time", this._lastTime / 100000);
                effect.setFloat("width", camera.getEngine().getRenderWidth());
                effect.setFloat("height", camera.getEngine().getRenderHeight());
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('time', cosTimeZeroOne * 10);
            });
            return _this;
        }
        return frostPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.frostPostProcess = frostPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.frostPostProcess.js.map

BABYLON.Effect.ShadersStore['frostPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D othertexture;\nuniform float width;\nuniform float height;\nuniform float time;\n#define FROSTYNESS 2.0\n#define COLORIZE 1.0\n#define COLOR_RGB 0.2,1.0,1.0\nfloat rand(vec2 uv) {\nfloat a=dot(uv,vec2(92.,80.));\nfloat b=dot(uv,vec2(41.,62.));\nfloat x=sin(a)+cos(b)*51.;\nreturn fract(x);\n}\n#define HASHSCALE1 .1031\nfloat hash12(vec2 p)\n{\nvec3 p3=fract(vec3(p.xyx)*HASHSCALE1);\np3+=dot(p3,p3.yzx+19.19);\nreturn fract((p3.x+p3.y)*p3.z);\n}\nvoid main( void)\n{\nvec2 uv=vUV;\nvec4 d=texture2D(othertexture,uv);\nvec2 rnd=vec2(rand(uv+d.r*.05),rand(uv+d.b*.05));\n\nconst vec2 lensRadius=vec2(2.0,0.05);\nfloat dist=distance(uv.xy,vec2(0.5,0.5));\nfloat vigfin=pow(1.-smoothstep(lensRadius.x,lensRadius.y,dist),2.);\nrnd*=.025*vigfin+d.rg*FROSTYNESS*vigfin;\nuv+=rnd;\ngl_FragColor=mix(texture2D(textureSampler,uv),vec4(COLOR_RGB,1.0),COLORIZE*vec4(rnd.r));\n}";
