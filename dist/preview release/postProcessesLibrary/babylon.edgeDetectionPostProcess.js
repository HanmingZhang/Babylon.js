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
    var EdgeDetectionPostProcess = /** @class */ (function (_super) {
        __extends(EdgeDetectionPostProcess, _super);
        function EdgeDetectionPostProcess(name, camera, edgeThickness) {
            var _this = _super.call(this, name, "sobeledgedetection", ["width", "height", "edgeThickness"], null, {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true) || this;
            _this._edgeThickness = 0;
            _this._minEdgeThickness = 0.5;
            _this._maxEdgeThickness = 4.0;
            console.log("input thickness", edgeThickness);
            // set the thickness value of edge detection post process
            _this._edgeThickness = Math.min(Math.max(edgeThickness, _this._minEdgeThickness), _this._maxEdgeThickness);
            _this.onApply = function (effect) {
                effect.setFloat("width", _this.width);
                effect.setFloat("height", _this.height);
                effect.setFloat("edgeThickness", _this._edgeThickness);
            };
            return _this;
        }
        return EdgeDetectionPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.EdgeDetectionPostProcess = EdgeDetectionPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.edgeDetectionPostProcess.js.map

BABYLON.Effect.ShadersStore['sobeledgedetectionPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float width;\nuniform float height;\nuniform float edgeThickness;\nvoid make_kernel(inout vec4 n[9],sampler2D tex,vec2 coord)\n{\nfloat w=edgeThickness/width;\nfloat h=edgeThickness/height;\nn[0]=texture2D(tex,coord+vec2( -w,-h));\nn[1]=texture2D(tex,coord+vec2(0.0,-h));\nn[2]=texture2D(tex,coord+vec2( w,-h));\nn[3]=texture2D(tex,coord+vec2( -w,0.0));\nn[4]=texture2D(tex,coord);\nn[5]=texture2D(tex,coord+vec2( w,0.0));\nn[6]=texture2D(tex,coord+vec2( -w,h));\nn[7]=texture2D(tex,coord+vec2(0.0,h));\nn[8]=texture2D(tex,coord+vec2( w,h));\n}\nvoid main(void) \n{\nvec4 n[9];\nmake_kernel( n,textureSampler,vUV );\nvec4 sobel_edge_h=n[2]+(2.0*n[5])+n[8]-(n[0]+(2.0*n[3])+n[6]);\nvec4 sobel_edge_v=n[0]+(2.0*n[1])+n[2]-(n[6]+(2.0*n[7])+n[8]);\nvec4 sobel=sqrt((sobel_edge_h*sobel_edge_h)+(sobel_edge_v*sobel_edge_v));\ngl_FragColor=vec4( 1.0-sobel.rgb,1.0 );\n}\n";
BABYLON.Effect.ShadersStore['composePixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\n\nuniform sampler2D sceneSampler;\nvoid main(void) \n{\n\ngl_FragColor=texture2D(textureSampler,vUV)*texture2D(sceneSampler,vUV);\n}";
