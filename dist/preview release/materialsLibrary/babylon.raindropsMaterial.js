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
    var RaindropsMaterialDefines = /** @class */ (function (_super) {
        __extends(RaindropsMaterialDefines, _super);
        function RaindropsMaterialDefines() {
            var _this = _super.call(this) || this;
            _this.DIFFUSE = false;
            _this.REFLECTION = false;
            _this.BUMP = false;
            _this.CLIPPLANE = false;
            _this.ALPHATEST = false;
            _this.DEPTHPREPASS = false;
            _this.ALPHAFROMDIFFUSE = false;
            _this.POINTSIZE = false;
            _this.FOG = false;
            _this.NORMAL = false;
            _this.UV1 = false;
            _this.UV2 = false;
            _this.VERTEXCOLOR = false;
            _this.VERTEXALPHA = false;
            _this.NUM_BONE_INFLUENCERS = 0;
            _this.BonesPerMesh = 0;
            _this.LOGARITHMICDEPTH = false;
            _this.rebuild();
            return _this;
        }
        return RaindropsMaterialDefines;
    }(BABYLON.MaterialDefines));
    BABYLON.RaindropsMaterialDefines = RaindropsMaterialDefines;
    var RaindropsMaterial = /** @class */ (function (_super) {
        __extends(RaindropsMaterial, _super);
        /**
        * Constructor
        */
        function RaindropsMaterial(name, scene, renderTargetSize) {
            if (renderTargetSize === void 0) { renderTargetSize = new BABYLON.Vector2(512, 512); }
            var _this = _super.call(this, name, scene) || this;
            _this.renderTargetSize = renderTargetSize;
            _this.ambientColor = new BABYLON.Color3(0, 0, 0);
            _this.diffuseColor = new BABYLON.Color3(1, 1, 1);
            _this.specularColor = new BABYLON.Color3(1, 1, 1);
            _this.specularPower = 64;
            _this._disableLighting = false;
            _this._maxSimultaneousLights = 4;
            //  @serialize("roughness")
            //  private _roughness = 0;
            //  @expandToProperty("_markAllSubMeshesAsTexturesDirty")
            //  public roughness: number;            
            _this._renderTargets = new BABYLON.SmartArray(16);
            _this._globalAmbientColor = new BABYLON.Color3(0, 0, 0);
            /*
            * Public raindrop property members
            */
            _this.raindropPuddleAmount = 2.0;
            _this.raindropSpeed = 25.0;
            /*
            * Private members
            */
            _this._mesh = null;
            _this._reflectionTransform = BABYLON.Matrix.Zero();
            _this._lastTime = 0;
            _this._lastDeltaTime = 0;
            _this._createRenderTargets(scene, renderTargetSize);
            _this.getRenderTargetTextures = function () {
                _this._renderTargets.reset();
                _this._renderTargets.push(_this._reflectionRTT);
                return _this._renderTargets;
            };
            return _this;
        }
        RaindropsMaterial.prototype.getClassName = function () {
            return "RaindropsMaterial";
        };
        Object.defineProperty(RaindropsMaterial.prototype, "useLogarithmicDepth", {
            get: function () {
                return this._useLogarithmicDepth;
            },
            set: function (value) {
                this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
                this._markAllSubMeshesAsMiscDirty();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RaindropsMaterial.prototype, "reflectionTexture", {
            // Get / Set
            get: function () {
                return this._reflectionRTT;
            },
            enumerable: true,
            configurable: true
        });
        // Methods
        RaindropsMaterial.prototype.addToRenderList = function (node) {
            if (this._reflectionRTT.renderList) {
                this._reflectionRTT.renderList.push(node);
            }
        };
        RaindropsMaterial.prototype.enableRenderTargets = function (enable) {
            var refreshRate = enable ? 1 : 0;
            this._reflectionRTT.refreshRate = refreshRate;
        };
        RaindropsMaterial.prototype.getRenderList = function () {
            return this._reflectionRTT.renderList;
        };
        Object.defineProperty(RaindropsMaterial.prototype, "renderTargetsEnabled", {
            get: function () {
                return !(this._reflectionRTT.refreshRate === 0);
            },
            enumerable: true,
            configurable: true
        });
        RaindropsMaterial.prototype.needAlphaBlending = function () {
            return (this.alpha < 1.0);
        };
        RaindropsMaterial.prototype.needAlphaTesting = function () {
            return this._diffuseTexture != null && this._diffuseTexture.hasAlpha;
        };
        //  protected _shouldUseAlphaFromDiffuseTexture(): boolean {
        //      return this._diffuseTexture != null && this._diffuseTexture.hasAlpha && this._useAlphaFromDiffuseTexture;
        //  }
        RaindropsMaterial.prototype.getAlphaTestTexture = function () {
            return this._diffuseTexture;
        };
        /**
         * Child classes can use it to update shaders
         */
        RaindropsMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
            if (useInstances === void 0) { useInstances = false; }
            if (this.isFrozen) {
                if (this._wasPreviouslyReady && subMesh.effect) {
                    return true;
                }
            }
            if (!subMesh._materialDefines) {
                subMesh._materialDefines = new RaindropsMaterialDefines();
            }
            var scene = this.getScene();
            var defines = subMesh._materialDefines;
            if (!this.checkReadyOnEveryCall && subMesh.effect) {
                if (this._renderId === scene.getRenderId()) {
                    return true;
                }
            }
            var engine = scene.getEngine();
            // Lights
            defines._needNormals = BABYLON.MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
            // Textures
            if (defines._areTexturesDirty) {
                defines._needUVs = false;
                if (scene.texturesEnabled) {
                    if (this._diffuseTexture && BABYLON.StandardMaterial.DiffuseTextureEnabled) {
                        if (!this._diffuseTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                        else {
                            BABYLON.MaterialHelper.PrepareDefinesForMergedUV(this._diffuseTexture, defines, "DIFFUSE");
                            defines._needUVs = true;
                            defines.DIFFUSE = true;
                        }
                    }
                    else {
                        defines.DIFFUSE = false;
                    }
                    if (this._raindropTexture) {
                        if (!this._raindropTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                        else {
                            BABYLON.MaterialHelper.PrepareDefinesForMergedUV(this._raindropTexture, defines, "RAINDROP");
                            defines._needUVs = true;
                        }
                    }
                    if (this._raindropGroundHeightTexture) {
                        if (!this._raindropGroundHeightTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                        else {
                            BABYLON.MaterialHelper.PrepareDefinesForMergedUV(this._raindropGroundHeightTexture, defines, "RAINDROPHEIGHT");
                            defines._needUVs = true;
                        }
                    }
                    if (this._raindropGroundNormalTexture) {
                        if (!this._raindropGroundNormalTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                        else {
                            BABYLON.MaterialHelper.PrepareDefinesForMergedUV(this._raindropGroundNormalTexture, defines, "RAINDROPNORMAL");
                            defines._needUVs = true;
                        }
                    }
                    if (this._raindropWaterNormalTexture) {
                        if (!this._raindropWaterNormalTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                        else {
                            BABYLON.MaterialHelper.PrepareDefinesForMergedUV(this._raindropWaterNormalTexture, defines, "RAINDROPWATER");
                            defines._needUVs = true;
                        }
                    }
                    if (BABYLON.StandardMaterial.ReflectionTextureEnabled) {
                        defines.REFLECTION = true;
                    }
                }
                else {
                    defines.DIFFUSE = false;
                    defines.REFLECTION = false;
                    //  defines.EMISSIVE = false;
                    //  defines.LIGHTMAP = false;
                    //  defines.BUMP = false;
                    //  defines.REFRACTION = false;
                }
            }
            // Misc.
            BABYLON.MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, defines);
            // Attribs
            BABYLON.MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true);
            // Values that need to be evaluated on every frame
            BABYLON.MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances);
            this._mesh = mesh;
            // Get correct effect      
            if (defines.isDirty) {
                defines.markAsProcessed();
                scene.resetCachedMaterial();
                // Fallbacks
                var fallbacks = new BABYLON.EffectFallbacks();
                //  if (defines.REFLECTION) {
                //      fallbacks.addFallback(0, "REFLECTION");
                //  }
                //  if (defines.SPECULAR) {
                //      fallbacks.addFallback(0, "SPECULAR");
                //  }
                //  if (defines.BUMP) {
                //      fallbacks.addFallback(0, "BUMP");
                //  }
                if (defines.FOG) {
                    fallbacks.addFallback(1, "FOG");
                }
                if (defines.POINTSIZE) {
                    fallbacks.addFallback(0, "POINTSIZE");
                }
                if (defines.LOGARITHMICDEPTH) {
                    fallbacks.addFallback(0, "LOGARITHMICDEPTH");
                }
                BABYLON.MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights);
                //  if (defines.SPECULARTERM) {
                //      fallbacks.addFallback(0, "SPECULARTERM");
                //  }
                //Attributes
                var attribs = [BABYLON.VertexBuffer.PositionKind];
                if (defines.NORMAL) {
                    attribs.push(BABYLON.VertexBuffer.NormalKind);
                }
                if (defines.UV1) {
                    attribs.push(BABYLON.VertexBuffer.UVKind);
                }
                if (defines.UV2) {
                    attribs.push(BABYLON.VertexBuffer.UV2Kind);
                }
                if (defines.VERTEXCOLOR) {
                    attribs.push(BABYLON.VertexBuffer.ColorKind);
                }
                BABYLON.MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
                BABYLON.MaterialHelper.PrepareAttributesForInstances(attribs, defines);
                var shaderName = "raindrops";
                var uniforms = ["world", "view", "viewProjection", "vEyePosition", "vLightsType", "vAmbientColor", "vDiffuseColor", "vSpecularColor",
                    "vFogInfos", "vFogColor", "pointSize",
                    "vDiffuseInfos",
                    "mBones",
                    "vClipPlane",
                    "raindropMatrix", "diffuseMatrix", "groundHeightMatrix", "groundNormalMatrix", "waterNormalMatrix",
                    "logarithmicDepthConstant",
                    // Raindrop
                    "worldReflectionViewProjection", "raindropPuddleAmount", "raindropSpeed", "time"
                ];
                var samplers = ["diffuseSampler", "raindropSampler", "reflectionSampler", "groundHeightSampler", "groundNormalSampler", "waterNormalSampler"];
                // var uniformBuffers = ["Material", "Scene"];
                var uniformBuffers = new Array();
                BABYLON.MaterialHelper.PrepareUniformsAndSamplersList({
                    uniformsNames: uniforms,
                    uniformBuffersNames: uniformBuffers,
                    samplers: samplers,
                    defines: defines,
                    maxSimultaneousLights: this._maxSimultaneousLights
                });
                var join = defines.toString();
                subMesh.setEffect(scene.getEngine().createEffect(shaderName, {
                    attributes: attribs,
                    uniformsNames: uniforms,
                    uniformBuffersNames: uniformBuffers,
                    samplers: samplers,
                    defines: join,
                    fallbacks: fallbacks,
                    onCompiled: this.onCompiled,
                    onError: this.onError,
                    indexParameters: { maxSimultaneousLights: this._maxSimultaneousLights }
                }, engine), defines);
            }
            if (!subMesh.effect || !subMesh.effect.isReady()) {
                return false;
            }
            this._renderId = scene.getRenderId();
            this._wasPreviouslyReady = true;
            return true;
        };
        RaindropsMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
            var scene = this.getScene();
            var defines = subMesh._materialDefines;
            if (!defines) {
                return;
            }
            var effect = subMesh.effect;
            if (!effect || !this._mesh) {
                return;
            }
            this._activeEffect = effect;
            // Matrices        
            this.bindOnlyWorldMatrix(world);
            this._activeEffect.setMatrix("viewProjection", scene.getTransformMatrix());
            //let mustRebind = this._mustRebind(scene, effect, mesh.visibility);
            var mustRebind = this._mustRebind(scene, effect);
            // Bones
            BABYLON.MaterialHelper.BindBonesParameters(mesh, this._activeEffect);
            if (mustRebind) {
                // Textures        
                if (this.diffuseTexture && BABYLON.StandardMaterial.DiffuseTextureEnabled) {
                    effect.setTexture("diffuseSampler", this.diffuseTexture);
                    effect.setFloat2("vDiffuseInfos", this.diffuseTexture.coordinatesIndex, this.diffuseTexture.level);
                    effect.setMatrix("diffuseMatrix", this.diffuseTexture.getTextureMatrix());
                }
                if (this.raindropTexture) {
                    effect.setTexture("raindropSampler", this.raindropTexture);
                    effect.setMatrix("raindropMatrix", this.raindropTexture.getTextureMatrix());
                }
                if (this.raindropGroundHeightTexture) {
                    effect.setTexture("groundHeightSampler", this.raindropGroundHeightTexture);
                    effect.setMatrix("groundHeightMatrix", this.raindropGroundHeightTexture.getTextureMatrix());
                }
                if (this.raindropGroundNormalTexture) {
                    effect.setTexture("groundNormalSampler", this.raindropGroundNormalTexture);
                    effect.setMatrix("groundNormalMatrix", this.raindropGroundNormalTexture.getTextureMatrix());
                }
                if (this.raindropWaterNormalTexture) {
                    effect.setTexture("waterNormalSampler", this.raindropWaterNormalTexture);
                    effect.setMatrix("waterNormalMatrix", this.raindropWaterNormalTexture.getTextureMatrix());
                }
                // Clip plane
                BABYLON.MaterialHelper.BindClipPlane(effect, scene);
                // Point size
                if (this.pointsCloud) {
                    effect.setFloat("pointSize", this.pointSize);
                }
                // Colors
                scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
                BABYLON.MaterialHelper.BindEyePosition(effect, scene);
                effect.setColor3("vAmbientColor", this._globalAmbientColor);
                effect.setColor4("vDiffuseColor", this.diffuseColor, this.alpha * mesh.visibility);
                effect.setColor4("vSpecularColor", this.specularColor, this.specularPower);
            }
            if (mustRebind || !this.isFrozen) {
                // Lights
                if (scene.lightsEnabled && !this._disableLighting) {
                    BABYLON.MaterialHelper.BindLights(scene, mesh, effect, defines, this._maxSimultaneousLights);
                }
                // View
                if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
                    //this.bindView(effect);
                    effect.setMatrix("view", scene.getViewMatrix());
                }
                // Fog
                BABYLON.MaterialHelper.BindFogParameters(scene, mesh, effect);
                // Log. depth
                BABYLON.MaterialHelper.BindLogDepth(defines, effect, scene);
            }
            // Raindrop reflection
            if (BABYLON.StandardMaterial.ReflectionTextureEnabled) {
                effect.setTexture("reflectionSampler", this._reflectionRTT);
            }
            var wrvp = this._mesh.getWorldMatrix().multiply(this._reflectionTransform).multiply(scene.getProjectionMatrix());
            //Add delta time. Prevent adding delta time if it hasn't changed.
            var deltaTime = scene.getEngine().getDeltaTime();
            if (deltaTime !== this._lastDeltaTime) {
                this._lastDeltaTime = deltaTime;
                this._lastTime += this._lastDeltaTime;
            }
            effect.setMatrix("worldReflectionViewProjection", wrvp);
            effect.setFloat("time", this._lastTime / 100000);
            effect.setFloat("raindropPuddleAmount", this.raindropPuddleAmount);
            effect.setFloat("raindropSpeed", this.raindropSpeed);
            this._afterBind(mesh, this._activeEffect);
        };
        RaindropsMaterial.prototype._createRenderTargets = function (scene, renderTargetSize) {
            var _this = this;
            // Render targets
            this._reflectionRTT = new BABYLON.RenderTargetTexture(name + "_reflection", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
            this._reflectionRTT.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
            this._reflectionRTT.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;
            this._reflectionRTT.ignoreCameraViewport = true;
            var isVisible;
            var clipPlane = null;
            var savedViewMatrix;
            var mirrorMatrix = BABYLON.Matrix.Zero();
            this._reflectionRTT.onBeforeRender = function () {
                if (_this._mesh) {
                    isVisible = _this._mesh.isVisible;
                    _this._mesh.isVisible = false;
                }
                // Clip plane
                clipPlane = scene.clipPlane;
                var positiony = _this._mesh ? _this._mesh.position.y : 0.0;
                scene.clipPlane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, positiony - 0.05, 0), new BABYLON.Vector3(0, -1, 0));
                // Transform
                BABYLON.Matrix.ReflectionToRef(scene.clipPlane, mirrorMatrix);
                savedViewMatrix = scene.getViewMatrix();
                mirrorMatrix.multiplyToRef(savedViewMatrix, _this._reflectionTransform);
                scene.setTransformMatrix(_this._reflectionTransform, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = false;
                scene._mirroredCameraPosition = BABYLON.Vector3.TransformCoordinates(scene.activeCamera.position, mirrorMatrix);
            };
            this._reflectionRTT.onAfterRender = function () {
                if (_this._mesh) {
                    _this._mesh.isVisible = isVisible;
                }
                // Clip plane
                scene.clipPlane = clipPlane;
                // Transform
                scene.setTransformMatrix(savedViewMatrix, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = true;
                scene._mirroredCameraPosition = null;
            };
        };
        RaindropsMaterial.prototype.getAnimatables = function () {
            var results = [];
            if (this._diffuseTexture && this._diffuseTexture.animations && this._diffuseTexture.animations.length > 0) {
                results.push(this._diffuseTexture);
            }
            if (this._raindropTexture && this._raindropTexture.animations && this._raindropTexture.animations.length > 0) {
                results.push(this._raindropTexture);
            }
            if (this._raindropGroundHeightTexture && this._raindropGroundHeightTexture.animations && this._raindropGroundHeightTexture.animations.length > 0) {
                results.push(this._raindropGroundHeightTexture);
            }
            if (this._raindropGroundNormalTexture && this._raindropGroundNormalTexture.animations && this._raindropGroundNormalTexture.animations.length > 0) {
                results.push(this._raindropGroundNormalTexture);
            }
            if (this._raindropWaterNormalTexture && this._raindropWaterNormalTexture.animations && this._raindropWaterNormalTexture.animations.length > 0) {
                results.push(this._raindropWaterNormalTexture);
            }
            if (this._reflectionRTT && this._reflectionRTT.animations && this._reflectionRTT.animations.length > 0) {
                results.push(this._reflectionRTT);
            }
            return results;
        };
        RaindropsMaterial.prototype.getActiveTextures = function () {
            var activeTextures = _super.prototype.getActiveTextures.call(this);
            if (this._diffuseTexture) {
                activeTextures.push(this._diffuseTexture);
            }
            if (this._raindropTexture) {
                activeTextures.push(this._raindropTexture);
            }
            if (this._raindropGroundHeightTexture) {
                activeTextures.push(this._raindropGroundHeightTexture);
            }
            if (this._raindropGroundNormalTexture) {
                activeTextures.push(this._raindropGroundNormalTexture);
            }
            if (this._raindropWaterNormalTexture) {
                activeTextures.push(this._raindropWaterNormalTexture);
            }
            return activeTextures;
        };
        RaindropsMaterial.prototype.hasTexture = function (texture) {
            if (_super.prototype.hasTexture.call(this, texture)) {
                return true;
            }
            if (this._diffuseTexture === texture) {
                return true;
            }
            if (this._raindropTexture === texture) {
                return true;
            }
            if (this._raindropGroundHeightTexture === texture) {
                return true;
            }
            if (this._raindropGroundNormalTexture === texture) {
                return true;
            }
            if (this._raindropWaterNormalTexture === texture) {
                return true;
            }
            return false;
        };
        RaindropsMaterial.prototype.dispose = function (forceDisposeEffect) {
            if (this._diffuseTexture) {
                this._diffuseTexture.dispose();
            }
            if (this._raindropTexture) {
                this._raindropTexture.dispose();
            }
            if (this._raindropGroundHeightTexture) {
                this._raindropGroundHeightTexture.dispose();
            }
            if (this._raindropGroundNormalTexture) {
                this._raindropGroundNormalTexture.dispose();
            }
            if (this._raindropWaterNormalTexture) {
                this._raindropWaterNormalTexture.dispose();
            }
            var index = this.getScene().customRenderTargets.indexOf(this._reflectionRTT);
            if (index != -1) {
                this.getScene().customRenderTargets.splice(index, 1);
            }
            if (this._reflectionRTT) {
                this._reflectionRTT.dispose();
            }
            _super.prototype.dispose.call(this, forceDisposeEffect);
        };
        RaindropsMaterial.prototype.clone = function (name) {
            var _this = this;
            return BABYLON.SerializationHelper.Clone(function () { return new RaindropsMaterial(name, _this.getScene()); }, this);
        };
        RaindropsMaterial.prototype.serialize = function () {
            var serializationObject = BABYLON.SerializationHelper.Serialize(this);
            serializationObject.customType = "BABYLON.RaindropMaterial";
            serializationObject.reflectionTexture.isRenderTarget = true;
            return serializationObject;
        };
        // Statics
        RaindropsMaterial.Parse = function (source, scene, rootUrl) {
            return BABYLON.SerializationHelper.Parse(function () { return new RaindropsMaterial(source.name, scene); }, source, scene, rootUrl);
        };
        __decorate([
            BABYLON.serializeAsTexture("diffuseTexture")
        ], RaindropsMaterial.prototype, "_diffuseTexture", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsTexturesDirty")
        ], RaindropsMaterial.prototype, "diffuseTexture", void 0);
        __decorate([
            BABYLON.serializeAsTexture("raindropTexture")
        ], RaindropsMaterial.prototype, "_raindropTexture", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsTexturesDirty")
        ], RaindropsMaterial.prototype, "raindropTexture", void 0);
        __decorate([
            BABYLON.serializeAsTexture("raindropGoundHeightTexture")
        ], RaindropsMaterial.prototype, "_raindropGroundHeightTexture", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsTexturesDirty")
        ], RaindropsMaterial.prototype, "raindropGroundHeightTexture", void 0);
        __decorate([
            BABYLON.serializeAsTexture("raindropGoundNormalTexture")
        ], RaindropsMaterial.prototype, "_raindropGroundNormalTexture", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsTexturesDirty")
        ], RaindropsMaterial.prototype, "raindropGroundNormalTexture", void 0);
        __decorate([
            BABYLON.serializeAsTexture("raindropWaterNormalTexture")
        ], RaindropsMaterial.prototype, "_raindropWaterNormalTexture", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsTexturesDirty")
        ], RaindropsMaterial.prototype, "raindropWaterNormalTexture", void 0);
        __decorate([
            BABYLON.serializeAsColor3("ambient")
        ], RaindropsMaterial.prototype, "ambientColor", void 0);
        __decorate([
            BABYLON.serializeAsColor3("diffuse")
        ], RaindropsMaterial.prototype, "diffuseColor", void 0);
        __decorate([
            BABYLON.serializeAsColor3("specular")
        ], RaindropsMaterial.prototype, "specularColor", void 0);
        __decorate([
            BABYLON.serialize()
        ], RaindropsMaterial.prototype, "specularPower", void 0);
        __decorate([
            BABYLON.serialize("disableLighting")
        ], RaindropsMaterial.prototype, "_disableLighting", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsLightsDirty")
        ], RaindropsMaterial.prototype, "disableLighting", void 0);
        __decorate([
            BABYLON.serialize("maxSimultaneousLights")
        ], RaindropsMaterial.prototype, "_maxSimultaneousLights", void 0);
        __decorate([
            BABYLON.expandToProperty("_markAllSubMeshesAsLightsDirty")
        ], RaindropsMaterial.prototype, "maxSimultaneousLights", void 0);
        __decorate([
            BABYLON.serialize()
        ], RaindropsMaterial.prototype, "useLogarithmicDepth", null);
        return RaindropsMaterial;
    }(BABYLON.PushMaterial));
    BABYLON.RaindropsMaterial = RaindropsMaterial;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.raindropsMaterial.js.map

BABYLON.Effect.ShadersStore['raindropsVertexShader'] = "precision highp float;\n\nattribute vec3 position;\n#ifdef NORMAL\nattribute vec3 normal;\n#endif\n#ifdef UV1\nattribute vec2 uv;\n#endif\n#ifdef UV2\nattribute vec2 uv2;\n#endif\n#ifdef VERTEXCOLOR\nattribute vec4 color;\n#endif\nuniform mat4 worldReflectionViewProjection;\nuniform mat4 viewProjection;\n#include<helperFunctions>\n#include<bonesDeclaration>\n\n#include<instancesDeclaration>\n\n\n\n\n\n\n#if defined(DIFFUSE)\nvarying vec2 vDiffuseUV;\n#endif\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n#if defined(BUMP)\nvarying vec2 vBumpUV;\n#endif\n\nvarying vec3 vPositionW;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n#include<bumpVertexDeclaration>\n#include<clipPlaneVertexDeclaration>\n#include<fogVertexDeclaration>\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n\n\n\n\n\n\n\n\nuniform float time;\nuniform mat4 raindropMatrix;\nvarying vec2 vRaindropUV;\nuniform mat4 groundHeightMatrix;\nvarying vec2 vRaindropGroundHeightUV;\nuniform mat4 groundNormalMatrix;\nvarying vec2 vRaindropGroundNormalUV;\nuniform mat4 waterNormalMatrix;\nvarying vec2 vRaindropWaterNormalUV;\n#ifdef DIFFUSE\nuniform mat4 diffuseMatrix;\nuniform vec2 vDiffuseInfos;\n#endif\n#ifdef REFLECTION\n\nvarying vec3 vPosition;\nvarying vec3 vReflectionMapTexCoord;\n#endif\n#include<logDepthDeclaration>\nvoid main(void) {\n\n\n\n\n\n\n\n\n\n\n\n#include<instancesVertex>\n#include<bonesVertex>\ngl_Position=viewProjection*finalWorld*vec4(position,1.0);\nvec4 worldPos=finalWorld*vec4(position,1.0);\nvPositionW=vec3(worldPos);\n#ifdef NORMAL\nvNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));\n#endif\n\n\n\n\n#ifndef UV1\nvec2 uv=vec2(0.,0.);\n#endif\n#ifndef UV2\nvec2 uv2=vec2(0.,0.);\n#endif\n\n\n\n\n\n\n#if defined(DIFFUSE)\nif (vDiffuseInfos.x == 0.)\n{\nvDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#if defined(BUMP)\nif (vBumpInfos.x == 0.)\n{\nvBumpUV=vec2(bumpMatrix*vec4(uv,1.0,0.0));\n}\nelse\n{\nvBumpUV=vec2(bumpMatrix*vec4(uv2,1.0,0.0));\n}\n#endif\nvRaindropUV=vec2(raindropMatrix*vec4(uv,1.0,0.0));\nvRaindropGroundHeightUV=vec2(groundHeightMatrix*vec4(uv,1.0,0.0));\nvRaindropGroundNormalUV=vec2(groundNormalMatrix*vec4(uv,1.0,0.0));\nfloat raindropWaterNormalUVScale=12.0;\nvRaindropWaterNormalUV=vec2(waterNormalMatrix*vec4((uv*raindropWaterNormalUVScale)+time*vec2(10.0,10.0),1.0,0.0));\n#include<bumpVertex>\n#include<clipPlaneVertex>\n#include<fogVertex>\n#include<shadowsVertex>[0..maxSimultaneousLights]\n#ifdef VERTEXCOLOR\n\nvColor=color;\n#endif\n#include<pointCloudVertex>\n#ifdef REFLECTION\n\nvPosition=position;\nworldPos=worldReflectionViewProjection*vec4(position,1.0);\nvReflectionMapTexCoord.x=0.5*(worldPos.w+worldPos.x);\nvReflectionMapTexCoord.y=0.5*(worldPos.w+worldPos.y);\nvReflectionMapTexCoord.z=worldPos.w;\n#endif\n#include<logDepthVertex>\n}";
BABYLON.Effect.ShadersStore['raindropsPixelShader'] = "#ifdef LOGARITHMICDEPTH\n#extension GL_EXT_frag_depth : enable\n#endif\nprecision highp float;\nuniform vec3 vEyePosition;\nuniform vec3 vAmbientColor;\nuniform vec4 vDiffuseColor;\nuniform vec4 vSpecularColor;\n\nvarying vec3 vPositionW;\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#endif\n#ifdef VERTEXCOLOR\nvarying vec4 vColor;\n#endif\n\n#include<helperFunctions>\n\n#include<__decl__lightFragment>[0..maxSimultaneousLights]\n#include<lightsFragmentFunctions>\n#include<shadowsFragmentFunctions>\n\n#ifdef DIFFUSE\nvarying vec2 vDiffuseUV;\nuniform sampler2D diffuseSampler;\nuniform mat4 diffuseMatrix;\nuniform vec2 vDiffuseInfos;\n#endif\n\n#ifdef REFLECTION\nuniform sampler2D reflectionSampler;\nvarying vec3 vReflectionMapTexCoord;\nvarying vec3 vPosition;\n#endif\n#include<bumpFragmentFunctions>\n#include<clipPlaneFragmentDeclaration>\n#include<logDepthDeclaration>\n#include<fogFragmentDeclaration>\nuniform sampler2D raindropSampler;\nvarying vec2 vRaindropUV;\nuniform sampler2D groundHeightSampler;\nvarying vec2 vRaindropGroundHeightUV;\nuniform sampler2D groundNormalSampler;\nvarying vec2 vRaindropGroundNormalUV;\nuniform sampler2D waterNormalSampler;\nvarying vec2 vRaindropWaterNormalUV;\nuniform float time;\nuniform float raindropPuddleAmount;\nuniform float raindropSpeed;\n\nvec4 flipBookEffect(float inputAnimationPhase,float rows,float columns,vec2 uv){\nfloat fractPart=fract(inputAnimationPhase);\nvec2 fractPartVec2=vec2(fractPart,fractPart);\nvec2 tmpVec2=vec2(columns,rows);\nvec2 tmp2Vec2=vec2(columns*rows,rows);\nvec2 fractResultVec2=tmp2Vec2*fractPartVec2;\nfractResultVec2=floor(fractResultVec2);\n\nvec2 resultUV=(uv/tmpVec2)+(fractResultVec2/tmpVec2);\n\nresultUV.y=1.0-resultUV.y;\nreturn texture2D(raindropSampler,resultUV);\n}\n\n\n\n\n\n\n\n\nvoid main(void) {\n#include<clipPlaneFragment>\nvec3 viewDirectionW=normalize(vEyePosition-vPositionW);\n\nvec4 baseColor=vec4(1.,1.,1.,1.);\nvec3 diffuseColor=vDiffuseColor.rgb;\n\nfloat alpha=vDiffuseColor.a;\n\n\n\n\nfloat raindropsTimeScale=raindropSpeed;\n\n\n\nfloat raindropsUVScale=2.0;\nvec2 inputUV=vec2(1.0-vRaindropUV.x,vRaindropUV.y);\n\n\nvec4 raindropsNormal=flipBookEffect(raindropsTimeScale*time,8.0,8.0,fract(raindropsUVScale*inputUV));\n\nfloat raindropsNormalIntensity=5.0;\nraindropsNormal.x*=raindropsNormalIntensity;\nraindropsNormal.y*=raindropsNormalIntensity;\n\n\n\n\nbaseColor=raindropsNormal;\n\n\nfloat puddleNoiseScale=0.02;\n\nfloat noiseValue=texture2D(groundHeightSampler,puddleNoiseScale*(vRaindropGroundHeightUV)).r;\n\n\n\n\nfloat puddleAmount=raindropPuddleAmount;\nfloat noiseResult=pow(noiseValue*puddleAmount,20.0);\n\nnoiseResult=noiseResult*texture2D(groundHeightSampler,(vRaindropGroundHeightUV)).r;\nnoiseResult=clamp(noiseResult,0.0,1.0);\n\nvec3 groundNormalCol=texture2D(groundNormalSampler,vRaindropGroundNormalUV).rgb;\nvec3 normalW=normalize(vNormalW);\n\nnormalW.r=mix(normalW.r,groundNormalCol.r,noiseResult);\nnormalW.g=mix(normalW.g,groundNormalCol.g,noiseResult);\nnormalW.b=mix(normalW.b,groundNormalCol.b,noiseResult);\n\nnormalW=normalize(normalW);\n\nvec3 waterNormalCol=texture2D(waterNormalSampler,vRaindropWaterNormalUV).rgb;\nwaterNormalCol=normalize(waterNormalCol);\nnormalW=normalW+waterNormalCol;\nnormalW=normalize(normalW);\n\n\nnormalW=normalW+normalize(raindropsNormal.rgb);\n\nnormalW=normalize(normalW);\n#ifdef VERTEXCOLOR\nbaseColor.rgb*=vColor.rgb;\n#endif\n\nfloat bumpHeight=1.2;\n#ifdef NORMAL\n\nvec2 perturbation=bumpHeight*(normalW.rg-0.5);\n\n#else\nvec2 perturbation=bumpHeight*(vec2(1.0,1.0)-0.5);\nnormalW=normalize(-cross(dFdx(vPositionW),dFdy(vPositionW)));\n#endif\n#include<bumpFragment>\n\n\n#ifdef DIFFUSE\n\nbaseColor=texture2D(diffuseSampler,vDiffuseUV);\n#ifdef ALPHATEST\nif (baseColor.a<0.4)\ndiscard;\n#endif\n#ifdef ALPHAFROMDIFFUSE\nalpha*=baseColor.a;\n#endif\nbaseColor.rgb*=vDiffuseInfos.y;\n#endif\n\nvec3 refractionColor=vec3(0.,0.,0.);\n\n\n\nvec3 reflectionColor=vec3(0.,0.,0.);\n#ifdef REFLECTION\nfloat colorBlendFactor=0.8;\n\nvec3 eyeVector=normalize(vEyePosition-vPosition);\nvec4 waterColor=vec4(0.28,0.28,0.28,1.0);\nvec4 refractiveColor=vec4(0.0,0.0,0.0,1.0);\n\n\nvec2 projectedReflectionTexCoords=clamp(vReflectionMapTexCoord.xy/vReflectionMapTexCoord.z+perturbation,0.0,1.0);\nvec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);\n\n\n\n\n\n#endif\n#include<depthPrePass>\n#ifdef VERTEXCOLOR\nbaseColor.rgb*=vColor.rgb;\n#endif\n\n#ifdef SPECULARTERM\nfloat glossiness=vSpecularColor.a;\nvec3 specularColor=vSpecularColor.rgb;\n#ifdef SPECULAR\nvec4 specularMapColor=texture2D(specularSampler,vSpecularUV+uvOffset);\nspecularColor=specularMapColor.rgb;\n#ifdef GLOSSINESS\nglossiness=glossiness*specularMapColor.a;\n#endif\n#endif\n#else\nfloat glossiness=0.;\n#endif\n\nvec3 diffuseBase=vec3(0.,0.,0.);\nlightingInfo info;\n#ifdef SPECULARTERM\nvec3 specularBase=vec3(0.,0.,0.);\n#endif\nfloat shadow=1.;\n#include<lightFragment>[0..maxSimultaneousLights]\n#ifdef VERTEXALPHA\nalpha*=vColor.a;\n#endif\n\nvec3 finalDiffuse=clamp(diffuseBase*diffuseColor+vAmbientColor,0.0,1.0)*baseColor.rgb;\n\n#ifdef SPECULARTERM\nvec3 finalSpecular=specularBase*specularColor;\n#ifdef SPECULAROVERALPHA\nalpha=clamp(alpha+dot(finalSpecular,vec3(0.3,0.59,0.11)),0.,1.);\n#endif\n#else\nvec3 finalSpecular=vec3(0.0);\n#endif\n\n\nvec4 color=vec4(finalDiffuse+finalSpecular+(1.0-noiseResult)*colorBlendFactor*waterColor.rgb*reflectiveColor.rgb,alpha);\n\n#include<logDepthFragment>\n#include<fogFragment>\ngl_FragColor=color;\n\n\n}";
