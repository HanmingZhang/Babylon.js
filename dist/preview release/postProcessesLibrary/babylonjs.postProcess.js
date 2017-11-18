var globalObject = (typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this);
var babylonDependency = (globalObject && globalObject.BABYLON) || BABYLON || (typeof require !== 'undefined' && require("babylonjs"));
var BABYLON = babylonDependency;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
    /**
     * AsciiArtFontTexture is the helper class used to easily create your ascii art font texture.
     *
     * It basically takes care rendering the font front the given font size to a texture.
     * This is used later on in the postprocess.
     */
    var AsciiArtFontTexture = /** @class */ (function (_super) {
        __extends(AsciiArtFontTexture, _super);
        /**
         * Create a new instance of the Ascii Art FontTexture class
         * @param name the name of the texture
         * @param font the font to use, use the W3C CSS notation
         * @param text the caracter set to use in the rendering.
         * @param scene the scene that owns the texture
         */
        function AsciiArtFontTexture(name, font, text, scene) {
            if (scene === void 0) { scene = null; }
            var _this = _super.call(this, scene) || this;
            scene = _this.getScene();
            if (!scene) {
                return _this;
            }
            _this.name = name;
            _this._text == text;
            _this._font == font;
            _this.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
            _this.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            //this.anisotropicFilteringLevel = 1;
            // Get the font specific info.
            var maxCharHeight = _this.getFontHeight(font);
            var maxCharWidth = _this.getFontWidth(font);
            _this._charSize = Math.max(maxCharHeight.height, maxCharWidth);
            // This is an approximate size, but should always be able to fit at least the maxCharCount.
            var textureWidth = Math.ceil(_this._charSize * text.length);
            var textureHeight = _this._charSize;
            // Create the texture that will store the font characters.
            _this._texture = scene.getEngine().createDynamicTexture(textureWidth, textureHeight, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
            //scene.getEngine().setclamp
            var textureSize = _this.getSize();
            // Create a canvas with the final size: the one matching the texture.
            var canvas = document.createElement("canvas");
            canvas.width = textureSize.width;
            canvas.height = textureSize.height;
            var context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = font;
            context.fillStyle = "white";
            context.imageSmoothingEnabled = false;
            // Sets the text in the texture.
            for (var i = 0; i < text.length; i++) {
                context.fillText(text[i], i * _this._charSize, -maxCharHeight.offset);
            }
            // Flush the text in the dynamic texture.
            scene.getEngine().updateDynamicTexture(_this._texture, canvas, false, true);
            return _this;
        }
        Object.defineProperty(AsciiArtFontTexture.prototype, "charSize", {
            /**
             * Gets the size of one char in the texture (each char fits in size * size space in the texture).
             */
            get: function () {
                return this._charSize;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the max char width of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char width
         */
        AsciiArtFontTexture.prototype.getFontWidth = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.font = font;
            return ctx.measureText("W").width;
        };
        // More info here: https://videlais.com/2014/03/16/the-many-and-varied-problems-with-measuring-font-height-for-html5-canvas/
        /**
         * Gets the max char height of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char height
         */
        AsciiArtFontTexture.prototype.getFontHeight = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillRect(0, 0, fontDraw.width, fontDraw.height);
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText('jH|', 0, 0);
            var pixels = ctx.getImageData(0, 0, fontDraw.width, fontDraw.height).data;
            var start = -1;
            var end = -1;
            for (var row = 0; row < fontDraw.height; row++) {
                for (var column = 0; column < fontDraw.width; column++) {
                    var index = (row * fontDraw.width + column) * 4;
                    if (pixels[index] === 0) {
                        if (column === fontDraw.width - 1 && start !== -1) {
                            end = row;
                            row = fontDraw.height;
                            break;
                        }
                        continue;
                    }
                    else {
                        if (start === -1) {
                            start = row;
                        }
                        break;
                    }
                }
            }
            return { height: (end - start) + 1, offset: start - 1 };
        };
        /**
         * Clones the current AsciiArtTexture.
         * @return the clone of the texture.
         */
        AsciiArtFontTexture.prototype.clone = function () {
            return new AsciiArtFontTexture(this.name, this._font, this._text, this.getScene());
        };
        /**
         * Parses a json object representing the texture and returns an instance of it.
         * @param source the source JSON representation
         * @param scene the scene to create the texture for
         * @return the parsed texture
         */
        AsciiArtFontTexture.Parse = function (source, scene) {
            var texture = BABYLON.SerializationHelper.Parse(function () { return new AsciiArtFontTexture(source.name, source.font, source.text, scene); }, source, scene, null);
            return texture;
        };
        __decorate([
            BABYLON.serialize("font")
        ], AsciiArtFontTexture.prototype, "_font", void 0);
        __decorate([
            BABYLON.serialize("text")
        ], AsciiArtFontTexture.prototype, "_text", void 0);
        return AsciiArtFontTexture;
    }(BABYLON.BaseTexture));
    BABYLON.AsciiArtFontTexture = AsciiArtFontTexture;
    /**
     * AsciiArtPostProcess helps rendering everithing in Ascii Art.
     *
     * Simmply add it to your scene and let the nerd that lives in you have fun.
     * Example usage: var pp = new AsciiArtPostProcess("myAscii", "20px Monospace", camera);
     */
    var AsciiArtPostProcess = /** @class */ (function (_super) {
        __extends(AsciiArtPostProcess, _super);
        /**
         * Instantiates a new Ascii Art Post Process.
         * @param name the name to give to the postprocess
         * @camera the camera to apply the post process to.
         * @param options can either be the font name or an option object following the IAsciiArtPostProcessOptions format
         */
        function AsciiArtPostProcess(name, camera, options) {
            var _this = _super.call(this, name, 'asciiart', ['asciiArtFontInfos', 'asciiArtOptions'], ['asciiArtFont'], {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true) || this;
            /**
             * This defines the amount you want to mix the "tile" or character space colored in the ascii art.
             * This number is defined between 0 and 1;
             */
            _this.mixToTile = 0;
            /**
             * This defines the amount you want to mix the normal rendering pass in the ascii art.
             * This number is defined between 0 and 1;
             */
            _this.mixToNormal = 0;
            // Default values.
            var font = "40px Monospace";
            var characterSet = " `-.'_:,\"=^;<+!*?/cL\\zrs7TivJtC{3F)Il(xZfY5S2eajo14[nuyE]P6V9kXpKwGhqAUbOd8#HRDB0$mgMW&Q%N@";
            // Use options.
            if (options) {
                if (typeof (options) === "string") {
                    font = options;
                }
                else {
                    font = options.font || font;
                    characterSet = options.characterSet || characterSet;
                    _this.mixToTile = options.mixToTile || _this.mixToTile;
                    _this.mixToNormal = options.mixToNormal || _this.mixToNormal;
                }
            }
            _this._asciiArtFontTexture = new AsciiArtFontTexture(name, font, characterSet, camera.getScene());
            var textureSize = _this._asciiArtFontTexture.getSize();
            _this.onApply = function (effect) {
                effect.setTexture("asciiArtFont", _this._asciiArtFontTexture);
                effect.setFloat4("asciiArtFontInfos", _this._asciiArtFontTexture.charSize, characterSet.length, textureSize.width, textureSize.height);
                effect.setFloat4("asciiArtOptions", _this.width, _this.height, _this.mixToNormal, _this.mixToTile);
            };
            return _this;
        }
        return AsciiArtPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.AsciiArtPostProcess = AsciiArtPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.asciiArtPostProcess.js.map

BABYLON.Effect.ShadersStore['asciiartPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D asciiArtFont;\n\nuniform vec4 asciiArtFontInfos;\nuniform vec4 asciiArtOptions;\n\nfloat getLuminance(vec3 color)\n{\nreturn clamp(dot(color,vec3(0.2126,0.7152,0.0722)),0.,1.);\n}\n\nvoid main(void) \n{\nfloat caracterSize=asciiArtFontInfos.x;\nfloat numChar=asciiArtFontInfos.y-1.0;\nfloat fontx=asciiArtFontInfos.z;\nfloat fonty=asciiArtFontInfos.w;\nfloat screenx=asciiArtOptions.x;\nfloat screeny=asciiArtOptions.y;\nfloat tileX=float(floor((gl_FragCoord.x)/caracterSize))*caracterSize/screenx;\nfloat tileY=float(floor((gl_FragCoord.y)/caracterSize))*caracterSize/screeny;\nvec2 tileUV=vec2(tileX,tileY);\nvec4 tileColor=texture2D(textureSampler,tileUV);\nvec4 baseColor=texture2D(textureSampler,vUV);\nfloat tileLuminance=getLuminance(tileColor.rgb);\nfloat offsetx=(float(floor(tileLuminance*numChar)))*caracterSize/fontx;\nfloat offsety=0.0;\nfloat x=float(mod(gl_FragCoord.x,caracterSize))/fontx;\nfloat y=float(mod(gl_FragCoord.y,caracterSize))/fonty;\nvec4 finalColor=texture2D(asciiArtFont,vec2(offsetx+x,offsety+(caracterSize/fonty-y)));\nfinalColor.rgb*=tileColor.rgb;\nfinalColor.a=1.0;\nfinalColor=mix(finalColor,tileColor,asciiArtOptions.w);\nfinalColor=mix(finalColor,baseColor,asciiArtOptions.z);\ngl_FragColor=finalColor;\n}";




var BABYLON;
(function (BABYLON) {
    /**
     * DigitalRainFontTexture is the helper class used to easily create your digital rain font texture.
     *
     * It basically takes care rendering the font front the given font size to a texture.
     * This is used later on in the postprocess.
     */
    var DigitalRainFontTexture = /** @class */ (function (_super) {
        __extends(DigitalRainFontTexture, _super);
        /**
         * Create a new instance of the Digital Rain FontTexture class
         * @param name the name of the texture
         * @param font the font to use, use the W3C CSS notation
         * @param text the caracter set to use in the rendering.
         * @param scene the scene that owns the texture
         */
        function DigitalRainFontTexture(name, font, text, scene) {
            if (scene === void 0) { scene = null; }
            var _this = _super.call(this, scene) || this;
            scene = _this.getScene();
            if (!scene) {
                return _this;
            }
            _this.name = name;
            _this._text == text;
            _this._font == font;
            _this.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
            _this.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
            //this.anisotropicFilteringLevel = 1;
            // Get the font specific info.
            var maxCharHeight = _this.getFontHeight(font);
            var maxCharWidth = _this.getFontWidth(font);
            _this._charSize = Math.max(maxCharHeight.height, maxCharWidth);
            // This is an approximate size, but should always be able to fit at least the maxCharCount.
            var textureWidth = _this._charSize;
            var textureHeight = Math.ceil(_this._charSize * text.length);
            // Create the texture that will store the font characters.
            _this._texture = scene.getEngine().createDynamicTexture(textureWidth, textureHeight, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
            //scene.getEngine().setclamp
            var textureSize = _this.getSize();
            // Create a canvas with the final size: the one matching the texture.
            var canvas = document.createElement("canvas");
            canvas.width = textureSize.width;
            canvas.height = textureSize.height;
            var context = canvas.getContext("2d");
            context.textBaseline = "top";
            context.font = font;
            context.fillStyle = "white";
            context.imageSmoothingEnabled = false;
            // Sets the text in the texture.
            for (var i = 0; i < text.length; i++) {
                context.fillText(text[i], 0, i * _this._charSize - maxCharHeight.offset);
            }
            // Flush the text in the dynamic texture.
            scene.getEngine().updateDynamicTexture(_this._texture, canvas, false, true);
            return _this;
        }
        Object.defineProperty(DigitalRainFontTexture.prototype, "charSize", {
            /**
             * Gets the size of one char in the texture (each char fits in size * size space in the texture).
             */
            get: function () {
                return this._charSize;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets the max char width of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char width
         */
        DigitalRainFontTexture.prototype.getFontWidth = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.font = font;
            return ctx.measureText("W").width;
        };
        // More info here: https://videlais.com/2014/03/16/the-many-and-varied-problems-with-measuring-font-height-for-html5-canvas/
        /**
         * Gets the max char height of a font.
         * @param font the font to use, use the W3C CSS notation
         * @return the max char height
         */
        DigitalRainFontTexture.prototype.getFontHeight = function (font) {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            ctx.fillRect(0, 0, fontDraw.width, fontDraw.height);
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = font;
            ctx.fillText('jH|', 0, 0);
            var pixels = ctx.getImageData(0, 0, fontDraw.width, fontDraw.height).data;
            var start = -1;
            var end = -1;
            for (var row = 0; row < fontDraw.height; row++) {
                for (var column = 0; column < fontDraw.width; column++) {
                    var index = (row * fontDraw.width + column) * 4;
                    if (pixels[index] === 0) {
                        if (column === fontDraw.width - 1 && start !== -1) {
                            end = row;
                            row = fontDraw.height;
                            break;
                        }
                        continue;
                    }
                    else {
                        if (start === -1) {
                            start = row;
                        }
                        break;
                    }
                }
            }
            return { height: (end - start) + 1, offset: start - 1 };
        };
        /**
         * Clones the current DigitalRainFontTexture.
         * @return the clone of the texture.
         */
        DigitalRainFontTexture.prototype.clone = function () {
            return new DigitalRainFontTexture(this.name, this._font, this._text, this.getScene());
        };
        /**
         * Parses a json object representing the texture and returns an instance of it.
         * @param source the source JSON representation
         * @param scene the scene to create the texture for
         * @return the parsed texture
         */
        DigitalRainFontTexture.Parse = function (source, scene) {
            var texture = BABYLON.SerializationHelper.Parse(function () { return new DigitalRainFontTexture(source.name, source.font, source.text, scene); }, source, scene, null);
            return texture;
        };
        __decorate([
            BABYLON.serialize("font")
        ], DigitalRainFontTexture.prototype, "_font", void 0);
        __decorate([
            BABYLON.serialize("text")
        ], DigitalRainFontTexture.prototype, "_text", void 0);
        return DigitalRainFontTexture;
    }(BABYLON.BaseTexture));
    BABYLON.DigitalRainFontTexture = DigitalRainFontTexture;
    /**
     * DigitalRainPostProcess helps rendering everithing in digital rain.
     *
     * Simmply add it to your scene and let the nerd that lives in you have fun.
     * Example usage: var pp = new DigitalRainPostProcess("digitalRain", "20px Monospace", camera);
     */
    var DigitalRainPostProcess = /** @class */ (function (_super) {
        __extends(DigitalRainPostProcess, _super);
        /**
         * Instantiates a new Digital Rain Post Process.
         * @param name the name to give to the postprocess
         * @camera the camera to apply the post process to.
         * @param options can either be the font name or an option object following the IDigitalRainPostProcessOptions format
         */
        function DigitalRainPostProcess(name, camera, options) {
            var _this = _super.call(this, name, 'digitalrain', ['digitalRainFontInfos', 'digitalRainOptions', 'cosTimeZeroOne', 'matrixSpeed'], ['digitalRainFont'], {
                width: camera.getEngine().getRenderWidth(),
                height: camera.getEngine().getRenderHeight()
            }, camera, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, camera.getEngine(), true) || this;
            /**
             * This defines the amount you want to mix the "tile" or caracter space colored in the digital rain.
             * This number is defined between 0 and 1;
             */
            _this.mixToTile = 0;
            /**
             * This defines the amount you want to mix the normal rendering pass in the digital rain.
             * This number is defined between 0 and 1;
             */
            _this.mixToNormal = 0;
            // Default values.
            var font = "15px Monospace";
            var characterSet = "古池や蛙飛び込む水の音ふるいけやかわずとびこむみずのおと初しぐれ猿も小蓑をほしげ也はつしぐれさるもこみのをほしげなり江戸の雨何石呑んだ時鳥えどのあめなんごくのんだほととぎす";
            // Use options.
            if (options) {
                if (typeof (options) === "string") {
                    font = options;
                }
                else {
                    font = options.font || font;
                    _this.mixToTile = options.mixToTile || _this.mixToTile;
                    _this.mixToNormal = options.mixToNormal || _this.mixToNormal;
                }
            }
            _this._digitalRainFontTexture = new DigitalRainFontTexture(name, font, characterSet, camera.getScene());
            var textureSize = _this._digitalRainFontTexture.getSize();
            var alpha = 0.0;
            var cosTimeZeroOne = 0.0;
            var matrix = new BABYLON.Matrix();
            for (var i = 0; i < 16; i++) {
                matrix.m[i] = Math.random();
            }
            _this.onApply = function (effect) {
                effect.setTexture("digitalRainFont", _this._digitalRainFontTexture);
                effect.setFloat4("digitalRainFontInfos", _this._digitalRainFontTexture.charSize, characterSet.length, textureSize.width, textureSize.height);
                effect.setFloat4("digitalRainOptions", _this.width, _this.height, _this.mixToNormal, _this.mixToTile);
                effect.setMatrix("matrixSpeed", matrix);
                alpha += 0.003;
                cosTimeZeroOne = alpha;
                effect.setFloat('cosTimeZeroOne', cosTimeZeroOne);
            };
            return _this;
        }
        return DigitalRainPostProcess;
    }(BABYLON.PostProcess));
    BABYLON.DigitalRainPostProcess = DigitalRainPostProcess;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.digitalRainPostProcess.js.map

BABYLON.Effect.ShadersStore['digitalrainPixelShader'] = "\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D digitalRainFont;\n\nuniform vec4 digitalRainFontInfos;\nuniform vec4 digitalRainOptions;\nuniform mat4 matrixSpeed;\nuniform float cosTimeZeroOne;\n\nfloat getLuminance(vec3 color)\n{\nreturn clamp(dot(color,vec3(0.2126,0.7152,0.0722)),0.,1.);\n}\n\nvoid main(void) \n{\nfloat caracterSize=digitalRainFontInfos.x;\nfloat numChar=digitalRainFontInfos.y-1.0;\nfloat fontx=digitalRainFontInfos.z;\nfloat fonty=digitalRainFontInfos.w;\nfloat screenx=digitalRainOptions.x;\nfloat screeny=digitalRainOptions.y;\nfloat ratio=screeny/fonty;\nfloat columnx=float(floor((gl_FragCoord.x)/caracterSize));\nfloat tileX=float(floor((gl_FragCoord.x)/caracterSize))*caracterSize/screenx;\nfloat tileY=float(floor((gl_FragCoord.y)/caracterSize))*caracterSize/screeny;\nvec2 tileUV=vec2(tileX,tileY);\nvec4 tileColor=texture2D(textureSampler,tileUV);\nvec4 baseColor=texture2D(textureSampler,vUV);\nfloat tileLuminance=getLuminance(tileColor.rgb);\nint st=int(mod(columnx,4.0));\nfloat speed=cosTimeZeroOne*(sin(tileX*314.5)*0.5+0.6); \nfloat x=float(mod(gl_FragCoord.x,caracterSize))/fontx;\nfloat y=float(mod(speed+gl_FragCoord.y/screeny,1.0));\ny*=ratio;\nvec4 finalColor=texture2D(digitalRainFont,vec2(x,1.0-y));\nvec3 high=finalColor.rgb*(vec3(1.2,1.2,1.2)*pow(1.0-y,30.0));\nfinalColor.rgb*=vec3(pow(tileLuminance,5.0),pow(tileLuminance,1.5),pow(tileLuminance,3.0));\nfinalColor.rgb+=high;\nfinalColor.rgb=clamp(finalColor.rgb,0.,1.);\nfinalColor.a=1.0;\nfinalColor=mix(finalColor,tileColor,digitalRainOptions.w);\nfinalColor=mix(finalColor,baseColor,digitalRainOptions.z);\ngl_FragColor=finalColor;\n}";



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


(function universalModuleDefinition(root, factory) {
                var f = factory();
                if (root && root["BABYLON"]) {
                    return;
                }
                
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = f;
    else if(typeof define === 'function' && define.amd)
        define(["BJSPostProcess"], factory);
    else if(typeof exports === 'object')
        exports["BJSPostProcess"] = f;
    else {
        root["BABYLON"] = f;
    }
})(this, function() {
    return BABYLON;
});
