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
    var pencilSketchPostProcess = /** @class */ (function (_super) {
        __extends(pencilSketchPostProcess, _super);
        function pencilSketchPostProcess(name, imgUrls, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "pencilsketch", null, ["brighttexture", "darktexture"], options, camera, samplingMode, engine, reusable) || this;
            _this._brighttexture = null;
            _this._darktexture = null;
            _this._brighttexture = imgUrls[0] ? new BABYLON.Texture(imgUrls[0], camera.getScene(), true) : null;
            _this._darktexture = imgUrls[1] ? new BABYLON.Texture(imgUrls[1], camera.getScene(), true) : null;
            _this.onApplyObservable.add(function (effect) {
                effect.setTexture("brighttexture", _this._brighttexture);
                effect.setTexture("darktexture", _this._darktexture);
            });
            return _this;
        }
        return pencilSketchPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.pencilSketchPostProcess = pencilSketchPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.pencilSketchPostProcess.js.map

BABYLON.Effect.ShadersStore['pencilsketchPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D brighttexture;\nuniform sampler2D darktexture;\nvec3 Hatching(vec2 uv,float intensity)\n{\nvec3 hatch0=texture2D(brighttexture,uv).rgb;\nvec3 hatch1=texture2D(darktexture,uv).rgb;\nfloat overbright=max(0,intensity-1.0);\nvec3 intensity3=vec3(intensity*6.0);\nvec3 weightsA=clamp(intensity3+vec3(-0,-1,-2),0,1);\nvec3 weightsB=clamp(intensity3+vec3(-3,-4,-5),0,1);\nweightsA.xy-=weightsA.yz;\nweightsA.z-=weightsB.x;\nweightsB.xy-=weightsB.yz;\nhatch0=hatch0*weightsA;\nhatch1=hatch1*weightsB;\nfloat hatching=overbright+hatch0.r+hatch0.g+hatch0.b+hatch1.r+hatch1.g+hatch1.b;\nreturn vec3(hatching);\n}\nvoid main(void) \n{\nvec3 color=texture2D(textureSampler,vUV).rgb;\nfloat intensity=dot(color,vec3(0.2326,0.7152,0.0722));\ncolor=Hatching(vUV.uv*8.0,intensity);\ngl_FragColor=vec4(color,1.0);\n}";
