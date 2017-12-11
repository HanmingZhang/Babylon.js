﻿/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    class snowMaterialDefines extends MaterialDefines {
        public DIFFUSEX = false;
        public DIFFUSEY = false;
        public DIFFUSEZ = false;
        public DIFFUSENOISE = false;
        public DIFFUSE = false;

        public PUSHUP = false;
        
        public BUMPX = false;
        public BUMPY = false;
        public BUMPZ = false;
        public BUMP = false;
        
        public CLIPPLANE = false;
        public ALPHATEST = true;
        public DEPTHPREPASS = false;
        public POINTSIZE = false;
        public FOG = false;
        public SPECULARTERM = true;
        public NORMAL = false;
        public VERTEXCOLOR = false;
        public VERTEXALPHA = false;
        public NUM_BONE_INFLUENCERS = 0;
        public BonesPerMesh = 0;
        public INSTANCES = false;

        public UV1 = false;
        

        constructor() {
            super();
            this.rebuild();
        }
    }

    export class snowMaterial extends PushMaterial {
        public lastTime: number = 0;
        public noiseStrength: number = 1;
        public pushup: number = 1;

        public snowlimit: number = 6.0;
        public delay: number = 0.0;
        public speed: number = 1.0;

        @serializeAsTexture()
        public mixTexture: BaseTexture;
        //mixTexture.hasAlpha = true;

        @serializeAsTexture("diffuseTexture")
        private _diffuseTexture: Nullable<BaseTexture>;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public diffuseTexture: Nullable<BaseTexture>;   
        
        @serializeAsTexture("diffuseTextureX")
        private _diffuseTextureX: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public diffuseTextureX: BaseTexture;
        
        @serializeAsTexture("diffuseTexturY")
        private _diffuseTextureY: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public diffuseTextureY: BaseTexture;        
        
        @serializeAsTexture("diffuseTextureZ")
        private _diffuseTextureZ: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public diffuseTextureZ: BaseTexture;   
        
        @serializeAsTexture("normalTexture")
        private _normalTexture: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public normalTexture: BaseTexture;  
        
        @serializeAsTexture("normalTextureX")
        private _normalTextureX: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public normalTextureX: BaseTexture;        
        
        @serializeAsTexture("normalTextureY")
        private _normalTextureY: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public normalTextureY: BaseTexture;        
        
        @serializeAsTexture("normalTextureZ")
        private _normalTextureZ: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public normalTextureZ: BaseTexture;
        
        @serializeAsTexture("perlinNoiseTexture")
        private _perlinNoiseTexture: BaseTexture;
        @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        public perlinNoiseTexture: BaseTexture;  
               
        @serialize()
        public tileSize: number = 1;

        @serialize()
        public noiseSize: number = 25;
        
        @serializeAsColor3()
        public diffuseColor = new Color3(1, 1, 1);
        
        @serializeAsColor3()
        public specularColor = new Color3(0.2, 0.2, 0.2);
        
        @serialize()
        public specularPower = 16;
        
        @serialize("disableLighting")
        private _disableLighting = false;
        @expandToProperty("_markAllSubMeshesAsLightsDirty")
        public disableLighting: boolean;   
        
        @serialize("maxSimultaneousLights")
        private _maxSimultaneousLights = 4;
        @expandToProperty("_markAllSubMeshesAsLightsDirty")
        public maxSimultaneousLights: number; 
        
        private _renderId: number;

        constructor(name: string, scene: Scene) {
            super(name, scene);
        }

        public needAlphaBlending(): boolean {
            return (this.alpha < 1.0);
        }

        public needAlphaTesting(): boolean {
            return false;
        }

        public getAlphaTestTexture(): Nullable<BaseTexture> {
            return null;
        }

        // Methods   
        public isReadyForSubMesh(mesh: AbstractMesh, subMesh: SubMesh, useInstances?: boolean): boolean {  

            if (this.isFrozen) {
                if (this._wasPreviouslyReady && subMesh.effect) {
                    return true;
                }
            }

            if (!subMesh._materialDefines) {
                subMesh._materialDefines = new snowMaterialDefines();
            }

            var defines = <snowMaterialDefines>subMesh._materialDefines;
            var scene = this.getScene();
            
            if(this.pushup) {
                (<any>defines)["PUSHUP"] = true;
            }
            else{
                (<any>defines)["PUSHUP"] = false;
            }

            if (!this.checkReadyOnEveryCall && subMesh.effect) {
                if (this._renderId === scene.getRenderId()) {
                    return true;
                }
            }

            var engine = scene.getEngine();

            // Textures
            if (defines._areTexturesDirty) {                
                if (scene.texturesEnabled) {
                    defines._needUVs = false;
                    if (this._diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                        if (!this._diffuseTexture.isReady()) {
                            return false;
                        } else {
                            defines._needUVs = true;
                            defines.DIFFUSE = true;
                        }
                    } 
                    if (StandardMaterial.DiffuseTextureEnabled) {
                        var textures = [this.diffuseTextureX, this.diffuseTextureY, this.diffuseTextureZ, this.perlinNoiseTexture];
                        var textureDefines = ["DIFFUSEX", "DIFFUSEY", "DIFFUSEZ", "DIFFUSENOISE"];
                        
                        for (var i=0; i < textures.length; i++) {
                            if (textures[i]) {
                                if (!textures[i].isReady()) {
                                    return false;
                                } else {
                                    (<any>defines)[textureDefines[i]] = true;
                                }
                            }
                        }
                    }
                    if (StandardMaterial.BumpTextureEnabled) {
                        var textures = [this.normalTextureX, this.normalTextureY, this.normalTextureZ, this.normalTexture];
                        var textureDefines = ["BUMPX", "BUMPY", "BUMPZ", "BUMP"];
                        
                        for (var i=0; i < textures.length; i++) {
                            if (textures[i]) {
                                if (!textures[i].isReady()) {
                                    return false;
                                } else {
                                    (<any>defines)[textureDefines[i]] = true;
                                }
                            }
                        }
                    }
                }
            }

            // Misc.
            MaterialHelper.PrepareDefinesForMisc(mesh, scene, false, this.pointsCloud, this.fogEnabled, defines);

            // Lights
            defines._needNormals = MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, false, this._maxSimultaneousLights, this._disableLighting);

            // Values that need to be evaluated on every frame
            MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances ? true : false);
            
            // Attribs
            MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true);

            // Get correct effect      
            if (defines.isDirty) {
                defines.markAsProcessed();
                scene.resetCachedMaterial();

                // Fallbacks
                var fallbacks = new EffectFallbacks();             
                if (defines.FOG) {
                    fallbacks.addFallback(1, "FOG");
                }

                MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this.maxSimultaneousLights);
             
                if (defines.NUM_BONE_INFLUENCERS > 0) {
                    fallbacks.addCPUSkinningFallback(0, mesh);
                }

                //Attributes
                var attribs = [VertexBuffer.PositionKind];

                if (defines.UV1) {
                    attribs.push(VertexBuffer.UVKind);
                }

                if (defines.NORMAL) {
                    attribs.push(VertexBuffer.NormalKind);
                }

                if (defines.VERTEXCOLOR) {
                    attribs.push(VertexBuffer.ColorKind);
                }

                MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
                MaterialHelper.PrepareAttributesForInstances(attribs, defines);

                // Legacy browser patch
                var shaderName = "snow";
                var join = defines.toString();
                var uniforms = ["world", "view", "viewProjection", "vEyePosition", "vLightsType", "vDiffuseColor", "vSpecularColor",
                    "vFogInfos", "vFogColor", "pointSize",
                    "mBones",
                    "vClipPlane",
                    "tileSize",
                    "noiseSize",
                    "noiseStrength",
                    "time"
                ];
                var samplers = ["diffuseSamplerX", "diffuseSamplerY", "diffuseSamplerZ", "perlinNoiseSampler",
                    "normalSamplerX", "normalSamplerY", "normalSamplerZ",
                    "diffuseSampler", "normalSampler"
                ];

                var uniformBuffers = new Array<string>()

                MaterialHelper.PrepareUniformsAndSamplersList(<EffectCreationOptions>{
                    uniformsNames: uniforms, 
                    uniformBuffersNames: uniformBuffers,
                    samplers: samplers, 
                    defines: defines, 
                    maxSimultaneousLights: this.maxSimultaneousLights
                });
                
                subMesh.setEffect(scene.getEngine().createEffect(shaderName,
                    <EffectCreationOptions>{
                        attributes: attribs,
                        uniformsNames: uniforms,
                        uniformBuffersNames: uniformBuffers,
                        samplers: samplers,
                        defines: join,
                        fallbacks: fallbacks,
                        onCompiled: this.onCompiled,
                        onError: this.onError,
                        indexParameters: { maxSimultaneousLights: this.maxSimultaneousLights }
                    }, engine), defines);
            }
            if (!subMesh.effect || !subMesh.effect.isReady()) {
                return false;
            }

            this._renderId = scene.getRenderId();
            this._wasPreviouslyReady = true;
            
            return true;
        }

        public bindForSubMesh(world: Matrix, mesh: Mesh, subMesh: SubMesh): void {
            var scene = this.getScene();

            var defines = <snowMaterialDefines>subMesh._materialDefines;
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

            // Bones
            MaterialHelper.BindBonesParameters(mesh, this._activeEffect);
            
            this._activeEffect.setFloat("tileSize", this.tileSize);
            this._activeEffect.setFloat("noiseSize", this.noiseSize);
            

            if (scene.getCachedMaterial() !== this) {
                // Textures        
                if (this.diffuseTextureX) {
                    this._activeEffect.setTexture("diffuseSamplerX", this.diffuseTextureX);
                }
                if (this.diffuseTextureY) {
                    this._activeEffect.setTexture("diffuseSamplerY", this.diffuseTextureY);
                }
                if (this.diffuseTextureZ) {
                    this._activeEffect.setTexture("diffuseSamplerZ", this.diffuseTextureZ);
                }
                if (this.normalTextureX) {
                    this._activeEffect.setTexture("normalSamplerX", this.normalTextureX);
                }
                if (this.normalTextureY) {
                    this._activeEffect.setTexture("normalSamplerY", this.normalTextureY);
                }
                if (this.normalTextureZ) {
                    this._activeEffect.setTexture("normalSamplerZ", this.normalTextureZ);
                }
                if (this.normalTexture) {
                    this._activeEffect.setTexture("normalSampler", this.normalTexture);
                }
                if (this.perlinNoiseTexture) {
                    this._activeEffect.setTexture("perlinNoiseSampler", this.perlinNoiseTexture);
                }
                if (this.diffuseTexture) {
                    this._activeEffect.setTexture("diffuseSampler", this.diffuseTexture);
                }

                // Clip plane
                MaterialHelper.BindClipPlane(this._activeEffect, scene);

                // Point size
                if (this.pointsCloud) {
                    this._activeEffect.setFloat("pointSize", this.pointSize);
                }

                MaterialHelper.BindEyePosition(effect, scene);               
            }

            this._activeEffect.setColor4("vDiffuseColor", this.diffuseColor, this.alpha * mesh.visibility);
            
            if (defines.SPECULARTERM) {
                this._activeEffect.setColor4("vSpecularColor", this.specularColor, this.specularPower);
            }

            //Lights
            if (scene.lightsEnabled && !this.disableLighting) {
                MaterialHelper.BindLights(scene, mesh, this._activeEffect, defines, this.maxSimultaneousLights);
            }

            // View
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE) {
                this._activeEffect.setMatrix("view", scene.getViewMatrix());
            }

            // Fog
            MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect);

            this._afterBind(mesh, this._activeEffect);

            // Time
            this.lastTime += scene.getEngine().getDeltaTime() * this.speed;
            if(this.lastTime < 0.0)
            {
                this._activeEffect.setFloat("time", 0.0);
            }
            else if(this.lastTime > this.snowlimit*10000.0)
            {
                this._activeEffect.setFloat("time", this.snowlimit);
            }
            else
            {
                this._activeEffect.setFloat("time", this.lastTime/10000.0);
            }
            this._activeEffect.setFloat("noiseStrength", this.noiseStrength);
        }

        public getAnimatables(): IAnimatable[] {
            var results = [];

            if (this.mixTexture && this.mixTexture.animations && this.mixTexture.animations.length > 0) {
                results.push(this.mixTexture);
            }

            return results;
        }

        public getActiveTextures(): BaseTexture[] {
            var activeTextures = super.getActiveTextures();

            if (this._diffuseTextureX) {
                activeTextures.push(this._diffuseTextureX);
            }

            if (this._diffuseTextureY) {
                activeTextures.push(this._diffuseTextureY);
            }

            if (this._diffuseTextureZ) {
                activeTextures.push(this._diffuseTextureZ);
            }

            if (this._normalTextureX) {
                activeTextures.push(this._normalTextureX);
            }

            if (this._normalTextureY) {
                activeTextures.push(this._normalTextureY);
            }

            if (this._normalTextureZ) {
                activeTextures.push(this._normalTextureZ);
            }

            if (this._normalTexture) {
                activeTextures.push(this._normalTexture);
            }

            if (this._perlinNoiseTexture) {
                activeTextures.push(this._perlinNoiseTexture);
            }

            if (this._diffuseTexture) {
                activeTextures.push(this._diffuseTexture);
            }
            
            return activeTextures;
        }

        public hasTexture(texture: BaseTexture): boolean {
            if (super.hasTexture(texture)) {
                return true;
            }

            if (this._diffuseTextureX === texture) {
                return true;
            }    

            if (this._diffuseTextureY === texture) {
                return true;
            }         

            if (this._diffuseTextureZ === texture) {
                return true;
            }

            if (this._normalTextureX === texture) {
                return true;
            }     

            if (this._normalTextureY === texture) {
                return true;
            }     

            if (this._normalTextureZ === texture) {
                return true;
            } 

            if (this._normalTexture === texture) {
                return true;
            } 

            if (this._perlinNoiseTexture === texture) {
                return true;
            } 

            if (this._diffuseTexture === texture) {
                return true;
            }

            return false;    
        }        

        public dispose(forceDisposeEffect?: boolean): void {
            if (this.mixTexture) {
                this.mixTexture.dispose();
            }

            super.dispose(forceDisposeEffect);
        }
        
        public clone(name: string): snowMaterial {
            return SerializationHelper.Clone(() => new snowMaterial(name, this.getScene()), this);
        }

        public serialize(): any {
            var serializationObject = SerializationHelper.Serialize(this);
            serializationObject.customType = "BABYLON.snowMaterial";
            return serializationObject;
        }

        public getClassName(): string {
            return "snowMaterial";
        }

        // Statics
        public static Parse(source: any, scene: Scene, rootUrl: string): snowMaterial {
            return SerializationHelper.Parse(() => new snowMaterial(source.name, scene), source, scene, rootUrl);
        }
    }
} 

