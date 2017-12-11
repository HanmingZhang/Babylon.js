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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BABYLON;
(function (BABYLON) {
    var anotherSkyMaterialDefines = /** @class */ (function (_super) {
        __extends(anotherSkyMaterialDefines, _super);
        function anotherSkyMaterialDefines() {
            var _this = _super.call(this) || this;
            _this.CLIPPLANE = false;
            _this.POINTSIZE = false;
            _this.FOG = false;
            _this.VERTEXCOLOR = false;
            _this.VERTEXALPHA = false;
            // switch to false to disable real-time generated clouds
            _this.DIFFUSENOISE = false; //true;
            _this.rebuild();
            return _this;
        }
        return anotherSkyMaterialDefines;
    }(BABYLON.MaterialDefines));
    var anotherSkyMaterial = /** @class */ (function (_super) {
        __extends(anotherSkyMaterial, _super);
        function anotherSkyMaterial(name, scene) {
            var _this = _super.call(this, name, scene) || this;
            // Public members
            _this.lastTime = 0;
            /*public timeScale: number = 1.0;
            public cloudScale: number = 1.0;
            public cover: number = 0.5;
            public softness: number = 0.2;
            public brightness: number = 0.0;
            public noiseOctaves: number = 4.0;
            public curlStrain: number = 3.0;*/
            _this.timeScale = 0.1;
            _this.cloudScale = 0.1;
            //public cloudScale: number = 0.0;
            _this.cover = 0.5;
            _this.softness = 0.2;
            _this.brightness = 0.1;
            _this.noiseOctaves = 5.0;
            _this.curlStrain = 3.0;
            _this.skyTime = 0;
            _this.luminance = 1.0;
            _this.turbidity = 10.0;
            //public turbidity: number = 3.7;
            _this.rayleigh = 2.0;
            //public rayleigh: number = 0.1;
            _this.mieCoefficient = 0.005;
            //public mieCoefficient: number = 0.001;
            _this.turbidity2 = 3.7;
            _this.rayleigh2 = 0.1;
            _this.mieCoefficient2 = 0.001;
            _this.mieDirectionalG = 0.8;
            _this.distance = 500;
            _this.inclination = 0.49;
            _this.azimuth = 0.25;
            _this.sunPosition = new BABYLON.Vector3(1, 0, 0);
            _this.useSunPosition = true;
            // @serializeAsTexture("perlinNoiseTexture")
            // private _perlinNoiseTexture: BaseTexture;
            // @expandToProperty("_markAllSubMeshesAsTexturesDirty")
            // public perlinNoiseTexture: BaseTexture;  
            // Private members
            _this._cameraPosition = BABYLON.Vector3.Zero();
            return _this;
        }
        anotherSkyMaterial.prototype.needAlphaBlending = function () {
            return (this.alpha < 1.0);
        };
        anotherSkyMaterial.prototype.needAlphaTesting = function () {
            return false;
        };
        anotherSkyMaterial.prototype.getAlphaTestTexture = function () {
            return null;
        };
        // Methods   
        anotherSkyMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
            if (this.isFrozen) {
                if (this._wasPreviouslyReady && subMesh.effect) {
                    return true;
                }
            }
            if (!subMesh._materialDefines) {
                subMesh._materialDefines = new anotherSkyMaterialDefines();
            }
            var defines = subMesh._materialDefines;
            var scene = this.getScene();
            if (!this.checkReadyOnEveryCall && subMesh.effect) {
                if (this._renderId === scene.getRenderId()) {
                    return true;
                }
            }
            BABYLON.MaterialHelper.PrepareDefinesForMisc(mesh, scene, false, this.pointsCloud, this.fogEnabled, defines);
            // Attribs
            BABYLON.MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, false);
            // if (defines._areTexturesDirty) {                
            //     if (scene.texturesEnabled) {
            //         if (StandardMaterial.DiffuseTextureEnabled) {
            //             var textures = [this.perlinNoiseTexture];
            //             var textureDefines = ["DIFFUSENOISE"];
            //             for (var i=0; i < textures.length; i++) {
            //                 if (textures[i]) {
            //                     if (!textures[i].isReady()) {
            //                         return false;
            //                     } else {
            //                         (<any>defines)[textureDefines[i]] = true;
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
            // Get correct effect      
            if (defines.isDirty) {
                defines.markAsProcessed();
                scene.resetCachedMaterial();
                // Fallbacks
                var fallbacks = new BABYLON.EffectFallbacks();
                if (defines.FOG) {
                    fallbacks.addFallback(1, "FOG");
                }
                //Attributes
                var attribs = [BABYLON.VertexBuffer.PositionKind];
                if (defines.VERTEXCOLOR) {
                    attribs.push(BABYLON.VertexBuffer.ColorKind);
                }
                var shaderName = "anotherSky";
                var join = defines.toString();
                subMesh.setEffect(scene.getEngine().createEffect(shaderName, attribs, ["world", "viewProjection", "view",
                    "vFogInfos", "vFogColor", "pointSize", "vClipPlane",
                    "luminance", "turbidity", "rayleigh", "mieCoefficient", "mieDirectionalG", "sunPosition",
                    "cameraPosition", "time",
                    "timeScale", "cloudScale", "cover", "softness", "brightness", "noiseOctaves", "curlStrain",
                    "skyTime",
                    "turbidity2", "rayleigh2", "mieCoefficient2"
                ], [], join, fallbacks, this.onCompiled, this.onError), defines);
            }
            if (!subMesh.effect || !subMesh.effect.isReady()) {
                return false;
            }
            this._renderId = scene.getRenderId();
            this._wasPreviouslyReady = true;
            return true;
        };
        anotherSkyMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
            var scene = this.getScene();
            var defines = subMesh._materialDefines;
            if (!defines) {
                return;
            }
            var effect = subMesh.effect;
            if (!effect) {
                return;
            }
            this._activeEffect = effect;
            // Matrices        
            this.bindOnlyWorldMatrix(world);
            this._activeEffect.setMatrix("viewProjection", scene.getTransformMatrix());
            // if (scene.getCachedMaterial() !== this) {
            //     if (this.perlinNoiseTexture) {
            //         this._activeEffect.setTexture("perlinNoiseSampler", this.perlinNoiseTexture);
            //     }
            // }
            if (this._mustRebind(scene, effect)) {
                // Clip plane
                if (scene.clipPlane) {
                    var clipPlane = scene.clipPlane;
                    this._activeEffect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
                }
                // Point size
                if (this.pointsCloud) {
                    this._activeEffect.setFloat("pointSize", this.pointSize);
                }
            }
            // View
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
                this._activeEffect.setMatrix("view", scene.getViewMatrix());
            }
            // Fog
            BABYLON.MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect);
            // Time
            this.lastTime += scene.getEngine().getDeltaTime();
            this._activeEffect.setFloat("time", this.lastTime / 100.0);
            this._activeEffect.setFloat("timeScale", this.timeScale);
            this._activeEffect.setFloat("cloudScale", this.cloudScale);
            this._activeEffect.setFloat("cover", this.cover);
            this._activeEffect.setFloat("softness", this.softness);
            this._activeEffect.setFloat("brightness", this.brightness);
            this._activeEffect.setFloat("noiseOctaves", this.noiseOctaves);
            this._activeEffect.setFloat("curlStrain", this.curlStrain);
            this._activeEffect.setFloat("skyTime", this.skyTime);
            // Sky
            var camera = scene.activeCamera;
            if (camera) {
                var cameraWorldMatrix = camera.getWorldMatrix();
                this._cameraPosition.x = cameraWorldMatrix.m[12];
                this._cameraPosition.y = cameraWorldMatrix.m[13];
                this._cameraPosition.z = cameraWorldMatrix.m[14];
                this._activeEffect.setVector3("cameraPosition", this._cameraPosition);
            }
            if (this.luminance > 0) {
                this._activeEffect.setFloat("luminance", this.luminance);
            }
            this._activeEffect.setFloat("turbidity", this.turbidity);
            this._activeEffect.setFloat("rayleigh", this.rayleigh);
            this._activeEffect.setFloat("mieCoefficient", this.mieCoefficient);
            this._activeEffect.setFloat("turbidity2", this.turbidity2);
            this._activeEffect.setFloat("rayleigh2", this.rayleigh2);
            this._activeEffect.setFloat("mieCoefficient2", this.mieCoefficient2);
            this._activeEffect.setFloat("mieDirectionalG", this.mieDirectionalG);
            if (!this.useSunPosition) {
                var theta = Math.PI * (this.inclination - 0.5);
                var phi = 2 * Math.PI * (this.azimuth - 0.5);
                this.sunPosition.x = this.distance * Math.cos(phi);
                this.sunPosition.y = this.distance * Math.sin(phi) * Math.sin(theta);
                this.sunPosition.z = this.distance * Math.sin(phi) * Math.cos(theta);
            }
            this._activeEffect.setVector3("sunPosition", this.sunPosition);
            this._afterBind(mesh, this._activeEffect);
        };
        anotherSkyMaterial.prototype.getAnimatables = function () {
            var results = [];
            if (this.mixTexture && this.mixTexture.animations && this.mixTexture.animations.length > 0) {
                results.push(this.mixTexture);
            }
            return results;
        };
        // public getActiveTextures(): BaseTexture[] {
        //     var activeTextures = super.getActiveTextures();
        //     if (this._perlinNoiseTexture) {
        //         activeTextures.push(this._perlinNoiseTexture);
        //     }
        //     return activeTextures;
        // }
        // public hasTexture(texture: BaseTexture): boolean {
        //     if (super.hasTexture(texture)) {
        //         return true;
        //     }
        //     if (this._perlinNoiseTexture === texture) {
        //         return true;
        //     } 
        //     return false;   
        // }
        anotherSkyMaterial.prototype.dispose = function (forceDisposeEffect) {
            if (this.mixTexture) {
                this.mixTexture.dispose();
            }
            _super.prototype.dispose.call(this, forceDisposeEffect);
        };
        anotherSkyMaterial.prototype.clone = function (name) {
            var _this = this;
            return BABYLON.SerializationHelper.Clone(function () { return new anotherSkyMaterial(name, _this.getScene()); }, this);
        };
        anotherSkyMaterial.prototype.serialize = function () {
            var serializationObject = BABYLON.SerializationHelper.Serialize(this);
            serializationObject.customType = "BABYLON.anotherSkyMaterial";
            return serializationObject;
        };
        anotherSkyMaterial.prototype.getClassName = function () {
            return "anotherSkyMaterial";
        };
        // Statics
        anotherSkyMaterial.Parse = function (source, scene, rootUrl) {
            return BABYLON.SerializationHelper.Parse(function () { return new anotherSkyMaterial(source.name, scene); }, source, scene, rootUrl);
        };
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "luminance", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "turbidity", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "rayleigh", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "mieCoefficient", void 0);
        __decorate([
            BABYLON.serialize()
            //public turbidity: number = 10.0;
        ], anotherSkyMaterial.prototype, "turbidity2", void 0);
        __decorate([
            BABYLON.serialize()
            //public rayleigh: number = 2.0;
        ], anotherSkyMaterial.prototype, "rayleigh2", void 0);
        __decorate([
            BABYLON.serialize()
            //public mieCoefficient: number = 0.005;
        ], anotherSkyMaterial.prototype, "mieCoefficient2", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "mieDirectionalG", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "distance", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "inclination", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "azimuth", void 0);
        __decorate([
            BABYLON.serializeAsVector3()
        ], anotherSkyMaterial.prototype, "sunPosition", void 0);
        __decorate([
            BABYLON.serialize()
        ], anotherSkyMaterial.prototype, "useSunPosition", void 0);
        __decorate([
            BABYLON.serializeAsTexture()
        ], anotherSkyMaterial.prototype, "mixTexture", void 0);
        return anotherSkyMaterial;
    }(BABYLON.PushMaterial));
    BABYLON.anotherSkyMaterial = anotherSkyMaterial;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.anotherSkyMaterial.js.map

BABYLON.Effect.ShadersStore['anotherSkyVertexShader'] = "precision highp float;\n\nattribute vec3 position;\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\n\nuniform mat4 world;\nuniform mat4 view;\nuniform mat4 viewProjection;\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\n\nvarying vec3 vPositionW;\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<clipPlaneVertexDeclaration>\n#include<fogVertexDeclaration>\nvoid main(void) {\ngl_Position=viewProjection*world*vec4(position,1.0);\nvec4 worldPos=world*vec4(position,1.0);\nvPositionW=vec3(worldPos);\n\n#include<clipPlaneVertex>\n\n#include<fogVertex>\n\n#ifdef VERTEXCOLOR\nvColor=color;\n#endif\n\n#ifdef POINTSIZE\ngl_PointSize=pointSize;\n#endif\n}\n";
BABYLON.Effect.ShadersStore['anotherSkyPixelShader'] = "precision highp float;\n\nvarying vec3 vPositionW;\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<clipPlaneFragmentDeclaration>\n\nuniform vec3 cameraPosition;\nuniform float luminance;\nuniform float turbidity;\nuniform float rayleigh;\nuniform float mieCoefficient;\nuniform float mieDirectionalG;\nuniform vec3 sunPosition;\nuniform float skyTime;\nuniform float turbidity2;\nuniform float rayleigh2;\nuniform float mieCoefficient2;\n\nuniform float timeScale;\nuniform float cloudScale;\nuniform float cover;\nuniform float softness;\nuniform float brightness;\nuniform float noiseOctaves;\nuniform float curlStrain;\nvec2 add=vec2(1.0,0.0);\nfloat cloudy;\n#define FLATTEN .2\n\n#include<fogFragmentDeclaration>\nuniform float time;\n\nconst float e=2.71828182845904523536028747135266249775724709369995957;\nconst float pi=3.141592653589793238462643383279502884197169;\nconst float n=1.0003;\nconst float N=2.545E25;\nconst float pn=0.035;\nconst vec3 lambda=vec3(680E-9,550E-9,450E-9);\nconst vec3 K=vec3(0.686,0.678,0.666);\nconst float v=4.0;\nconst float rayleighZenithLength=8.4E3;\nconst float mieZenithLength=1.25E3;\nconst vec3 up=vec3(0.0,1.0,0.0);\nconst float EE=1000.0;\nconst float sunAngularDiameterCos=0.999956676946448443553574619906976478926848692873900859324;\nconst float cutoffAngle=pi/1.95;\nconst float steepness=1.5;\nvec3 totalRayleigh(vec3 lambda)\n{\nreturn (8.0*pow(pi,3.0)*pow(pow(n,2.0)-1.0,2.0)*(6.0+3.0*pn))/(3.0*N*pow(lambda,vec3(4.0))*(6.0-7.0*pn));\n}\nvec3 simplifiedRayleigh()\n{\nreturn 0.0005/vec3(94,40,18);\n}\nfloat rayleighPhase(float cosTheta)\n{ \nreturn (3.0/(16.0*pi))*(1.0+pow(cosTheta,2.0));\n}\nvec3 totalMie(vec3 lambda,vec3 K,float T)\n{\nfloat c=(0.2*T )*10E-18;\nreturn 0.434*c*pi*pow((2.0*pi)/lambda,vec3(v-2.0))*K;\n}\nfloat hgPhase(float cosTheta,float g)\n{\nreturn (1.0/(4.0*pi))*((1.0-pow(g,2.0))/pow(1.0-2.0*g*cosTheta+pow(g,2.0),1.5));\n}\nfloat sunIntensity(float zenithAngleCos)\n{\nreturn EE*max(0.0,1.0-exp(-((cutoffAngle-acos(zenithAngleCos))/steepness)));\n}\nfloat A=0.15;\nfloat B=0.50;\nfloat C=0.10;\nfloat D=0.20;\nfloat EEE=0.02;\nfloat F=0.30;\nfloat W=1000.0;\nvec3 Uncharted2Tonemap(vec3 x)\n{\nreturn ((x*(A*x+C*B)+D*EEE)/(x*(A*x+B)+D*F))-EEE/F;\n}\n\nfloat saturate(float num)\n{\nreturn clamp(num,0.0,1.0);\n}\n\n#define MOD3 vec3(3.07965,7.1235,4.998784)\n#define HASHSCALE1 .1031\n\n\n\n\n\n\nfloat hash(float p)\n{\nvec3 p3=fract(vec3(p)*HASHSCALE1);\np3+=dot(p3,p3.yzx+19.19);\n\nreturn fract((p3.x+p3.y)*p3.z);\n}\nfloat Noise3d(vec3 p)\n{\nvec3 i=floor(p);\nvec3 f=fract(p); \n\n\n\nconst vec3 step=vec3(110,241,171);\nfloat n=dot(i,step);\nvec3 u=f*f*(3.0-2.0*f);\nreturn mix(mix(mix( hash(n+dot(step,vec3(0,0,0))),hash(n+dot(step,vec3(1,0,0))),u.x),\nmix( hash(n+dot(step,vec3(0,1,0))),hash(n+dot(step,vec3(1,1,0))),u.x),u.y),\nmix(mix( hash(n+dot(step,vec3(0,0,1))),hash(n+dot(step,vec3(1,0,1))),u.x),\nmix( hash(n+dot(step,vec3(0,1,1))),hash(n+dot(step,vec3(1,1,1))),u.x),u.y),u.z);\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n}\nmat4 rotationMatrix(vec3 axis,float angle) {\naxis=normalize(axis);\nfloat s=sin(angle);\nfloat c=cos(angle);\nfloat oc=1.0-c;\nreturn mat4(oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.0,\noc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.0,\noc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.0,\n0.0,0.0,0.0,1.0);\n}\nvec3 rotate(vec3 v,vec3 axis,float angle) {\nmat4 m=rotationMatrix(axis,angle);\nreturn (m*vec4(v,1.0)).xyz;\n}\nvec3 rotatepos(vec3 pos)\n{\npos=pos+Noise3d(pos*0.2)*0.005;\nfloat rot=curlStrain;\nfloat sinRot=sin(rot);\nfloat cosRot=cos(rot);\nmat3 rotMat=mat3(cosRot,0,sinRot,0,1,0,-sinRot,0,cosRot);\nreturn pos*rotMat;\n}\nfloat FBM(vec3 p,float ts,float Octaves)\n{\np*=.5;\nfloat f=0.0;\nfloat amplitude=0.5;\nfor(int i=0;i<int(Octaves);i++)\n{\nf+=amplitude*Noise3d(rotate(p,vec3(0.0,1.0,0.0),time*ts/100.0*(1.0-amplitude)));\np*=3.0;\n\namplitude*=0.5;\n}\nreturn f;\n}\nvec3 skycolor(vec3 position,float turb,float rayl,float mieCoe)\n{\nfloat sunfade=1.0-clamp(1.0-exp((position.y/450000.0)),0.0,1.0);\nfloat rayleighCoefficient=rayl-(1.0*(1.0-sunfade));\nvec3 sunDirection=normalize(position);\nfloat sunE=sunIntensity(dot(sunDirection,up));\nvec3 betaR=simplifiedRayleigh()*rayleighCoefficient;\nvec3 betaM=totalMie(lambda,K,turb)*mieCoe;\nfloat zenithAngle=acos(max(0.0,dot(up,normalize(vPositionW-cameraPosition))));\nfloat sR=rayleighZenithLength/(cos(zenithAngle)+0.15*pow(93.885-((zenithAngle*180.0)/pi),-1.253));\nfloat sM=mieZenithLength/(cos(zenithAngle)+0.15*pow(93.885-((zenithAngle*180.0)/pi),-1.253));\nvec3 Fex=exp(-(betaR*sR+betaM*sM));\nfloat cosTheta=dot(normalize(vPositionW-cameraPosition),sunDirection);\nfloat rPhase=rayleighPhase(cosTheta*0.5+0.5);\nvec3 betaRTheta=betaR*rPhase;\nfloat mPhase=hgPhase(cosTheta,mieDirectionalG);\nvec3 betaMTheta=betaM*mPhase;\nvec3 Lin=pow(sunE*((betaRTheta+betaMTheta)/(betaR+betaM))*(1.0-Fex),vec3(1.5));\nLin*=mix(vec3(1.0),pow(sunE*((betaRTheta+betaMTheta)/(betaR+betaM))*Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up,sunDirection),5.0),0.0,1.0));\nvec3 direction=normalize(vPositionW-cameraPosition);\nfloat theta=acos(direction.y);\nfloat phi=atan(direction.z,direction.x);\nvec2 uv=vec2(phi,theta)/vec2(2.0*pi,pi)+vec2(0.5,0.0);\nvec3 L0=vec3(0.1)*Fex;\nfloat sundisk=smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);\nL0+=(sunE*19000.0*Fex)*sundisk;\nvec3 whiteScale=1.0/Uncharted2Tonemap(vec3(W));\nvec3 texColor=(Lin+L0); \ntexColor*=0.04 ;\ntexColor+=vec3(0.0,0.001,0.0025)*0.3;\nfloat g_fMaxLuminance=1.0;\nfloat fLumScaled=0.1/luminance; \nfloat fLumCompressed=(fLumScaled*(1.0+(fLumScaled/(g_fMaxLuminance*g_fMaxLuminance))))/(1.0+fLumScaled); \nfloat ExposureBias=fLumCompressed;\nvec3 curr=Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);\n\n\n\nvec3 retColor=curr*whiteScale;\nreturn retColor;\n}\n\n#define HASHSCALE1 .1031\n#define HASHSCALE3 vec3(.1031,.1030,.0973)\n\n\nfloat hash11(float p)\n{\nvec3 p3=fract(vec3(p)*HASHSCALE1);\np3+=dot(p3,p3.yzx+19.19);\nreturn fract((p3.x+p3.y)*p3.z);\n}\n\n\nfloat hash12(vec2 p)\n{\nvec3 p3=fract(vec3(p.xyx)*HASHSCALE1);\np3+=dot(p3,p3.yzx+19.19);\nreturn fract((p3.x+p3.y)*p3.z);\n}\n\nvec2 hash22(vec2 p)\n{\nvec3 p3=fract(vec3(p.xyx)*HASHSCALE3);\np3+=dot(p3,p3.yzx+19.19);\nreturn fract((p3.xx+p3.yz)*p3.zy);\n}\nfloat dseg( vec2 ba,vec2 pa )\n{\nfloat h=clamp( dot(pa,ba)/dot(ba,ba),-0.2,1. ); \nreturn length( pa-ba*h );\n\n\n}\nvec3 lightning (vec2 p)\n{\nvec2 d;\nvec2 tgt=vec2(0.);\nvec3 col=vec3(0.);\nfloat mdist=10000.;\nfloat t=hash11(floor(20.*time));\ntgt=vec2(0.0);\ntgt+=4.*hash22(tgt+t)-1.5;\nfloat c=0.0;\nif(hash(t+2.3)>.6)\n{\nfor (int i=0; i<10; i++) {\nvec2 dtgt=tgt-p; \nd=.05*(vec2(-.5,-1.)+hash22(vec2(float(i),t)));\nfloat dist =dseg(d,dtgt);\nmdist=min(mdist,dist);\ntgt-=d;\nc=exp(-.5*dist)+exp(-55.*mdist);\ncol=c*vec3(.7,.8,1.);\n}\n}\nreturn col;\n}\nvoid main(void) {\n\n#include<clipPlaneFragment>\n\n\nvec3 newSunPosition=rotate(sunPosition,vec3(0.0,0.0,1.0),skyTime);\nvec3 newMoonPosition=-newSunPosition;\nvec3 retColorday=skycolor(newSunPosition,turbidity,rayleigh,mieCoefficient);\nvec3 retColornight=skycolor(newMoonPosition,turbidity2,rayleigh2,mieCoefficient2);\nvec3 retColor=retColorday+retColornight;\n\n\nfloat alpha=1.0;\n#ifdef VERTEXCOLOR\nretColor.rgb*=vColor.rgb;\n#endif\n#ifdef VERTEXALPHA\nalpha*=vColor.a;\n#endif\n\nvec4 color=clamp(vec4(retColor.rgb,alpha),0.0,1.0);\n#ifdef DIFFUSENOISE\nvec3 pos=normalize(vPositionW-cameraPosition);\n\nfloat a=0.5;\n\nfloat staramount=1./(-1.-a)*newSunPosition.y-a/(-1.-a);\nstaramount=sin(staramount*pi/2.);\nfloat starcolor=1.0;\nfloat starScale=0.002;\nfloat starCover=0.31;\nfloat startimeScale=0.01;\nvec3 starpos=pos/starScale;\nstarpos=rotate(starpos,vec3(0.0,1.0,0.0),time*startimeScale/1000.);\nfloat h1=FBM(starpos,startimeScale,4.0);\nfloat h2=h1;\nfloat stars1=smoothstep(1.0-starCover,min((1.0-starCover)+softness*2.0,1.0),h1);\nfloat stars2=smoothstep(1.0-starCover,min((1.0-starCover)+softness,1.0),h2);\nfloat starsFormComb=saturate(stars1+stars2)*staramount;\nvec4 starskyCol=vec4(0.6,0.8,1.0,1.0);\nfloat starCol=saturate(saturate(1.0-pow(h1,1.0)*0.2)*starcolor);\nvec4 stars1Color=vec4(starCol,starCol,starCol,1.0);\nvec4 stars2Color=mix(stars1Color,starskyCol,0.25);\nvec4 starColComb=mix(stars1Color,stars2Color,saturate(stars2-stars1));\ncolor=mix(color,starColComb,starsFormComb);\n\n\nfloat bright=newSunPosition.y;\nbright=max(0.0,bright);\nbright=sin(bright*pi/2.);\nvec3 cloudpos=pos/cloudScale;\n\ncloudpos=rotate(cloudpos,vec3(0.0,1.0,0.0),time*timeScale/1000.);\nfloat color1=FBM(cloudpos,timeScale,noiseOctaves);\n\nfloat color2=color1;\nfloat clouds1=smoothstep(1.0-cover,min((1.0-cover)+softness*2.0,1.0),color1);\nfloat clouds2=smoothstep(1.0-cover,min((1.0-cover)+softness,1.0),color2);\nfloat cloudsFormComb=saturate(clouds1+clouds2);\n\nvec4 skyCol=vec4(0.6,0.8,1.0,1.0);\nfloat cloudCol=saturate(saturate(1.0-pow(color1,1.0)*0.2)*bright);\nvec4 clouds1Color=vec4(cloudCol,cloudCol,cloudCol,1.0);\nvec4 clouds2Color=mix(clouds1Color,skyCol,0.25);\nvec4 cloudColComb=mix(clouds1Color,clouds2Color,saturate(clouds2-clouds1));\ncolor=mix(color,cloudColComb,cloudsFormComb);\n#endif\n\n\n\n\n\n\n\n\n#include<fogFragment>\ngl_FragColor=color;\n}";
