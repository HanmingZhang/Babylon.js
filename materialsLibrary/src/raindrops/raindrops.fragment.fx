#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif

precision highp float;

// Constants
uniform vec3 vEyePosition;
uniform vec4 vDiffuseColor;

#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif

// Input
varying vec3 vPositionW;

#ifdef NORMAL
varying vec3 vNormalW;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

// Helper functions
#include<helperFunctions>

// Lights
#include<__decl__lightFragment>[0..maxSimultaneousLights]

#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>

// Samplers
#ifdef BUMP
varying vec2 vNormalUV;
varying vec2 vNormalUV2;
uniform sampler2D normalSampler;

uniform sampler2D raindropSampler;

uniform vec2 vNormalInfos;
#endif

uniform sampler2D refractionSampler;
uniform sampler2D reflectionSampler;

// Water uniforms
const float LOG2 = 1.442695;

uniform vec3 cameraPosition;

uniform vec4 raindropsColor;
uniform float colorBlendFactor;

uniform vec4 raindropsColor2;
uniform float colorBlendFactor2;

uniform float bumpHeight;

uniform float time;

// Water varyings
varying vec3 vRefractionMapTexCoord;
varying vec3 vReflectionMapTexCoord;
varying vec3 vPosition;

#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>

// Fog
#include<fogFragmentDeclaration>


#ifdef BUMP
vec3 blendAngleCorrectedNormal(vec3 baseNormal, vec3 additionalNormal){
    baseNormal.b += 1.0;
    additionalNormal.rg -= vec2(1.0, 1.0);

    vec3 tmp = additionalNormal;

    additionalNormal = baseNormal.b * additionalNormal;
    baseNormal = dot(baseNormal, tmp) * baseNormal;

    return baseNormal - additionalNormal;
}

vec4 flipBookEffect(float inputTime, float rows, float columns, vec2 uv){

    float speed = 0.2;

    float totalPages = rows * columns;

    float pageNumber = float(int(floor(inputTime / speed)) % int(totalPages));

    float row = floor(pageNumber / rows);
    float column =  pageNumber - row * rows;

    float u_unit = 1.0 / rows;
    float v_unit = 1.0 / columns;

    vec2 bookUV = vec2(uv.x / rows + row * u_unit,
                       uv.y / columns + column * v_unit);


    return texture2D(normalSampler, bookUV);
}


#endif

void main(void) {
	// Clip plane
    #include<clipPlaneFragment>

	vec3 viewDirectionW = normalize(vEyePosition - vPositionW);

	// Base color
	vec4 baseColor = vec4(1., 1., 1., 1.);
	vec3 diffuseColor = vDiffuseColor.rgb;

	// Alpha
	float alpha = vDiffuseColor.a;

#ifdef BUMP
    #ifdef BUMPSUPERIMPOSE
    	baseColor = 0.6 * texture2D(normalSampler, vNormalUV) + 0.4 * texture2D(normalSampler,vec2(vNormalUV2.x,vNormalUV2.y));
    #else
        //baseColor.rgb = texture2D(normalSampler, 0.05 * vNormalUV).rgb;
        
        baseColor.rgb = flipBookEffect(time * 250.0, 8.0, 8.0, 0.4 * vNormalUV).rgb;

    #endif

    //vec3 raindropWaveNormal = texture2D(raindropSampler, vNormalUV).rgb;

    //baseColor.rgb = blendAngleCorrectedNormal(baseColor.rgb, raindropWaveNormal);

	vec3 bumpColor = baseColor.rgb;

#ifdef ALPHATEST
	if (baseColor.a < 0.4)
		discard;
#endif

	baseColor.rgb *= vNormalInfos.y;
#else
	vec3 bumpColor = vec3(1.0);
#endif


#ifdef VERTEXCOLOR
	baseColor.rgb *= vColor.rgb;
#endif


#ifdef NORMAL
	vec2 perturbation = bumpHeight * (baseColor.rg - 0.5);
	#ifdef BUMPAFFECTSREFLECTION
	    vec3 normalW = normalize(vNormalW + vec3(perturbation.x*8.0,0.0,perturbation.y*8.0));
	    if (normalW.y<0.0) {
	        normalW.y = -normalW.y;
	    }
    #else
    	vec3 normalW = normalize(vNormalW);
	#endif
#else
	vec3 normalW = vec3(1.0, 1.0, 1.0);

	vec2 perturbation = bumpHeight * (vec2(1.0, 1.0) - 0.5);
#endif

#ifdef FRESNELSEPARATE
    #ifdef REFLECTION
        // Raindrops
        vec3 eyeVector = normalize(vEyePosition - vPosition);

        vec2 projectedRefractionTexCoords = clamp(vRefractionMapTexCoord.xy / vRefractionMapTexCoord.z + perturbation*0.5, 0.0, 1.0);
        vec4 refractiveColor = texture2D(refractionSampler, projectedRefractionTexCoords);

        vec2 projectedReflectionTexCoords = clamp(vec2(
            vReflectionMapTexCoord.x / vReflectionMapTexCoord.z + perturbation.x * 0.3,
            vReflectionMapTexCoord.y / vReflectionMapTexCoord.z + perturbation.y
        ),0.0, 1.0);

        vec4 reflectiveColor = texture2D(reflectionSampler, projectedReflectionTexCoords);

        vec3 upVector = vec3(0.0, 1.0, 0.0);

        float fresnelTerm = clamp(abs(pow(dot(eyeVector, upVector),3.0)),0.05,0.65);
        float IfresnelTerm = 1.0 - fresnelTerm;

        refractiveColor = colorBlendFactor*raindropsColor + (1.0-colorBlendFactor)*refractiveColor;
        reflectiveColor = IfresnelTerm*colorBlendFactor2*raindropsColor + (1.0-colorBlendFactor2*IfresnelTerm)*reflectiveColor;

        vec4 combinedColor = refractiveColor * fresnelTerm + reflectiveColor * IfresnelTerm;
        baseColor = combinedColor;
    #endif

    // Lighting
    vec3 diffuseBase = vec3(0., 0., 0.);
    lightingInfo info;
    float shadow = 1.;

    #ifdef SPECULARTERM
        float glossiness = vSpecularColor.a;
        vec3 specularBase = vec3(0., 0., 0.);
        vec3 specularColor = vSpecularColor.rgb;
    #else
        float glossiness = 0.;
    #endif

    #include<lightFragment>[0..maxSimultaneousLights]

    vec3 finalDiffuse = clamp(baseColor.rgb, 0.0, 1.0);

    #ifdef VERTEXALPHA
        alpha *= vColor.a;
    #endif

    #ifdef SPECULARTERM
        vec3 finalSpecular = specularBase * specularColor;
    #else
        vec3 finalSpecular = vec3(0.0);
    #endif


#else // !FRESNELSEPARATE
    #ifdef REFLECTION
        // Raindrops
        vec3 eyeVector = normalize(vEyePosition - vPosition);

        vec2 projectedRefractionTexCoords = clamp(vRefractionMapTexCoord.xy / vRefractionMapTexCoord.z + perturbation, 0.0, 1.0);
        vec4 refractiveColor = texture2D(refractionSampler, projectedRefractionTexCoords);

        vec2 projectedReflectionTexCoords = clamp(vReflectionMapTexCoord.xy / vReflectionMapTexCoord.z + perturbation, 0.0, 1.0);
        vec4 reflectiveColor = texture2D(reflectionSampler, projectedReflectionTexCoords);

        vec3 upVector = vec3(0.0, 1.0, 0.0);

        float fresnelTerm = max(dot(eyeVector, upVector), 0.0);

        vec4 combinedColor = refractiveColor * fresnelTerm + reflectiveColor * (1.0 - fresnelTerm);

        baseColor = colorBlendFactor * raindropsColor + (1.0 - colorBlendFactor) * combinedColor;
    #endif

    // Lighting
    vec3 diffuseBase = vec3(0., 0., 0.);
    lightingInfo info;
    float shadow = 1.;

    #ifdef SPECULARTERM
        float glossiness = vSpecularColor.a;
        vec3 specularBase = vec3(0., 0., 0.);
        vec3 specularColor = vSpecularColor.rgb;
    #else
        float glossiness = 0.;
    #endif

    #include<lightFragment>[0..maxSimultaneousLights]

    vec3 finalDiffuse = clamp(baseColor.rgb, 0.0, 1.0);


    #ifdef VERTEXALPHA
        alpha *= vColor.a;
    #endif

    #ifdef SPECULARTERM
        vec3 finalSpecular = specularBase * specularColor;
    #else
        vec3 finalSpecular = vec3(0.0);
    #endif

#endif

// Composition
vec4 color = vec4(finalDiffuse + finalSpecular, alpha);

#include<logDepthFragment>
#include<fogFragment>
	
	gl_FragColor = color;
}
