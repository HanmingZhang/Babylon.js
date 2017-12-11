
declare module BABYLON {
    class anotherSkyMaterial extends PushMaterial {
        lastTime: number;
        timeScale: number;
        cloudScale: number;
        cover: number;
        softness: number;
        brightness: number;
        noiseOctaves: number;
        curlStrain: number;
        skyTime: number;
        luminance: number;
        turbidity: number;
        rayleigh: number;
        mieCoefficient: number;
        turbidity2: number;
        rayleigh2: number;
        mieCoefficient2: number;
        mieDirectionalG: number;
        distance: number;
        inclination: number;
        azimuth: number;
        sunPosition: Vector3;
        useSunPosition: boolean;
        mixTexture: BaseTexture;
        private _cameraPosition;
        private _renderId;
        constructor(name: string, scene: Scene);
        needAlphaBlending(): boolean;
        needAlphaTesting(): boolean;
        getAlphaTestTexture(): Nullable<BaseTexture>;
        isReadyForSubMesh(mesh: AbstractMesh, subMesh: SubMesh, useInstances?: boolean): boolean;
        bindForSubMesh(world: Matrix, mesh: Mesh, subMesh: SubMesh): void;
        getAnimatables(): IAnimatable[];
        dispose(forceDisposeEffect?: boolean): void;
        clone(name: string): anotherSkyMaterial;
        serialize(): any;
        getClassName(): string;
        static Parse(source: any, scene: Scene, rootUrl: string): anotherSkyMaterial;
    }
}
