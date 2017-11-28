
declare module BABYLON {
    class EdgeDetectionPostProcess extends PostProcess {
        private _edgeThickness;
        private _minEdgeThickness;
        private _maxEdgeThickness;
        constructor(name: string, camera: Camera, edgeThickness: number, sceneSampler: PostProcess);
    }
}


declare module BABYLON {
    class PosterizationPostProcess extends PostProcess {
        private _gamma;
        private _numColors;
        constructor(name: string, camera: Camera, gamma: number, numColors: number);
    }
}


declare module BABYLON {
    class paperPostProcess extends PostProcess {
        private _othertexture;
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}


declare module BABYLON {
    class kuwaharaPostProcess extends PostProcess {
        private _radius;
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}


declare module BABYLON {
    class framePostProcess extends PostProcess {
        private _othertexture;
        constructor(name: string, imgUrl: string, options: number | PostProcessOptions, camera: Camera, samplingMode?: number, engine?: Engine, reusable?: boolean);
    }
}
