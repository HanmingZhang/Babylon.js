precision highp float;

// Input
varying vec3 vPositionW;

#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif

#include<clipPlaneFragmentDeclaration>

// Sky
uniform vec3 cameraPosition;
uniform float luminance;
uniform float turbidity;
uniform float rayleigh;
uniform float mieCoefficient;
uniform float mieDirectionalG;
uniform vec3 sunPosition;

uniform float skyTime;

uniform float turbidity2;
uniform float rayleigh2;
uniform float mieCoefficient2;

// Cloud
uniform float timeScale;
uniform float cloudScale;
uniform float cover;
uniform float softness;
uniform float brightness;
uniform float noiseOctaves;
uniform float curlStrain;
vec2 add = vec2(1.0, 0.0);
float cloudy;

#define FLATTEN .2

// Fog
#include<fogFragmentDeclaration>

uniform float time;

// Constants
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
const float n = 1.0003;
const float N = 2.545E25;
const float pn = 0.035;

const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;
const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

vec3 totalRayleigh(vec3 lambda)
{
	return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));
}

vec3 simplifiedRayleigh()
{
	return 0.0005 / vec3(94, 40, 18);
}

float rayleighPhase(float cosTheta)
{	 
	return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T)
{
	float c = (0.2 * T ) * 10E-18;
	return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g)
{
	return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos)
{
	return EE * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float EEE = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x)
{
	return ((x*(A*x+C*B)+D*EEE)/(x*(A*x+B)+D*F))-EEE/F;
}

//Clouds

float saturate(float num)
{
    return clamp(num,0.0,1.0);
}
//https://www.shadertoy.com/view/4djSRW
#define MOD3 vec3(3.07965, 7.1235, 4.998784)
#define HASHSCALE1 .1031
// float hash(vec3 p)
// {
// 	p  = fract(p /  MOD3);
//     p += dot(p.xyz, p.yzx + 19.19);
//     return fract(p.x * p.y * p.z);
// }
float hash(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
	//return  -1.+2.*fract(sin((p3.x + p3.y) * p3.z + time/10000.));
    return fract((p3.x + p3.y) * p3.z);
}

float Noise3d(vec3 p)
{
    vec3 i = floor(p);
	vec3 f = fract(p); 

	//https://www.shadertoy.com/view/4dS3Wd
	//For performance, compute the base input to a 1D hash from the integer part of the argument and the 
    //incremental change to the 1D based on the 3D -> 1D wrapping
	const vec3 step = vec3(110, 241, 171);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
	
	//https://www.shadertoy.com/view/4tf3RM
	// f *= f * (3.0-2.0*f);
	// return mix(
	// 	mix(mix(Hash(i ), 	            Hash(i + add.xyy),f.x),
	// 		mix(Hash(i + add.yxy),		Hash(i + add.xxy),f.x),
	// 		f.y),
	// 	mix(mix(Hash(i + add.yyx),    	Hash(i + add.xyx),f.x),
	// 		mix(Hash(i + add.yxx), 		Hash(i + add.xxx),f.x),
	// 		f.y),
	// 	f.z);

	//https://www.shadertoy.com/view/4sfGzS
	// f = f*f*(3.0-2.0*f);
    // return mix(mix(mix( hash(p+vec3(0,0,0)), 
    //                     hash(p+vec3(1,0,0)),f.x),
    //                mix( hash(p+vec3(0,1,0)), 
    //                     hash(p+vec3(1,1,0)),f.x),f.y),
    //            mix(mix( hash(p+vec3(0,0,1)), 
    //                     hash(p+vec3(1,0,1)),f.x),
    //                mix( hash(p+vec3(0,1,1)), 
    //                     hash(p+vec3(1,1,1)),f.x),f.y),f.z);
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

vec3 rotatepos(vec3 pos)
{
    pos = pos + Noise3d(pos*0.2)*0.005;
    float rot = curlStrain;
    float sinRot=sin(rot);
    float cosRot=cos(rot);
    mat3 rotMat = mat3(cosRot,0,sinRot,0,1,0,-sinRot,0,cosRot);
    return pos * rotMat;
}

float FBM(vec3 p, float ts, float Octaves)
{
	p *= .5;
    float f = 0.0;
	float amplitude = 0.5;
	for(int i = 0;i < int(Octaves);i++)
	{
		f += amplitude * Noise3d(rotate(p,vec3(0.0, 1.0, 0.0),time*ts/100.0*(1.0-amplitude)));
		p *= 3.0;
		//p = rotatepos(p);
		amplitude *= 0.5;
	}
    return f;
}

vec3 skycolor(vec3 position, float turb, float rayl, float mieCoe)
{
	float sunfade = 1.0 - clamp(1.0 - exp((position.y / 450000.0)), 0.0, 1.0);
	float rayleighCoefficient = rayl - (1.0 * (1.0 - sunfade));
	vec3 sunDirection = normalize(position);
	float sunE = sunIntensity(dot(sunDirection, up));
	vec3 betaR = simplifiedRayleigh() * rayleighCoefficient;
	vec3 betaM = totalMie(lambda, K, turb) * mieCoe;
	float zenithAngle = acos(max(0.0, dot(up, normalize(vPositionW - cameraPosition))));
	float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
	float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
	vec3 Fex = exp(-(betaR * sR + betaM * sM));
	float cosTheta = dot(normalize(vPositionW - cameraPosition), sunDirection);
	float rPhase = rayleighPhase(cosTheta*0.5+0.5);
	vec3 betaRTheta = betaR * rPhase;
	float mPhase = hgPhase(cosTheta, mieDirectionalG);
	vec3 betaMTheta = betaM * mPhase;
	
	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
	Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex, vec3(1.0 / 2.0)), clamp(pow(1.0-dot(up, sunDirection), 5.0), 0.0, 1.0));

	vec3 direction = normalize(vPositionW - cameraPosition);
	float theta = acos(direction.y);
	float phi = atan(direction.z, direction.x);
	vec2 uv = vec2(phi, theta) / vec2(2.0 * pi, pi) + vec2(0.5, 0.0);
	vec3 L0 = vec3(0.1) * Fex;
	
	float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
	L0 += (sunE * 19000.0 * Fex) * sundisk;
	
	vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));
	vec3 texColor = (Lin+L0);   
	texColor *= 0.04 ;
	texColor += vec3(0.0,0.001,0.0025)*0.3;

	float g_fMaxLuminance = 1.0;
	float fLumScaled = 0.1 / luminance;     
	float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled); 

	float ExposureBias = fLumCompressed;

	vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);

	// May generate a bug so just just keep retColor = skyColor;
	// vec3 skyColor = curr * whiteScale;
	//vec3 retColor = pow(skyColor,vec3(1.0/(1.2+(1.2*sunfade))));

	vec3 retColor = curr * whiteScale;

	return retColor;
}
//lightning
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
//----------------------------------------------------------------------------------------
//  1 out, 1 in...
float hash11(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}
//----------------------------------------------------------------------------------------
//  1 out, 2 in...
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

///  2 out, 2 in...
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);

}

float dseg( vec2 ba, vec2 pa )
{
	
	float h = clamp( dot(pa,ba)/dot(ba,ba), -0.2, 1. );	
	return length( pa - ba*h );
	//return length(pa - ba);
	/*if(ba.x-pa.x>0.)
	{
		return length(ba-pa);//+0.1*length(ba-vec2(1.,0.)-pa);
	}
	else
	{
		return length(ba-pa);//+0.1*length(ba+vec2(1.,0.)-pa);
	}*/
}

vec3 lightning (vec2 p)
{
    vec2 d;
    vec2 tgt = vec2(0.);
	vec3 col=vec3(0.);
    float mdist = 10000.;
    float t = hash11(floor(20.*time));
    tgt = vec2(0.0);
    tgt+=4.*hash22(tgt+t)-1.5;
    float c = 0.0;
	if(hash(t+2.3)>.6)
	{
		for (int i=0; i<10; i++) {
			vec2 dtgt = tgt-p;		
			d = .05*(vec2(-.5, -1.)+hash22(vec2(float(i), t)));
			float dist =dseg(d,dtgt);
			mdist = min(mdist,dist);
			tgt -= d;
			c=exp(-.5*dist)+exp(-55.*mdist);
			col=c*vec3(.7,.8,1.);
		}
	}
    return col;
}

void main(void) {
	// Clip plane
#include<clipPlaneFragment>

	/**
	*--------------------------------------------------------------------------------------------------
	* Sky Color
	*--------------------------------------------------------------------------------------------------
	*/
	//vec3 newSunPosition = rotate(sunPosition,vec3(0.0, 0.0, 1.0),time/100.);
	vec3 newSunPosition = rotate(sunPosition,vec3(0.0, 0.0, 1.0),skyTime);
	vec3 newMoonPosition = -newSunPosition;
	vec3 retColorday = skycolor(newSunPosition, turbidity, rayleigh, mieCoefficient);
	vec3 retColornight = skycolor(newMoonPosition, turbidity2, rayleigh2, mieCoefficient2);
	vec3 retColor = retColorday + retColornight;

	/**
	*--------------------------------------------------------------------------------------------------
	* Sky Color
	*--------------------------------------------------------------------------------------------------
	*/
	
	// Alpha
	float alpha = 1.0;

#ifdef VERTEXCOLOR
	retColor.rgb *= vColor.rgb;
#endif

#ifdef VERTEXALPHA
	alpha *= vColor.a;
#endif

	// Composition
	vec4 color = clamp(vec4(retColor.rgb, alpha), 0.0, 1.0);

#ifdef DIFFUSENOISE
vec3 pos = normalize(vPositionW - cameraPosition);
//Stars

	float a = 0.5;//0.5 -> 0 -> -0.5 -> -1 -> -0.5 -> 0 -> 0.5
	//a -> 0; -1 -> 1; x1=a, y1=0; x2=-1, y2=1;
	float staramount = 1./(-1.-a) * newSunPosition.y - a/(-1.-a);
	staramount = sin(staramount * pi/2.);

	float starcolor = 1.0;
	float starScale = 0.002;
	float starCover = 0.31;
	float startimeScale = 0.01;

	vec3 starpos = pos/starScale;
	starpos = rotate(starpos,vec3(0.0, 1.0, 0.0),time*startimeScale/1000.);

    float h1 = FBM(starpos, startimeScale, 4.0);
    float h2 = h1;
    
    float stars1 = smoothstep(1.0-starCover,min((1.0-starCover)+softness*2.0,1.0),h1);
    float stars2 = smoothstep(1.0-starCover,min((1.0-starCover)+softness,1.0),h2);
    
    float starsFormComb = saturate(stars1+stars2)*staramount;
    
    vec4 starskyCol = vec4(0.6,0.8,1.0,1.0);
    float starCol = saturate(saturate(1.0-pow(h1,1.0)*0.2)*starcolor);
    vec4 stars1Color = vec4(starCol,starCol,starCol,1.0);
    vec4 stars2Color = mix(stars1Color,starskyCol,0.25);
    vec4 starColComb = mix(stars1Color,stars2Color,saturate(stars2-stars1));
	color = mix(color,starColComb,starsFormComb);

//Clouds

	//float bright = brightness*(1.8-cover);
	float bright = newSunPosition.y;
	bright = max(0.0, bright);
	bright = sin(bright * pi/2.);
    
	vec3 cloudpos = pos/cloudScale;
	//cloudpos.x = cloudpos.x/20.0;
	cloudpos = rotate(cloudpos,vec3(0.0, 1.0, 0.0),time*timeScale/1000.);

    float color1 = FBM(cloudpos, timeScale, noiseOctaves);
	//color = vec4(vec3(color1),1.0);
    float color2 = color1;
    
    float clouds1 = smoothstep(1.0-cover,min((1.0-cover)+softness*2.0,1.0),color1);
    float clouds2 = smoothstep(1.0-cover,min((1.0-cover)+softness,1.0),color2);
    
    float cloudsFormComb = saturate(clouds1+clouds2);
    
    //vec4 skyCol = vec4(0.6,0.8,1.0,1.0);
	vec4 skyCol = vec4(0.6,0.8,1.0,1.0);
    float cloudCol = saturate(saturate(1.0-pow(color1,1.0)*0.2)*bright);
    vec4 clouds1Color = vec4(cloudCol,cloudCol,cloudCol,1.0);
    vec4 clouds2Color = mix(clouds1Color,skyCol,0.25);
    vec4 cloudColComb = mix(clouds1Color,clouds2Color,saturate(clouds2-clouds1));
	color = mix(color,cloudColComb,cloudsFormComb);
#endif

//Lightning

	//  vec3 direction = normalize(vPositionW - cameraPosition);
	//  float theta = acos(direction.y);
	//  float phi = atan(direction.z, direction.x);
	//  vec2 uv = vec2(phi, theta) / vec2(2.0 * pi, pi) + vec2(0.5, 0.0);

	// vec4 lightningcolor = vec4(lightning(uv), 1.0);
	//color = mix(color, lightningcolor, 0.5);

    // Fog
#include<fogFragment>

	gl_FragColor = color;
}