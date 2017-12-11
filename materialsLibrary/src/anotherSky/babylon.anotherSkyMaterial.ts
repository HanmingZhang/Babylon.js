/// <reference path="../../../dist/preview release/babylon.d.ts"/>

module BABYLON {
    class anotherSkyMaterialDefines extends MaterialDefines {
        public CLIPPLANE = false;
        public POINTSIZE = false;
        public FOG = false;
        public VERTEXCOLOR = false;
        public VERTEXALPHA = false;

        // switch to false to disable real-time generated clouds
        public DIFFUSENOISE = false; //true;

        constructor() {
            super();
            this.rebuild();
        }
    }
    
    export class anotherSkyMaterial extends PushMaterial {
        // Public members

        public lastTime: number = 0;
        /*public timeScale: number = 1.0;
        public cloudScale: number = 1.0;
        public cover: number = 0.5;
        public softness: number = 0.2;
        public brightness: number = 0.0;
        public noiseOctaves: number = 4.0;
        public curlStrain: number = 3.0;*/

        public timeScale: number = 0.1;
        public cloudScale: number = 0.1;
        //public cloudScale: number = 0.0;
        public cover: number = 0.5;
        public softness: number = 0.2;
        public brightness: number = 0.1;
        public noiseOctaves: number = 5.0;
        public curlStrain: number = 3.0;

        public skyTime: number = 0;

        @serialize()
        public luminance: number = 1.0;
        
        @serialize()
        public turbidity: number = 10.0;
        //public turbidity: number = 3.7;
        
        @serialize()
        public rayleigh: number = 2.0;
        //public rayleigh: number = 0.1;
        
        @serialize()
        public mieCoefficient: number = 0.005;
        //public mieCoefficient: number = 0.001;

        @serialize()
        //public turbidity: number = 10.0;
        public turbidity2: number = 3.7;
        
        @serialize()
        //public rayleigh: number = 2.0;
        public rayleigh2: number = 0.1;
        
        @serialize()
        //public mieCoefficient: number = 0.005;
        public mieCoefficient2: number = 0.001;
        
        @serialize()
        public mieDirectionalG: number = 0.8;
        
        @serialize()
        public distance: number = 500;
        
        @serialize()
        public inclination: number = 0.49;
        
        @serialize()
        public azimuth: number = 0.25;
        
        @serializeAsVector3()
        public sunPosition: Vector3 = new Vector3(1, 0, 0);
        
        @serialize()
        public useSunPosition: boolean = true;

        @serializeAsTexture()
        public mixTexture: BaseTexture;

        // @serializeAsTexture("perlinNoiseTexture")
        // private _perlinNoiseTexture: BaseTexture;
        // @expandToProperty("_markAllSubMeshesAsTexturesDirty")
        // public perlinNoiseTexture: BaseTexture;  
        
        // Private members
        private _cameraPosition: Vector3 = Vector3.Zero();
        
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
                subMesh._materialDefines = new anotherSkyMaterialDefines();
            }

            var defines = <anotherSkyMaterialDefines>subMesh._materialDefines;
            var scene = this.getScene();

            if (!this.checkReadyOnEveryCall && subMesh.effect) {
                if (this._renderId === scene.getRenderId()) {
                    return true;
                }
            }

            MaterialHelper.PrepareDefinesForMisc(mesh, scene, false, this.pointsCloud, this.fogEnabled, defines);
            
            // Attribs
            MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, false);

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
                var fallbacks = new EffectFallbacks();             
                if (defines.FOG) {
                    fallbacks.addFallback(1, "FOG");
                }
                
                //Attributes
                var attribs = [VertexBuffer.PositionKind];

                if (defines.VERTEXCOLOR) {
                    attribs.push(VertexBuffer.ColorKind);
                }

                var shaderName = "anotherSky";
                
                var join = defines.toString();
                subMesh.setEffect(scene.getEngine().createEffect(shaderName,
                    attribs,
                    ["world", "viewProjection", "view",
                        "vFogInfos", "vFogColor", "pointSize", "vClipPlane",
                        "luminance", "turbidity", "rayleigh", "mieCoefficient", "mieDirectionalG", "sunPosition",
                        "cameraPosition", "time", 
                        "timeScale", "cloudScale", "cover", "softness", "brightness", "noiseOctaves", "curlStrain" ,
                        "skyTime",
                        "turbidity2", "rayleigh2", "mieCoefficient2"
                    ],
                    [],
                    join, fallbacks, this.onCompiled, this.onError), defines);
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

            var defines = <anotherSkyMaterialDefines>subMesh._materialDefines;
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
            if (scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE) {
                this._activeEffect.setMatrix("view", scene.getViewMatrix());
            }
            
            // Fog
            MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect);

            // Time
            this.lastTime += scene.getEngine().getDeltaTime();
            this._activeEffect.setFloat("time", this.lastTime/100.0);
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
        }

        public getAnimatables(): IAnimatable[] {
            var results = [];
    
                if (this.mixTexture && this.mixTexture.animations && this.mixTexture.animations.length > 0) {
                    results.push(this.mixTexture);
                }
    
            return results;
        }

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

        public dispose(forceDisposeEffect?: boolean): void {
            if (this.mixTexture) {
                this.mixTexture.dispose();
            }

            super.dispose(forceDisposeEffect);
        }

        public clone(name: string): anotherSkyMaterial {
            return SerializationHelper.Clone<anotherSkyMaterial>(() => new anotherSkyMaterial(name, this.getScene()), this);
        }
        
        public serialize(): any {
            var serializationObject = SerializationHelper.Serialize(this);
            serializationObject.customType  = "BABYLON.anotherSkyMaterial";
            return serializationObject;
        }

        public getClassName(): string {
            return "anotherSkyMaterial";
        }            

        // Statics
        public static Parse(source: any, scene: Scene, rootUrl: string): anotherSkyMaterial {
            return SerializationHelper.Parse(() => new anotherSkyMaterial(source.name, scene), source, scene, rootUrl);
        }
    }
} 