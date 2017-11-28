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
    var rainPostProcess = /** @class */ (function (_super) {
        __extends(rainPostProcess, _super);
        function rainPostProcess(name, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "rain", ["time", "width", "height"], null, options, camera, samplingMode, engine, reusable) || this;
            _this.degree = 1;
            _this._lastTime = 0;
            _this._lastDeltaTime = 0;
            //camera.getEngine().getRenderWidth;
            var deltaTime = camera.getScene().getEngine().getDeltaTime();
            if (deltaTime !== _this._lastDeltaTime) {
                _this._lastDeltaTime = deltaTime;
                _this._lastTime += _this._lastDeltaTime;
            }
            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;
            _this.onApplyObservable.add(function (effect) {
                effect.setFloat("width", camera.getEngine().getRenderWidth());
                effect.setFloat("height", camera.getEngine().getRenderHeight());
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('time', cosTimeZeroOne * 10);
            });
            return _this;
        }
        return rainPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.rainPostProcess = rainPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.rainPostProcess.js.map

BABYLON.Effect.ShadersStore['rainPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float width;\nuniform float height;\nuniform float time;\n\n\n#define HASHSCALE1 443.8975\n#define HASHSCALE3 vec3(443.897,441.423,437.195)\n\nvec3 N31(float p) {\n\nvec3 p3=fract(vec3(p)*vec3(.1031,.11369,.13787));\np3+=dot(p3,p3.yzx+19.19);\nreturn fract(vec3((p3.x+p3.y)*p3.z,(p3.x+p3.z)*p3.y,(p3.y+p3.z)*p3.x));\n}\nvec3 hash31(float p)\n{\nvec3 p3=fract(vec3(p)*HASHSCALE3);\np3+=dot(p3,p3.yzx+19.19);\nreturn fract((p3.xxy+p3.yzz)*p3.zyx); \n}\nfloat SawTooth(float t) {\nreturn cos(t+cos(t))+sin(2.*t)*.2+sin(4.*t)*.02;\n}\nvec2 GetDrops(vec2 uv,float seed) {\nfloat t=time;\nuv.y+=t*0.05; \nuv*=vec2(40.,5.);\nvec2 id=floor(uv); \nvec3 n=N31(id.x+(id.y+seed)*546.3524); \nvec2 bd=fract(uv); \nbd-=.5; \n\nbd.y*=4.;\nbd.x+=(n.x-.5)*.6; \nt+=n.z*6.; \nfloat slide=SawTooth(t);\nbd.y+=slide*2.; \n\nfloat d=length(bd); \nvec2 normalbd=normalize(bd);\nfloat temp=-0.10*normalbd.y+0.20;\n\nfloat mainDrop=smoothstep(temp,.1,d);\nreturn bd*mainDrop;\n}\nvoid main(void)\n{\nvec2 uv=vUV;\nvec2 offs=vec2(0.);\noffs=GetDrops(uv*0.5,1.);\n\noffs+=GetDrops(uv*2.,25.);\nconst vec2 lensRadius=vec2(1.5,0.05);\nfloat dist=distance(uv.xy,vec2(0.5,0.5));\nfloat vigfin=pow(1.-smoothstep(lensRadius.x,lensRadius.y,dist),2.);\noffs*=vigfin*10.0;\nuv-=offs;\ngl_FragColor=texture2D(textureSampler,uv-offs);\n\n}\n";
