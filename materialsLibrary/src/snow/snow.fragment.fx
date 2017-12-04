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

// Helper functions
#include<helperFunctions>

// Lights
#include<__decl__lightFragment>[0..maxSimultaneousLights]

// Samplers
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
varying vec2 vTextureUVN;
uniform sampler2D perlinNoiseSampler;
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
	return sin(min(time/10000.* finalnoise/*texture2D(perlinNoiseSampler, vTextureUVN).r*/,1.57)) * normaly;//*finalnoise;
}

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

#ifdef DIFFUSEX
	baseColor += texture2D(diffuseSamplerX, vTextureUVX) * normalW.x;
#ifdef BUMPX
	baseNormal += texture2D(normalSamplerX, vTextureUVX) * normalW.x;
#endif
#endif

#ifdef DIFFUSEY
//	baseColor += texture2D(diffuseSamplerY, vTextureUVY) * normalW.y;
	float t = becomesnowtime(time);
	vec4 temp = texture2D(diffuseSamplerX, vTextureUVY) * normalW.y * (1.-t)
	 + texture2D(diffuseSamplerY, vTextureUVY) * normalW.y * t;
	baseColor += temp;
#ifdef BUMPY
	temp = texture2D(normalSamplerX, vTextureUVY) * normalW.y * (1.-t)
	 + texture2D(normalSamplerY, vTextureUVY) * normalW.y * t;
	baseNormal += temp;
#endif
#endif

#ifdef DIFFUSEZ
	baseColor += texture2D(diffuseSamplerZ, vTextureUVZ) * normalW.z;
#ifdef BUMPZ
	baseNormal += texture2D(normalSamplerZ, vTextureUVZ) * normalW.z;
#endif
#endif

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
