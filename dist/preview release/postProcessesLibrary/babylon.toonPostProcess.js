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
        function EdgeDetectionPostProcess(name, camera, edgeThickness, sceneSampler) {
            var _this = _super.call(this, name, "sobeledgedetection", ["width", "height", "edgeThickness"], ["sceneSampler"], {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true) || this;
            _this._edgeThickness = 1.0;
            _this._minEdgeThickness = 0.5;
            _this._maxEdgeThickness = 4.0;
            console.log("input thickness", edgeThickness);
            // set the thickness value of edge detection post process
            _this._edgeThickness = Math.min(Math.max(edgeThickness, _this._minEdgeThickness), _this._maxEdgeThickness);
            _this.onApply = function (effect) {
                effect.setTextureFromPostProcess("sceneSampler", sceneSampler);
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
    var PosterizationPostProcess = /** @class */ (function (_super) {
        __extends(PosterizationPostProcess, _super);
        function PosterizationPostProcess(name, camera, gamma, numColors) {
            var _this = _super.call(this, name, "posterization", ["gamma", "numColors"], null, {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true) || this;
            _this._gamma = 0.6;
            _this._numColors = 8.0;
            console.log("input gamma", gamma);
            _this._gamma = gamma;
            console.log("input numColors", numColors);
            _this._numColors = numColors;
            _this.onApply = function (effect) {
                effect.setFloat("gamma", _this._gamma);
                effect.setFloat("numColors", _this._numColors);
            };
            return _this;
        }
        return PosterizationPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.PosterizationPostProcess = PosterizationPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.posterizationPostProcess.js.map

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
    var paperPostProcess = /** @class */ (function (_super) {
        __extends(paperPostProcess, _super);
        function paperPostProcess(name, imgUrl, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "paper", null, ["othertexture"], options, camera, samplingMode, engine, reusable) || this;
            _this._othertexture = null;
            _this._othertexture = imgUrl ? new BABYLON.Texture(imgUrl, camera.getScene(), true) : null;
            _this.onApplyObservable.add(function (effect) {
                effect.setTexture("othertexture", _this._othertexture);
            });
            return _this;
        }
        return paperPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.paperPostProcess = paperPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.paperPostProcess.js.map

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
    var kuwaharaPostProcess = /** @class */ (function (_super) {
        __extends(kuwaharaPostProcess, _super);
        function kuwaharaPostProcess(name, imgUrl, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "kuwahara", ["radius", "width", "height"], null, {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, samplingMode, engine, reusable) || this;
            _this._radius = 3;
            if (typeof (options) === "number") {
                console.log("input radius", options);
                _this._radius = options;
            }
            _this.onApplyObservable.add(function (effect) {
                effect.setFloat("radius", _this._radius);
                effect.setFloat("width", _this.width);
                effect.setFloat("height", _this.height);
            });
            return _this;
        }
        return kuwaharaPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.kuwaharaPostProcess = kuwaharaPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.kuwaharaPostProcess.js.map

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
    var framePostProcess = /** @class */ (function (_super) {
        __extends(framePostProcess, _super);
        function framePostProcess(name, imgUrl, options, camera, samplingMode, engine, reusable) {
            var _this = _super.call(this, name, "frame", null, ["othertexture"], options, camera, samplingMode, engine, reusable) || this;
            _this._othertexture = null;
            _this._othertexture = imgUrl ? new BABYLON.Texture(imgUrl, camera.getScene(), true) : null;
            _this.onApplyObservable.add(function (effect) {
                effect.setTexture("othertexture", _this._othertexture);
            });
            return _this;
        }
        return framePostProcess;
    }(BABYLON.PostProcess));
    BABYLON.framePostProcess = framePostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.framePostProcess.js.map

BABYLON.Effect.ShadersStore['sobeledgedetectionPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D sceneSampler;\nuniform float width;\nuniform float height;\nuniform float edgeThickness;\nvoid make_kernel(inout vec4 n[9],sampler2D tex,vec2 coord)\n{\nfloat w=edgeThickness/width;\nfloat h=edgeThickness/height;\nn[0]=texture2D(tex,coord+vec2( -w,-h));\nn[1]=texture2D(tex,coord+vec2(0.0,-h));\nn[2]=texture2D(tex,coord+vec2( w,-h));\nn[3]=texture2D(tex,coord+vec2( -w,0.0));\nn[4]=texture2D(tex,coord);\nn[5]=texture2D(tex,coord+vec2( w,0.0));\nn[6]=texture2D(tex,coord+vec2( -w,h));\nn[7]=texture2D(tex,coord+vec2(0.0,h));\nn[8]=texture2D(tex,coord+vec2( w,h));\n}\nvoid main(void) \n{\nvec4 n[9];\nmake_kernel( n,sceneSampler,vUV );\nvec4 sobel_edge_h=n[2]+(2.0*n[5])+n[8]-(n[0]+(2.0*n[3])+n[6]);\nvec4 sobel_edge_v=n[0]+(2.0*n[1])+n[2]-(n[6]+(2.0*n[7])+n[8]);\nvec4 sobel=sqrt((sobel_edge_h*sobel_edge_h)+(sobel_edge_v*sobel_edge_v));\nfloat minGradChannel=min(sobel.r,min(sobel.g,sobel.b));\ngl_FragColor=vec4( 1.0-vec3(minGradChannel),1.0 );\n}\n";
BABYLON.Effect.ShadersStore['posterizationPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float gamma; \nuniform float numColors; \nvoid main(void) \n{ \nvec3 c=texture2D(textureSampler,vUV).rgb;\nc=pow(c,vec3(gamma,gamma,gamma));\nc=c*numColors;\nc=floor(c);\nc=c/numColors;\nc=pow(c,vec3(1.0/gamma));\ngl_FragColor=vec4(c,1.0);\n}\n";
BABYLON.Effect.ShadersStore['composePixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\n\nuniform sampler2D sceneSampler;\nvoid main(void) \n{\n\ngl_FragColor=texture2D(textureSampler,vUV)*texture2D(sceneSampler,vUV);\n}";
BABYLON.Effect.ShadersStore['paperPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D othertexture;\nvoid main(void) \n{\nvec3 color=texture2D(textureSampler,vUV).rgb*texture2D(othertexture,vUV).rgb;\ngl_FragColor=vec4(color,1.0);\n}";
BABYLON.Effect.ShadersStore['kuwaharaPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform float radius;\nuniform float width;\nuniform float height;\nvoid main(void) \n{ \nint loopTimes=int(radius);\nvec2 src_size=vec2 (1.0/width,1.0/height);\nfloat n=(radius+1.0)*(radius+1.0);\nint i; \nint j;\nvec3 m0=vec3(0.0); vec3 m1=vec3(0.0); vec3 m2=vec3(0.0); vec3 m3=vec3(0.0);\nvec3 s0=vec3(0.0); vec3 s1=vec3(0.0); vec3 s2=vec3(0.0); vec3 s3=vec3(0.0);\nvec3 c;\nfor (int j=-loopTimes; j<=0; ++j) {\nfor (int i=-loopTimes; i<=0; ++i) {\nc=texture2D(textureSampler,vUV+vec2(i,j)*src_size).rgb;\nm0+=c;\ns0+=c*c;\n}\n}\nfor (int j=-loopTimes; j<=0; ++j) {\nfor (int i=0; i<=loopTimes; ++i) {\nc=texture2D(textureSampler,vUV+vec2(i,j)*src_size).rgb;\nm1+=c;\ns1+=c*c;\n}\n}\nfor (int j=0; j<=loopTimes; ++j) {\nfor (int i=0; i<=loopTimes; ++i) {\nc=texture2D(textureSampler,vUV+vec2(i,j)*src_size).rgb;\nm2+=c;\ns2+=c*c;\n}\n}\nfor (int j=0; j<=loopTimes; ++j) {\nfor (int i=-loopTimes; i<=0; ++i) {\nc=texture2D(textureSampler,vUV+vec2(i,j)*src_size).rgb;\nm3+=c;\ns3+=c*c;\n}\n}\nfloat min_sigma2=100.0;\nm0/=n;\ns0=abs(s0/n-m0*m0);\nfloat sigma2=s0.r+s0.g+s0.b;\nif (sigma2<min_sigma2) {\nmin_sigma2=sigma2;\ngl_FragColor=vec4(m0,1.0);\n}\nm1/=n;\ns1=abs(s1/n-m1*m1);\nsigma2=s1.r+s1.g+s1.b;\nif (sigma2<min_sigma2) {\nmin_sigma2=sigma2;\ngl_FragColor=vec4(m1,1.0);\n}\nm2/=n;\ns2=abs(s2/n-m2*m2);\nsigma2=s2.r+s2.g+s2.b;\nif (sigma2<min_sigma2) {\nmin_sigma2=sigma2;\ngl_FragColor=vec4(m2,1.0);\n}\n}";
BABYLON.Effect.ShadersStore['framePixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D othertexture;\nvoid main(void) \n{\nvec3 framecolor=texture2D(othertexture,vUV).rgb;\nfloat alpha=texture2D(othertexture,vUV).a;\ngl_FragColor=vec4(texture2D(textureSampler,vUV).rgb*(1.0-alpha)+framecolor*alpha,1.0);\n}";
