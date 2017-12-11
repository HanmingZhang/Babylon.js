#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif

precision highp float;

uniform vec3 vEyePosition;
uniform vec3 vAmbientColor;

uniform vec4 vDiffuseColor;
uniform vec4 vSpecularColor;


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
#ifdef DIFFUSE
	varying vec2 vDiffuseUV;
	uniform sampler2D diffuseSampler;
    uniform mat4 diffuseMatrix;
    uniform vec2 vDiffuseInfos;
#endif



// Reflection
#ifdef REFLECTION
uniform sampler2D reflectionSampler;
varying vec3 vReflectionMapTexCoord;
varying vec3 vPosition;
#endif

#include<bumpFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>


uniform sampler2D raindropSampler;
varying vec2 vRaindropUV;


uniform sampler2D groundHeightSampler;
varying vec2 vRaindropGroundHeightUV;

uniform sampler2D groundNormalSampler;
varying vec2 vRaindropGroundNormalUV;

uniform sampler2D waterNormalSampler;
varying vec2 vRaindropWaterNormalUV;

uniform float time;

uniform float raindropPuddleAmount;
uniform float raindropSpeed;
uniform float raindropSize;
uniform float raindropRippleNormalIntensity;


// For raindrop ripple effect
vec4 flipBookEffect(float inputAnimationPhase, float rows, float columns, vec2 uv){
    float fractPart = fract(inputAnimationPhase);
    vec2  fractPartVec2 = vec2(fractPart, fractPart);

    vec2 tmpVec2  = vec2(columns, rows);
    vec2 tmp2Vec2 = vec2(columns * rows, rows);

    vec2 fractResultVec2 = tmp2Vec2 * fractPartVec2;
    fractResultVec2 = floor(fractResultVec2);

    // Map to certain animation phase
    vec2 resultUV = (uv / tmpVec2) + (fractResultVec2 / tmpVec2);

    // Since texture is stored in a reverse way, reverse v direction here
    resultUV.y = 1.0 - resultUV.y;

    return texture2D(raindropSampler, resultUV);
}



// vec3 blendAngleCorrectedNormals(vec3 baseNormal, vec3 additionalNormal){
//     vec3 tmp1 = baseNormal;
//     vec3 tmp2 = additionalNormal;

//     tmp1.z += 1.0;

//     tmp2.x *= -1.0;
//     tmp2.y *= -1.0;

//     return  dot(tmp1, tmp2) * tmp1 - tmp1.z * tmp2;
// }


void main(void) {
#include<clipPlaneFragment>

	vec3 viewDirectionW = normalize(vEyePosition - vPositionW);

	// Base color
	vec4 baseColor = vec4(1., 1., 1., 1.);
	vec3 diffuseColor = vDiffuseColor.rgb;

	// Alpha
	float alpha = vDiffuseColor.a;


    // -------------- FlipBook Effect ------------------
    // default 25.0
    // larger -> faster
    float raindropsTimeScale = raindropSpeed;

    // smaller -> less ripples but larger size
    // larger  -> more ripples but smaller size
    float raindropsUVScale = 12.0 - min(max(2.0, raindropSize), 10.0);

    vec2 inputUV = vec2(1.0 - vRaindropUV.x, vRaindropUV.y);

    // To make texture seamless, need to fract UV before pass it in
    // 8.0 are fixed number by our texture
    vec4 raindropsNormal = flipBookEffect(raindropsTimeScale * time, 8.0, 8.0, fract(raindropsUVScale * inputUV));

    raindropsNormal.x *= 5.0;
    raindropsNormal.y *= 5.0;

    // filpBook normal debug
    //vec4 color = vec4(raindropsNormal, alpha);
    //bump UV debug
    //vec4 color = vec4(inputUV, 0.0, 1.0);

    baseColor = raindropsNormal;

    
    // -------------- Water Puddle Mask------------------
    // TODO : extract this as parameter
    float puddleNoiseScale = 0.02;

    // only retrive red channel
    float noiseValue = texture2D(groundHeightSampler, puddleNoiseScale * (vRaindropGroundHeightUV)).r;

    // default 2.0
    // 0.0 -> pure water
    // 6.0 -> pure ground
    float puddleAmount = raindropPuddleAmount;

    float noiseResult = pow(noiseValue * puddleAmount, 20.0);

    //vec3 noiseColor = noiseResult * texture2D(groundHeightSampler, (vRaindropGroundHeightUV)).rgb;
    noiseResult = noiseResult * texture2D(groundHeightSampler, (vRaindropGroundHeightUV)).r;
    noiseResult = clamp(noiseResult, 0.0, 1.0);

    // -------------- Lerp ground normal ------------------
    vec3 groundNormalCol = texture2D(groundNormalSampler, vRaindropGroundNormalUV).rgb;
    vec3 normalW = normalize(vNormalW);

    // lerp ground normal and 0,0,1 using noiseColor
    normalW.r = mix(normalW.r, groundNormalCol.r, noiseResult);
    normalW.g = mix(normalW.g, groundNormalCol.g, noiseResult);
    normalW.b = mix(normalW.b, groundNormalCol.b, noiseResult);
    // remember to normalize after lerp
    normalW = normalize(normalW);

    // lerp with raindrop water
    vec3 waterNormalCol = texture2D(waterNormalSampler, vRaindropWaterNormalUV).rgb;
    waterNormalCol = normalize(waterNormalCol);

    normalW = normalW + waterNormalCol;
    normalW = normalize(normalW);

    // blend raindrop and ground normal
    //normalW = blendAngleCorrectedNormals(normalW, normalize(raindropsNormal.rgb));

    // should between 0.0 - 3.0
    // default value is 1.0
    float raindropsNormalIntensity = raindropRippleNormalIntensity;
    normalW = normalW + raindropsNormalIntensity * normalize(raindropsNormal.rgb);
    // remember to normalize after lerp
    normalW = normalize(normalW);


#ifdef VERTEXCOLOR
	baseColor.rgb *= vColor.rgb;
#endif

	// Bump
    float bumpHeight = 1.2;
#ifdef NORMAL
    //vec2 perturbation = bumpHeight * (baseColor.rg - 0.5);
    vec2 perturbation = bumpHeight * (normalW.rg - 0.5);

	//vec3 normalW = normalize(vNormalW);
#else
    vec2 perturbation = bumpHeight * (vec2(1.0, 1.0) - 0.5);
	normalW = normalize(-cross(dFdx(vPositionW), dFdy(vPositionW)));
#endif


#include<bumpFragment>

    // must normalized before used
    //normalW = normalize(raindropsNormal.rgb);



#ifdef DIFFUSE
	//baseColor = texture2D(diffuseSampler, vDiffuseUV + uvOffset);
    baseColor = texture2D(diffuseSampler, vDiffuseUV);


	#ifdef ALPHATEST
		if (baseColor.a < 0.4)
			discard;
	#endif

	#ifdef ALPHAFROMDIFFUSE
		alpha *= baseColor.a;
	#endif

	baseColor.rgb *= vDiffuseInfos.y;
#endif



// Refraction
	vec3 refractionColor = vec3(0., 0., 0.);

// #ifdef REFRACTION

// #endif

	// Reflection
	vec3 reflectionColor = vec3(0., 0., 0.);

#ifdef REFLECTION
    float colorBlendFactor = 0.8;

    // Raindrop
    vec3 eyeVector = normalize(vEyePosition - vPosition);
    vec4 waterColor = vec4(0.28, 0.28, 0.28, 1.0);

    vec4 refractiveColor = vec4(0.0, 0.0, 0.0, 1.0);
    //vec2 projectedRefractionTexCoords = clamp(vRefractionMapTexCoord.xy / vRefractionMapTexCoord.z + perturbation, 0.0, 1.0);
    //vec4 refractiveColor = texture2D(refractionSampler, projectedRefractionTexCoords);

    vec2 projectedReflectionTexCoords = clamp(vReflectionMapTexCoord.xy / vReflectionMapTexCoord.z + perturbation, 0.0, 1.0);
    vec4 reflectiveColor = texture2D(reflectionSampler, projectedReflectionTexCoords);

    // vec3 upVector = vec3(0.0, 1.0, 0.0);

    // float fresnelTerm = max(dot(eyeVector, upVector), 0.0);

    // vec4 combinedColor = refractiveColor * fresnelTerm + reflectiveColor * (1.0 - fresnelTerm);
    
    // combinedColor = colorBlendFactor * waterColor + (1.0 - colorBlendFactor) * combinedColor;

    //baseColor = colorBlendFactor * waterColor + (1.0 - colorBlendFactor) * combinedColor;
#endif


#include<depthPrePass>

#ifdef VERTEXCOLOR
	baseColor.rgb *= vColor.rgb;
#endif



	// Specular map
#ifdef SPECULARTERM
	float glossiness = vSpecularColor.a;
	vec3 specularColor = vSpecularColor.rgb;

#ifdef SPECULAR
	vec4 specularMapColor = texture2D(specularSampler, vSpecularUV + uvOffset);
	specularColor = specularMapColor.rgb;
#ifdef GLOSSINESS
	glossiness = glossiness * specularMapColor.a;
#endif
#endif
#else
	float glossiness = 0.;
#endif

	// Lighting
	vec3 diffuseBase = vec3(0., 0., 0.);
	lightingInfo info;
#ifdef SPECULARTERM
	vec3 specularBase = vec3(0., 0., 0.);
#endif
	float shadow = 1.;


#include<lightFragment>[0..maxSimultaneousLights]

	
#ifdef VERTEXALPHA
	alpha *= vColor.a;
#endif

	// Composition
	vec3 finalDiffuse = clamp(diffuseBase * diffuseColor + vAmbientColor, 0.0, 1.0) * baseColor.rgb;
    //vec3 finalDiffuse = clamp(baseColor.rgb, 0.0, 1.0);

#ifdef SPECULARTERM
	vec3 finalSpecular = specularBase * specularColor;
	#ifdef SPECULAROVERALPHA
		alpha = clamp(alpha + dot(finalSpecular, vec3(0.3, 0.59, 0.11)), 0., 1.);
	#endif
#else
	vec3 finalSpecular = vec3(0.0);
#endif


	// Composition
	//vec4 color = vec4(finalDiffuse + finalSpecular + reflectionColor + refractionColor, alpha);
    vec4 color = vec4(finalDiffuse + finalSpecular + (1.0 - noiseResult) * colorBlendFactor * waterColor.rgb * reflectiveColor.rgb, alpha);
    //vec4 color = vec4(finalDiffuse + finalSpecular, alpha);


#include<logDepthFragment>
#include<fogFragment>


	gl_FragColor = color;

    //gl_FragColor = reflectiveColor;
    //gl_FragColor = vec4(noiseColor, 1.0);
}