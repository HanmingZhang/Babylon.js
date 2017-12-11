
declare module BABYLON {
    class RaindropsMaterialDefines extends MaterialDefines {
        DIFFUSE: boolean;
        REFLECTION: boolean;
        BUMP: boolean;
        CLIPPLANE: boolean;
        ALPHATEST: boolean;
        DEPTHPREPASS: boolean;
        ALPHAFROMDIFFUSE: boolean;
        POINTSIZE: boolean;
        FOG: boolean;
        NORMAL: boolean;
        UV1: boolean;
        UV2: boolean;
        VERTEXCOLOR: boolean;
        VERTEXALPHA: boolean;
        NUM_BONE_INFLUENCERS: number;
        BonesPerMesh: number;
        LOGARITHMICDEPTH: boolean;
        constructor();
    }
    class RaindropsMaterial extends PushMaterial {
        renderTargetSize: Vector2;
        private _diffuseTexture;
        diffuseTexture: BaseTexture;
        private _raindropTexture;
        raindropTexture: BaseTexture;
        private _raindropGroundHeightTexture;
        raindropGroundHeightTexture: BaseTexture;
        private _raindropGroundNormalTexture;
        raindropGroundNormalTexture: BaseTexture;
        private _raindropWaterNormalTexture;
        raindropWaterNormalTexture: BaseTexture;
        ambientColor: Color3;
        diffuseColor: Color3;
        specularColor: Color3;
        specularPower: number;
        private _disableLighting;
        disableLighting: boolean;
        private _maxSimultaneousLights;
        maxSimultaneousLights: number;
        protected _renderTargets: SmartArray<RenderTargetTexture>;
        protected _globalAmbientColor: Color3;
        raindropPuddleAmount: number;
        raindropSpeed: number;
        raindropSize: number;
        raindropRippleNormalIntensity: number;
        private _mesh;
        private _reflectionRTT;
        private _reflectionTransform;
        private _lastTime;
        private _lastDeltaTime;
        private _renderId;
        private _useLogarithmicDepth;
        /**
        * Constructor
        */
        constructor(name: string, scene: Scene, renderTargetSize?: Vector2);
        getClassName(): string;
        useLogarithmicDepth: boolean;
        readonly reflectionTexture: RenderTargetTexture;
        addToRenderList(node: any): void;
        enableRenderTargets(enable: boolean): void;
        getRenderList(): Nullable<AbstractMesh[]>;
        readonly renderTargetsEnabled: boolean;
        needAlphaBlending(): boolean;
        needAlphaTesting(): boolean;
        getAlphaTestTexture(): Nullable<BaseTexture>;
        /**
         * Child classes can use it to update shaders
         */
        isReadyForSubMesh(mesh: AbstractMesh, subMesh: SubMesh, useInstances?: boolean): boolean;
        bindForSubMesh(world: Matrix, mesh: Mesh, subMesh: SubMesh): void;
        private _createRenderTargets(scene, renderTargetSize);
        getAnimatables(): IAnimatable[];
        getActiveTextures(): BaseTexture[];
        hasTexture(texture: BaseTexture): boolean;
        dispose(forceDisposeEffect?: boolean): void;
        clone(name: string): RaindropsMaterial;
        serialize(): any;
        static Parse(source: any, scene: Scene, rootUrl: string): RaindropsMaterial;
    }
}
