precision highp float;

// Constants
uniform vec3 vEyePosition;
uniform vec4 vDiffuseColor;

#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif

// Input
varying vec3 vPositionW;

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

uniform float tileSize;

// Helper functions
#include<helperFunctions>

// Lights
#include<__decl__lightFragment>[0..maxSimultaneousLights]

// Samplers
#ifdef DIFFUSE
varying vec2 vDiffuseUV;
uniform sampler2D diffuseSampler;
#ifdef BUMPY
uniform sampler2D normalSampler;
#endif
#endif

#ifdef DIFFUSEX
varying vec2 vTextureUVX;
uniform sampler2D diffuseSamplerX;
#ifdef BUMPX
uniform sampler2D normalSamplerX;
#endif
#endif

#ifdef DIFFUSEY
varying vec2 vTextureUVY;
uniform sampler2D diffuseSamplerY;
#ifdef BUMPY
uniform sampler2D normalSamplerY;
#endif
#endif

#ifdef DIFFUSEZ
varying vec2 vTextureUVZ;
uniform sampler2D diffuseSamplerZ;
#ifdef BUMPZ
uniform sampler2D normalSamplerZ;
#endif
#endif

#ifdef DIFFUSENOISE
//varying vec2 vTextureUVN;
uniform sampler2D perlinNoiseSampler;
uniform float noiseSize;
#endif

#ifdef NORMAL
varying mat3 tangentSpace;
#endif

uniform float time;
varying float finalnoise;
varying float normaly;

#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<fogFragmentDeclaration>

float becomesnowtime(float time)
{
	return sin(min(time* finalnoise/*texture2D(perlinNoiseSampler, vTextureUVN).r*/,1.57)) * normaly;//*finalnoise;
}

#ifdef DIFFUSENOISE

float becomesnowtimetexture(float time)
{
// #ifdef DIFFUSE
// 	return sin(min(time/2.* texture2D(perlinNoiseSampler, vDiffuseUV/0.1).r,1.57)) * normaly;//*finalnoise;
// #else
	return sin(min(time/2.* texture2D(perlinNoiseSampler, vTextureUVY).r,1.57)) * normaly;//*finalnoise;
// #endif
}
#endif

void main(void) {
	// Clip plane
	#include<clipPlaneFragment>

	vec3 viewDirectionW = normalize(vEyePosition - vPositionW);

	// Base color
	vec4 baseColor = vec4(0., 0., 0., 1.);
	vec3 diffuseColor = vDiffuseColor.rgb;

	// Alpha
	float alpha = vDiffuseColor.a;
	
	// Bump
#ifdef NORMAL
	vec3 normalW = tangentSpace[2];
#else
	vec3 normalW = vec3(1.0, 1.0, 1.0);
#endif

	vec4 baseNormal = vec4(0.0, 0.0, 0.0, 1.0);
	normalW *= normalW;

	vec4 temp;
#ifdef DIFFUSENOISE
	float t = becomesnowtimetexture(time);
#else
	float t = becomesnowtime(time);
#endif

#ifdef DIFFUSE

	baseColor += texture2D(diffuseSampler, vDiffuseUV);

	vec4 snowcolor = vec4(0., 0., 0., 1.);
	vec4 snownormal = vec4(0., 0., 0., 1.);
#ifdef DIFFUSEX
	snowcolor += texture2D(diffuseSamplerX, vTextureUVX) * normalW.x;
#ifdef BUMPX
	snownormal += texture2D(normalSamplerX, vTextureUVX) * normalW.x;
#endif
#endif//DIFFUSEX
#ifdef DIFFUSEY
	snowcolor += texture2D(diffuseSamplerY, vTextureUVY) * normalW.y;
#ifdef BUMPY
	snownormal += texture2D(normalSamplerY, vTextureUVY) * normalW.y;
#endif
#endif//DIFFUSEY
#ifdef DIFFUSEZ
	snowcolor += texture2D(diffuseSamplerZ, vTextureUVZ) * normalW.z;
#ifdef BUMPZ
	snownormal += texture2D(normalSamplerZ, vTextureUVZ) * normalW.z;
#endif
#endif//DIFFUSEZ
	baseColor = baseColor * (1.-t) + snowcolor * t;

#ifdef BUMP
	baseNormal += texture2D(normalSampler, vDiffuseUV);
	baseNormal = baseNormal * (1.-t) + snownormal * t;
#endif//BUMP

#else

#ifdef PUSHUP

#ifdef DIFFUSEX
	baseColor += texture2D(diffuseSamplerX, vTextureUVX) * normalW.x;
#ifdef BUMPX
	baseNormal += texture2D(normalSamplerX, vTextureUVX) * normalW.x;
#endif
#endif

#ifdef DIFFUSEY
	baseColor += texture2D(diffuseSamplerY, vTextureUVY) * normalW.y;
#ifdef BUMPY
	baseNormal += texture2D(normalSamplerY, vTextureUVY) * normalW.y;
#endif
#endif

#ifdef DIFFUSEZ
	baseColor += texture2D(diffuseSamplerZ, vTextureUVZ) * normalW.z;
#ifdef BUMPZ
	baseNormal += texture2D(normalSamplerZ, vTextureUVZ) * normalW.z;
#endif
#endif

#else

	//t*=0.5;

#ifdef DIFFUSEX
	temp = texture2D(diffuseSamplerX, vTextureUVX) * normalW.x * ( 1. - t)
	 + texture2D(diffuseSamplerY, vTextureUVX) * normalW.x * t;
	baseColor += temp;
#ifdef BUMPX
	temp = texture2D(normalSamplerX, vTextureUVX) * normalW.x * ( 1. - t)
	 + texture2D(normalSamplerY, vTextureUVX) * normalW.x * t;
	baseNormal += temp;
#endif
#endif

#ifdef DIFFUSEY
	temp = texture2D(diffuseSamplerX, vTextureUVY) * normalW.y * (1.-t)
	 + texture2D(diffuseSamplerY, vTextureUVY) * normalW.y * t;
	baseColor += temp;
#ifdef BUMPY
	temp = texture2D(normalSamplerX, vTextureUVY) * normalW.y * (1.-t)
	 + texture2D(normalSamplerY, vTextureUVY) * normalW.y * t;
	baseNormal += temp;
#endif
#endif

#ifdef DIFFUSEZ
	temp = texture2D(diffuseSamplerZ, vTextureUVZ) * normalW.z * (1.- t)
	 + texture2D(diffuseSamplerY, vTextureUVZ) * normalW.z * t;
	baseColor += temp;
#ifdef BUMPZ
	temp = texture2D(normalSamplerZ, vTextureUVZ) * normalW.z * (1.- t)
	 + texture2D(normalSamplerY, vTextureUVZ) * normalW.z * t;
	baseNormal += temp;
#endif
#endif

#endif//pushup

#endif//diffuse




#ifdef NORMAL
	normalW = normalize((2.0 * baseNormal.xyz - 1.0) * tangentSpace);
#endif

#ifdef ALPHATEST
	if (baseColor.a < 0.4)
		discard;
#endif

#include<depthPrePass>

#ifdef VERTEXCOLOR
	baseColor.rgb *= vColor.rgb;
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

#ifdef VERTEXALPHA
	//alpha *= vColor.a;
	alpha = abs(normalW.y);
#endif

#ifdef SPECULARTERM
	vec3 finalSpecular = specularBase * specularColor;
#else
	vec3 finalSpecular = vec3(0.0);
#endif

	vec3 finalDiffuse = clamp(diffuseBase * diffuseColor, 0.0, 1.0) * baseColor.rgb;
	// Composition
	vec4 color = vec4(finalDiffuse + finalSpecular, alpha);
	//color.a *= abs(normalW.y);


#include<fogFragment>

	gl_FragColor = color;
	//gl_FragColor.a = 0.0;
}
