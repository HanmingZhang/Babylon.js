/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    export class RaindropsMaterialDefines extends MaterialDefines{

         public DIFFUSE = false;
         public REFLECTION = false;
         public BUMP = false;
         public CLIPPLANE = false;
         public ALPHATEST = false;
         public DEPTHPREPASS = false;
         public ALPHAFROMDIFFUSE = false;
         public POINTSIZE = false;
         public FOG = false;
         public NORMAL = false;
         public UV1 = false;
         public UV2 = false;
         public VERTEXCOLOR = false;
         public VERTEXALPHA = false;
         public NUM_BONE_INFLUENCERS = 0;
         public BonesPerMesh = 0;
         public LOGARITHMICDEPTH = false;
         
 
         constructor() {
             super();
             this.rebuild();
         }
     }
 
     export class RaindropsMaterial extends PushMaterial {
         /*
		* Public members
		*/
         @serializeAsTexture("diffuseTexture")
         private _diffuseTexture: BaseTexture;
         @expandToProperty("_markAllSubMeshesAsTexturesDirty")
         public diffuseTexture:BaseTexture;
 
         @serializeAsTexture("raindropTexture")
         private _raindropTexture: BaseTexture;
         @expandToProperty("_markAllSubMeshesAsTexturesDirty")
         public raindropTexture: BaseTexture;  
         
         @serializeAsTexture("raindropGoundHeightTexture")
         private _raindropGroundHeightTexture: BaseTexture;
         @expandToProperty("_markAllSubMeshesAsTexturesDirty")
         public raindropGroundHeightTexture: BaseTexture;
         
         @serializeAsTexture("raindropGoundNormalTexture")
         private _raindropGroundNormalTexture: BaseTexture;
         @expandToProperty("_markAllSubMeshesAsTexturesDirty")
         public raindropGroundNormalTexture: BaseTexture;

         @serializeAsTexture("raindropWaterNormalTexture")
         private _raindropWaterNormalTexture: BaseTexture;
         @expandToProperty("_markAllSubMeshesAsTexturesDirty")
         public raindropWaterNormalTexture: BaseTexture;


         @serializeAsColor3("ambient")
         public ambientColor = new Color3(0, 0, 0);
 
         @serializeAsColor3("diffuse")
         public diffuseColor = new Color3(1, 1, 1);
 
         @serializeAsColor3("specular")
         public specularColor = new Color3(1, 1, 1);
 
         @serialize()
         public specularPower = 64;

         @serialize("disableLighting")
         private _disableLighting = false;
         @expandToProperty("_markAllSubMeshesAsLightsDirty")
         public disableLighting: boolean;
 
         @serialize("maxSimultaneousLights")
         private _maxSimultaneousLights = 4;
         @expandToProperty("_markAllSubMeshesAsLightsDirty")
         public maxSimultaneousLights: number;
 
        //  @serialize("roughness")
        //  private _roughness = 0;
        //  @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        //  public roughness: number;            
 
         protected _renderTargets = new SmartArray<RenderTargetTexture>(16);

         protected _globalAmbientColor = new Color3(0, 0, 0);


        /*
		* Public raindrop property members
		*/
        public raindropPuddleAmount: number = 2.0;
        public raindropSpeed: number = 25.0;

        /*
		* Private members
		*/
         private _mesh: Nullable<AbstractMesh> = null;

         private _reflectionRTT: RenderTargetTexture;
         
         private _reflectionTransform: Matrix = Matrix.Zero();   

         private _lastTime: number = 0;
         private _lastDeltaTime: number = 0; 

         private _renderId: number;
         private _useLogarithmicDepth: boolean;

        /**
		* Constructor
		*/
         constructor(name: string, scene: Scene, public renderTargetSize: Vector2 = new Vector2(512, 512)) {
             super(name, scene);

             this._createRenderTargets(scene, renderTargetSize);
 
             this.getRenderTargetTextures = (): SmartArray<RenderTargetTexture> => {
                this._renderTargets.reset();
                this._renderTargets.push(this._reflectionRTT);

                return this._renderTargets;
             }
         }
 
         public getClassName(): string {
             return "RaindropsMaterial";
         }        
 
         @serialize()
         public get useLogarithmicDepth(): boolean {
             return this._useLogarithmicDepth;
         }
 
         public set useLogarithmicDepth(value: boolean) {
             this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
             this._markAllSubMeshesAsMiscDirty();
         }


         // Get / Set
         public get reflectionTexture(): RenderTargetTexture {
            return this._reflectionRTT;
        }


         // Methods
         public addToRenderList(node: any): void {
            if (this._reflectionRTT.renderList) {
                this._reflectionRTT.renderList.push(node);
            }
        }

         public enableRenderTargets(enable: boolean): void {
            var refreshRate = enable ? 1 : 0;
            this._reflectionRTT.refreshRate = refreshRate;
        }

         public getRenderList(): Nullable<AbstractMesh[]> {
            return this._reflectionRTT.renderList;
        }

         public get renderTargetsEnabled(): boolean {
            return !(this._reflectionRTT.refreshRate === 0);
        }

         public needAlphaBlending(): boolean {
             return (this.alpha < 1.0);
         }
 
         public needAlphaTesting(): boolean {
             return this._diffuseTexture != null && this._diffuseTexture.hasAlpha;
         }
 
        //  protected _shouldUseAlphaFromDiffuseTexture(): boolean {
        //      return this._diffuseTexture != null && this._diffuseTexture.hasAlpha && this._useAlphaFromDiffuseTexture;
        //  }
 
         public getAlphaTestTexture(): Nullable<BaseTexture> {
             return this._diffuseTexture;
         }
 
         /**
          * Child classes can use it to update shaders
          */
         public isReadyForSubMesh(mesh: AbstractMesh, subMesh: SubMesh, useInstances: boolean = false): boolean {            
             if (this.isFrozen) {
                 if (this._wasPreviouslyReady && subMesh.effect) {
                     return true;
                 }
             }
 
             if (!subMesh._materialDefines) {
                 subMesh._materialDefines = new RaindropsMaterialDefines();
             }
 
             var scene = this.getScene();
             var defines = <RaindropsMaterialDefines>subMesh._materialDefines;

             if (!this.checkReadyOnEveryCall && subMesh.effect) {
                 if (this._renderId === scene.getRenderId()) {
                     return true;
                 }
             }
 
             var engine = scene.getEngine();
 
             // Lights
             defines._needNormals = MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
 
             // Textures
             if (defines._areTexturesDirty) {
                 defines._needUVs = false;
                 if (scene.texturesEnabled) {
                     if (this._diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                         if (!this._diffuseTexture.isReadyOrNotBlocking()) {
                             return false;
                         } else {
                             MaterialHelper.PrepareDefinesForMergedUV(this._diffuseTexture, defines, "DIFFUSE");
                             defines._needUVs = true;
                             defines.DIFFUSE = true;
                         }
                    } else {
                         defines.DIFFUSE = false;
                    }
                    
                    if (this._raindropTexture) {
                        if (!this._raindropTexture.isReadyOrNotBlocking()) {
                            return false;
                        } else {
                            MaterialHelper.PrepareDefinesForMergedUV(this._raindropTexture, defines, "RAINDROP");
                            defines._needUVs = true;
                        }
                    }

                    if (this._raindropGroundHeightTexture) {
                        if (!this._raindropGroundHeightTexture.isReadyOrNotBlocking()) {
                            return false;
                        } else {
                            MaterialHelper.PrepareDefinesForMergedUV(this._raindropGroundHeightTexture, defines, "RAINDROPHEIGHT");
                            defines._needUVs = true;
                        }
                    }

                    if (this._raindropGroundNormalTexture) {
                        if (!this._raindropGroundNormalTexture.isReadyOrNotBlocking()) {
                            return false;
                        } else {
                            MaterialHelper.PrepareDefinesForMergedUV(this._raindropGroundNormalTexture, defines, "RAINDROPNORMAL");
                            defines._needUVs = true;
                        }
                    }

                    if (this._raindropWaterNormalTexture) {
                        if (!this._raindropWaterNormalTexture.isReadyOrNotBlocking()) {
                            return false;
                        } else {
                            MaterialHelper.PrepareDefinesForMergedUV(this._raindropWaterNormalTexture, defines, "RAINDROPWATER");
                            defines._needUVs = true;
                        }
                    }


                     if (StandardMaterial.ReflectionTextureEnabled) {
                        defines.REFLECTION = true;
                    }
                     
                } else {
                     defines.DIFFUSE = false;
                     defines.REFLECTION = false;
                    //  defines.EMISSIVE = false;
                    //  defines.LIGHTMAP = false;
                    //  defines.BUMP = false;
                    //  defines.REFRACTION = false;
                 }
             }
 
             // Misc.
             MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, defines);
 
             // Attribs
             MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true);
             
             // Values that need to be evaluated on every frame
             MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances);
             
             this._mesh = mesh;

             // Get correct effect      
             if (defines.isDirty) {
                 defines.markAsProcessed();
                 scene.resetCachedMaterial();
 
                 // Fallbacks
                 var fallbacks = new EffectFallbacks();
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
 
                 MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights);
 
                //  if (defines.SPECULARTERM) {
                //      fallbacks.addFallback(0, "SPECULARTERM");
                //  }
 
                 
 
                 //Attributes
                 var attribs = [VertexBuffer.PositionKind];
 
                 if (defines.NORMAL) {
                     attribs.push(VertexBuffer.NormalKind);
                 }
 
                 if (defines.UV1) {
                     attribs.push(VertexBuffer.UVKind);
                 }
 
                 if (defines.UV2) {
                     attribs.push(VertexBuffer.UV2Kind);
                 }
 
                 if (defines.VERTEXCOLOR) {
                     attribs.push(VertexBuffer.ColorKind);
                 }
 
                 MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
                 MaterialHelper.PrepareAttributesForInstances(attribs, defines);
                 
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
 
                 var samplers = ["diffuseSampler", "raindropSampler", "reflectionSampler", "groundHeightSampler", "groundNormalSampler", "waterNormalSampler"]
 
                 // var uniformBuffers = ["Material", "Scene"];
                 var uniformBuffers = new Array<string>()
                 
                 MaterialHelper.PrepareUniformsAndSamplersList(<EffectCreationOptions>{
                     uniformsNames: uniforms, 
                     uniformBuffersNames: uniformBuffers,
                     samplers: samplers, 
                     defines: defines, 
                     maxSimultaneousLights: this._maxSimultaneousLights
                 });
 
                 var join = defines.toString();

                 subMesh.setEffect(scene.getEngine().createEffect(shaderName, <EffectCreationOptions>{
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
         }
 
 
         public bindForSubMesh(world: Matrix, mesh: Mesh, subMesh: SubMesh): void {
             var scene = this.getScene();
 
             var defines = <RaindropsMaterialDefines>subMesh._materialDefines;
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
             let mustRebind = this._mustRebind(scene, effect);
             
             // Bones
             MaterialHelper.BindBonesParameters(mesh, this._activeEffect);
             
             if (mustRebind) {
                
                // Textures        
                if (this.diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                    effect.setTexture("diffuseSampler", this.diffuseTexture);
                    effect.setFloat2("vDiffuseInfos", this.diffuseTexture.coordinatesIndex, this.diffuseTexture.level);
                    effect.setMatrix("diffuseMatrix", this.diffuseTexture.getTextureMatrix());
                }
                
                if(this.raindropTexture){
                    effect.setTexture("raindropSampler", this.raindropTexture);
                    effect.setMatrix("raindropMatrix", this.raindropTexture.getTextureMatrix());   
                }

                if(this.raindropGroundHeightTexture){
                    effect.setTexture("groundHeightSampler", this.raindropGroundHeightTexture);
                    effect.setMatrix("groundHeightMatrix", this.raindropGroundHeightTexture.getTextureMatrix());   
                }

                if(this.raindropGroundNormalTexture){
                    effect.setTexture("groundNormalSampler", this.raindropGroundNormalTexture);
                    effect.setMatrix("groundNormalMatrix", this.raindropGroundNormalTexture.getTextureMatrix());   
                }

                if(this.raindropWaterNormalTexture){
                    effect.setTexture("waterNormalSampler", this.raindropWaterNormalTexture);
                    effect.setMatrix("waterNormalMatrix", this.raindropWaterNormalTexture.getTextureMatrix());   
                }


                // Clip plane
                MaterialHelper.BindClipPlane(effect, scene);

                // Point size
                if (this.pointsCloud) {
                    effect.setFloat("pointSize", this.pointSize);
                }

                 // Colors
                 scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
                 MaterialHelper.BindEyePosition(effect, scene);
                 effect.setColor3("vAmbientColor", this._globalAmbientColor);
                 effect.setColor4("vDiffuseColor", this.diffuseColor, this.alpha * mesh.visibility);
                 effect.setColor4("vSpecularColor", this.specularColor, this.specularPower);
             }
 
             if (mustRebind || !this.isFrozen) {
                 // Lights
                 if (scene.lightsEnabled && !this._disableLighting) {
                     MaterialHelper.BindLights(scene, mesh, effect, defines, this._maxSimultaneousLights);
                 }
 
                 // View
                 if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE) {
                     //this.bindView(effect);
                     effect.setMatrix("view", scene.getViewMatrix());                     
                 }
                 
                 // Fog
                 MaterialHelper.BindFogParameters(scene, mesh, effect);
            
                 // Log. depth
                 MaterialHelper.BindLogDepth(defines, effect, scene);
             }

             // Raindrop reflection
            if (StandardMaterial.ReflectionTextureEnabled) {
                effect.setTexture("reflectionSampler", this._reflectionRTT);
            }

            var wrvp = this._mesh.getWorldMatrix().multiply(this._reflectionTransform).multiply(scene.getProjectionMatrix());            

            //Add delta time. Prevent adding delta time if it hasn't changed.
            let deltaTime = scene.getEngine().getDeltaTime();
            if (deltaTime !== this._lastDeltaTime) {
                this._lastDeltaTime = deltaTime;
                this._lastTime += this._lastDeltaTime;
            }

            effect.setMatrix("worldReflectionViewProjection", wrvp);
            effect.setFloat("time", this._lastTime / 100000);
            effect.setFloat("raindropPuddleAmount", this.raindropPuddleAmount);
            effect.setFloat("raindropSpeed", this.raindropSpeed);

            this._afterBind(mesh, this._activeEffect);
         }
         

         private _createRenderTargets(scene: Scene, renderTargetSize: Vector2): void {
            // Render targets
            this._reflectionRTT = new RenderTargetTexture(name + "_reflection", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
            this._reflectionRTT.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
            this._reflectionRTT.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;
            this._reflectionRTT.ignoreCameraViewport = true;

            var isVisible: boolean;
            var clipPlane: Nullable<Plane> = null;
            var savedViewMatrix: Matrix;
            var mirrorMatrix = Matrix.Zero();

            this._reflectionRTT.onBeforeRender = () => {
                if (this._mesh) {
                    isVisible = this._mesh.isVisible;
                    this._mesh.isVisible = false;
                }

                // Clip plane
                clipPlane = scene.clipPlane;

                var positiony = this._mesh ? this._mesh.position.y : 0.0;
                scene.clipPlane = Plane.FromPositionAndNormal(new Vector3(0, positiony - 0.05, 0), new Vector3(0, -1, 0));

                // Transform
                Matrix.ReflectionToRef(scene.clipPlane, mirrorMatrix);
                savedViewMatrix = scene.getViewMatrix();

                mirrorMatrix.multiplyToRef(savedViewMatrix, this._reflectionTransform);
                scene.setTransformMatrix(this._reflectionTransform, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = false;
                scene._mirroredCameraPosition = Vector3.TransformCoordinates((<Camera>scene.activeCamera).position, mirrorMatrix);
            };

            this._reflectionRTT.onAfterRender = () => {
                if (this._mesh) {
                    this._mesh.isVisible = isVisible;
                }

                // Clip plane
                scene.clipPlane = clipPlane;

                // Transform
                scene.setTransformMatrix(savedViewMatrix, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = true;
                scene._mirroredCameraPosition = null;
            };
        }



         public getAnimatables(): IAnimatable[] {
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
         }
 
         public getActiveTextures(): BaseTexture[] {
             var activeTextures = super.getActiveTextures();

            if (this._diffuseTexture) {
                 activeTextures.push(this._diffuseTexture);
            }

            if(this._raindropTexture){
                activeTextures.push(this._raindropTexture);
            }

            if(this._raindropGroundHeightTexture){
                activeTextures.push(this._raindropGroundHeightTexture);
            }

            if(this._raindropGroundNormalTexture){
                activeTextures.push(this._raindropGroundNormalTexture);
            }

            if(this._raindropWaterNormalTexture){
                activeTextures.push(this._raindropWaterNormalTexture);
            }
 
             return activeTextures;
         }
 
         public hasTexture(texture: BaseTexture): boolean {
             if (super.hasTexture(texture)) {
                 return true;
             }

             if (this._diffuseTexture === texture) {
                 return true;
             }
             
             if(this._raindropTexture === texture){
                return true;
             }

             if(this._raindropGroundHeightTexture === texture){
                return true;
             }

             if(this._raindropGroundNormalTexture === texture){
                return true;
             }

             if(this._raindropWaterNormalTexture === texture){
                return true;
             }
 
             return false;    
         }        
 
         public dispose(forceDisposeEffect?: boolean): void {

            if (this._diffuseTexture) {
                this._diffuseTexture.dispose();
            }

            if (this._raindropTexture){
                this._raindropTexture.dispose();
            }

            if (this._raindropGroundHeightTexture){
                this._raindropGroundHeightTexture.dispose();
            }

            if (this._raindropGroundNormalTexture){
                this._raindropGroundNormalTexture.dispose();
            }

            if (this._raindropWaterNormalTexture){
                this._raindropWaterNormalTexture.dispose();
            }


            var index = this.getScene().customRenderTargets.indexOf(this._reflectionRTT);
            if (index != -1) {
                this.getScene().customRenderTargets.splice(index, 1);
            }

            if (this._reflectionRTT) {
                this._reflectionRTT.dispose();
            }
             
             super.dispose(forceDisposeEffect);
         }
 
         public clone(name: string): RaindropsMaterial {
             return SerializationHelper.Clone(() => new RaindropsMaterial(name, this.getScene()), this);
         }
 
         public serialize(): any {
            var serializationObject = SerializationHelper.Serialize(this);
            serializationObject.customType = "BABYLON.RaindropMaterial";
            serializationObject.reflectionTexture.isRenderTarget = true;
            return serializationObject;
         }

         // Statics
         public static Parse(source: any, scene: Scene, rootUrl: string): RaindropsMaterial {
             return SerializationHelper.Parse(() => new RaindropsMaterial(source.name, scene), source, scene, rootUrl);
         }
             
     }
 } 
 