precision highp float;


// Attributes
attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif

uniform mat4 worldReflectionViewProjection;
uniform mat4 viewProjection;

#include<helperFunctions>

#include<bonesDeclaration>

// Uniforms
#include<instancesDeclaration>

// #ifdef MAINUV1
// 	varying vec2 vMainUV1;
// #endif

// #ifdef MAINUV2
// 	varying vec2 vMainUV2;
// #endif

#if defined(DIFFUSE)
varying vec2 vDiffuseUV;
#endif

// #if defined(AMBIENT) && AMBIENTDIRECTUV == 0
// varying vec2 vAmbientUV;
// #endif

// #if defined(OPACITY) && OPACITYDIRECTUV == 0
// varying vec2 vOpacityUV;
// #endif

// #if defined(EMISSIVE) && EMISSIVEDIRECTUV == 0
// varying vec2 vEmissiveUV;
// #endif

// #if defined(LIGHTMAP) && LIGHTMAPDIRECTUV == 0
// varying vec2 vLightmapUV;
// #endif

// #if defined(SPECULAR) && defined(SPECULARTERM) && SPECULARDIRECTUV == 0
// varying vec2 vSpecularUV;
// #endif

#if defined(BUMP)
varying vec2 vBumpUV;
#endif

// Output
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<bumpVertexDeclaration>

#include<clipPlaneVertexDeclaration>

#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]

// #include<morphTargetsVertexGlobalDeclaration>
// #include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]

// #ifdef REFLECTIONMAP_SKYBOX
// varying vec3 vPositionUVW;
// #endif

// #if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
// varying vec3 vDirectionW;
// #endif

uniform float time;

uniform mat4 raindropMatrix;
varying vec2 vRaindropUV;

uniform mat4 groundHeightMatrix;
varying vec2 vRaindropGroundHeightUV;

uniform mat4 groundNormalMatrix;
varying vec2 vRaindropGroundNormalUV;

uniform mat4 waterNormalMatrix;
varying vec2 vRaindropWaterNormalUV;

#ifdef DIFFUSE
uniform mat4 diffuseMatrix;
uniform vec2 vDiffuseInfos;
#endif


#ifdef REFLECTION
// raindrop reflection
varying vec3 vPosition;
varying vec3 vReflectionMapTexCoord;
#endif

#include<logDepthDeclaration>



void main(void) {
// 	vec3 positionUpdated = position;
// #ifdef NORMAL	
// 	vec3 normalUpdated = normal;
// #endif
// #ifdef TANGENT
// 	vec4 tangentUpdated = tangent;
// #endif

// #include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]

// #ifdef REFLECTIONMAP_SKYBOX
// 	vPositionUVW = positionUpdated;
// #endif 

#include<instancesVertex>
#include<bonesVertex>

	gl_Position = viewProjection * finalWorld * vec4(position, 1.0);

	vec4 worldPos = finalWorld * vec4(position, 1.0);
	vPositionW = vec3(worldPos);

#ifdef NORMAL
	vNormalW = normalize(vec3(finalWorld * vec4(normal, 0.0)));
#endif

// #if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)
// 	vDirectionW = normalize(vec3(finalWorld * vec4(positionUpdated, 0.0)));
// #endif

	// Texture coordinates
#ifndef UV1
	vec2 uv = vec2(0., 0.);
#endif
#ifndef UV2
	vec2 uv2 = vec2(0., 0.);
#endif

// #ifdef MAINUV1
// 	vMainUV1 = uv;
// #endif

// #ifdef MAINUV2
// 	vMainUV2 = uv2;
// #endif

#if defined(DIFFUSE)
	if (vDiffuseInfos.x == 0.)
	{
		vDiffuseUV = vec2(diffuseMatrix * vec4(uv, 1.0, 0.0));
	}
	else
	{
		vDiffuseUV = vec2(diffuseMatrix * vec4(uv2, 1.0, 0.0));
	}
#endif


#if defined(BUMP)
	if (vBumpInfos.x == 0.)
	{
		vBumpUV = vec2(bumpMatrix * vec4(uv, 1.0, 0.0));
	}
	else
	{
		vBumpUV = vec2(bumpMatrix * vec4(uv2, 1.0, 0.0));
	}
#endif

	vRaindropUV = vec2(raindropMatrix * vec4(uv, 1.0, 0.0));

	vRaindropGroundHeightUV = vec2(groundHeightMatrix * vec4(uv, 1.0, 0.0));

	vRaindropGroundNormalUV = vec2(groundNormalMatrix * vec4(uv, 1.0, 0.0));

	float raindropWaterNormalUVScale = 12.0;

	vRaindropWaterNormalUV = vec2(waterNormalMatrix * vec4((uv * raindropWaterNormalUVScale) + time * vec2(10.0, 10.0), 1.0, 0.0));


#include<bumpVertex>
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]

#ifdef VERTEXCOLOR
	// Vertex color
	vColor = color;
#endif

#include<pointCloudVertex>

#ifdef REFLECTION
	// Water
	vPosition = position;
	
	worldPos = worldReflectionViewProjection * vec4(position, 1.0);
	vReflectionMapTexCoord.x = 0.5 * (worldPos.w + worldPos.x);
	vReflectionMapTexCoord.y = 0.5 * (worldPos.w + worldPos.y);
	vReflectionMapTexCoord.z = worldPos.w;
#endif


#include<logDepthVertex>
}