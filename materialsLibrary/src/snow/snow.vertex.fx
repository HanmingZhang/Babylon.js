precision highp float;

// Attributes
attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif

#include<bonesDeclaration>

// Uniforms
#include<instancesDeclaration>

uniform mat4 view;
uniform mat4 viewProjection;

#ifdef DIFFUSEX
varying vec2 vTextureUVX;
#endif

#ifdef DIFFUSEY
varying vec2 vTextureUVY;
#endif

#ifdef DIFFUSEZ
varying vec2 vTextureUVZ;
#endif

#ifdef DIFFUSENOISE
varying vec2 vTextureUVN;
#endif

uniform float tileSize;
uniform float noiseSize;

#ifdef POINTSIZE
uniform float pointSize;
#endif

// Output
varying vec3 vPositionW;
#ifdef NORMAL
varying mat3 tangentSpace;
#endif

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<clipPlaneVertexDeclaration>

#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]

uniform float time;

varying float finalnoise;
varying float normaly;

//float noisesize = 25.0;
float translationSpeed = 0.0;

float r(float n)
{
 	return fract(cos(n * 89.42) * 343.42);
}

vec2 r(vec2 n)
{
 	return vec2(r(n.x * 23.62 - 300.0 + n.y * 34.35), r(n.x * 45.13 + 256.0 + n.y * 38.89)); 
}

float worley(vec2 n,float s)
{
    float dis = 1.0;
    for(int x = -1; x <= 1; x++)
    {
        for(int y = -1; y <= 1; y++)
        {
            vec2 p = floor(n / s) + vec2(x, y);
            float d = length(r(p) + vec2(x, y) - fract(n / s));

            if (dis > d)
             	dis = d;
        }
    }
    return 1.0 - dis;
}

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float perlinNoise(vec3 p)
{
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    
    vec3 w = pf * pf * (3.0 - 2.0 * pf);
    
    return 	mix(
        		mix(
                	mix(
                        dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))), 
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x
                    ),
                	mix(
                        dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))), 
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x
                    ),
                    w.z
                ),
        		mix(
                    mix(
                        dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))), 
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x
                    ),
                   	mix(
                        dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))), 
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x
                    ),
                    w.z
                ),
                w.y
            );
}



float zerotofive(float normaly)
{
	//return 0.5 + max(0.,normaly) * 0.5;
	/*if (abs(normaly-1.0)<0.2)
	{
		return 0.5 + normaly * 0.5;
	}
	else
		return 0.;*/
	return max(0.,normaly);
}

void main(void)
{


	#include<instancesVertex>
    #include<bonesVertex>
	vec3 positionup = position-vec3(0.0, 0.1, 0.0);

	//finalnoise = fnoise(vec2(position.x, position.z)/1000.);
	vec2 uv = vec2(position.x, position.z);
	float dis = (
        1.0 + perlinNoise(vec3(uv / vec2(noiseSize, noiseSize), /*time * 0.05*/0.0) * 8.0))
        * (1.0 + (worley(uv, 32.0)+ 0.5 * worley(2.0 * uv, 32.0) + 0.25 * worley(4.0 * uv, 32.0))
    );
	finalnoise = dis / 10.0;
	
	positionup.y += time / 10000.0 * zerotofive(normal.y) * finalnoise;// * texture2D(perlinNoiseSampler, vec2(position.x, position.z));// * cos(normal.z + normal.x);
	gl_Position = viewProjection * finalWorld * vec4(positionup, 1.0);

	vec4 worldPos = finalWorld * vec4(positionup, 1.0);
	vPositionW = vec3(worldPos);
	normaly = normal.y;

#ifdef DIFFUSEX
	vTextureUVX = worldPos.zy / tileSize;
#endif

#ifdef DIFFUSEY
	vTextureUVY = worldPos.xz / tileSize;
#endif

#ifdef DIFFUSEZ
	vTextureUVZ = worldPos.xy / tileSize;
#endif

#ifdef DIFFUSENOISE
	vTextureUVN = worldPos.xz / (tileSize*5.);
#endif

#ifdef NORMAL
	// Compute tangent space (used for normal mapping + tri planar color mapping)
	vec3 xtan = vec3(0,0,1);//tangent space for the X aligned plane
   	vec3 xbin = vec3(0,1,0);
   
   	vec3 ytan = vec3(1,0,0);//tangent space for the Y aligned plane
   	vec3 ybin = vec3(0,0,1);
   
   	vec3 ztan = vec3(1,0,0);//tangent space for the Z aligned plane
   	vec3 zbin = vec3(0,1,0);
	   
	vec3 normalizedNormal = normalize(normal);
   	normalizedNormal *= normalizedNormal;

	vec3 worldBinormal = normalize(xbin * normalizedNormal.x + ybin * normalizedNormal.y + zbin * normalizedNormal.z);
   	vec3 worldTangent = normalize(xtan * normalizedNormal.x + ytan * normalizedNormal.y + ztan * normalizedNormal.z);
	   
	worldTangent = (world * vec4(worldTangent, 1.0)).xyz;
    worldBinormal = (world * vec4(worldBinormal, 1.0)).xyz;
	vec3 worldNormal = normalize(cross(worldTangent, worldBinormal));

	tangentSpace[0] = worldTangent;
    tangentSpace[1] = worldBinormal;
    tangentSpace[2] = worldNormal;
#endif

	// Clip plane
	#include<clipPlaneVertex>

	// Fog
	#include<fogVertex>

	// Shadows
	#include<shadowsVertex>[0..maxSimultaneousLights]

	// Vertex color
#ifdef VERTEXCOLOR
	vColor = color;
#endif

	// Point size
#ifdef POINTSIZE
	gl_PointSize = pointSize;
#endif
}
