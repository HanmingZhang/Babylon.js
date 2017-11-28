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
    var pixelationPostProcess = /** @class */ (function (_super) {
        __extends(pixelationPostProcess, _super);
        function pixelationPostProcess(name, pixel_size, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "pixelation", ["width", "height", "pixel_w", "pixel_h"], null, options, camera, samplingMode, engine, reusable) || this;
            _this._pixel_w = 10.0;
            _this._pixel_h = 10.0;
            _this._pixel_w = pixel_size[0];
            _this._pixel_h = pixel_size[1];
            _this.onApply = function (effect) {
                effect.setFloat("width", _this.width);
                effect.setFloat("height", _this.height);
                effect.setFloat("pixel_w", _this._pixel_w);
                effect.setFloat("pixel_h", _this._pixel_h);
            };
            return _this;
        }
        return pixelationPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.pixelationPostProcess = pixelationPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.pixelationPostProcess.js.map

BABYLON.Effect.ShadersStore['pixelationPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float width; \nuniform float height; \nuniform float pixel_w;\nuniform float pixel_h;\nvoid main() \n{ \n\n\n\nvec3 tc=vec3(1.0,0.0,0.0);\n\n\nfloat dx=pixel_w*(1.0/width);\nfloat dy=pixel_h*(1.0/height);\nvec2 coord=vec2(dx*floor(vUV.x/dx),\ndy*floor(vUV.y/dy));\ntc=texture2D(textureSampler,coord).rgb;\n\n\n\n\n\n\n\ngl_FragColor=vec4(tc,1.0);\n}";
