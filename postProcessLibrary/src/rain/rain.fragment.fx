// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float width;
uniform float height;
uniform float time;

/*void main(void) 
{
    vec3 frostcolor = texture2D(othertexture, vUV).rgb;
    float alpha = texture2D(othertexture, vUV).a;
    //float alpha = 0.5;
    gl_FragColor = vec4(texture2D(textureSampler, vUV).rgb * (1.0 - alpha) + frostcolor * alpha, 1.0);
    //gl_FragColor = vec4(texture2D(textureSampler, vUV).rgb, 1.0);
}*/


/*loat smoothing = 0.1;
float ballradius = 0.0;
float metaPow = 1.0;
float densityMin = 4.0;
float densityMax= 7.0;
float densityEvolution = 0.4;
float rotationSpeed = 0.005;
vec2 moveSpeed = vec2(0.1,0.0);
float distortion = 0.05;
float nstrenght = 1.0;
float nsize = 1.0;
vec3 lightColor = vec3(7.0,8.0,10.0);
//float time = 1.0;

float saturate1(float x)
{
    return clamp(x, 0.0, 1.0);
}
vec2 rotuv(vec2 uv, float angle, vec2 center)
{    
   	return mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * (uv - center) + center;
}
float hash(float n)
{
   return fract(sin(dot(vec2(n,n) ,vec2(12.9898,78.233))) * 43758.5453);  
}  

float metaBall(vec2 uv)
{
	return length(fract(uv) - vec2(0.5));
}

float metaNoiseRaw(vec2 uv, float density)
{
	float v =5.0, metaball0=0.99;
    
    for(int i = 0; i < 10; i++)
    {
        float inc = float(hash(float(i))) + 1.0;
    	float r1 = hash(15.3548*inc);
        float s1 = time*rotationSpeed*r1;
        vec2 f1 = moveSpeed*r1;
    	vec2 c1 = vec2(hash(11.2*inc)*20., hash(33.2*inc))*70.0*hash(float(i)) - s1;   
    	vec2 uv1 = -rotuv(uv*(1.0+r1*v), r1*60.0 + s1, c1) ;    
    	float metaball1 = saturate1(metaBall(uv1)*density);
        
        metaball0 *= metaball1;
    }
    
    return pow(metaball0, metaPow);
}

float metaNoise(vec2 uv)
{ 
    float density = mix(densityMin,densityMax,sin(densityEvolution)*0.5+0.5);
    return 1.0 - smoothstep(ballradius, ballradius+smoothing, metaNoiseRaw(uv, density));
}

vec4 calculateNormals(vec2 uv, float s)
{
    float offsetX = nsize*s/width;
    float offsetY = nsize*s/height;
	vec2 ovX = vec2(0.0, offsetX);
	vec2 ovY = vec2(0.0, offsetY);
    
	float X = (metaNoise(uv - ovX.yx) - metaNoise(uv + ovX.yx)) * nstrenght;
    float Y = (metaNoise(uv - ovY.xy) - metaNoise(uv + ovY.xy)) * nstrenght;
    float Z = sqrt(1.0 - saturate1(dot(vec2(X,Y), vec2(X,Y))));
    
    float c = abs(X+Y);
	return normalize(vec4(X,Y,Z,c));
}

void main(void)
{
    vec2 uv2 = vUV;
    vec4 n = calculateNormals(uv2, smoothstep(0.0, 0.5, 1.0));
    vec4 tex = texture2D(textureSampler, vUV + n.xy);
    gl_FragColor = vec4(tex.xyz, 1.0);
}*/

#define HASHSCALE1 443.8975
#define HASHSCALE3 vec3(443.897, 441.423, 437.195)

//https://www.shadertoy.com/view/4djSRW
vec3 N31(float p) {
    //  3 out, 1 in... DAVE HOSKINS
   vec3 p3 = fract(vec3(p) * vec3(.1031,.11369,.13787));
   p3 += dot(p3, p3.yzx + 19.19);
   return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

vec3 hash31(float p)
{
   vec3 p3 = fract(vec3(p) * HASHSCALE3);
   p3 += dot(p3, p3.yzx+19.19);
   return fract((p3.xxy+p3.yzz)*p3.zyx); 
}

float SawTooth(float t) {
    return cos(t+cos(t))+sin(2.*t)*.2+sin(4.*t)*.02;
}

vec2 GetDrops(vec2 uv, float seed) {
    float t = time;
    uv.y += t * 0.05;                               // make all uvs downwards
    uv *= vec2(40., 5.);
    vec2 id = floor(uv);                            // id to generate random vec3
    vec3 n = N31(id.x + (id.y+seed)*546.3524);      // random vec3
    vec2 bd = fract(uv);                            // 0 ~ 1 uv
    bd -= .5;								        // offset to center
    //float bdy = bd.y;
    bd.y*=4.;
    bd.x += (n.x-.5)*.6;                            // offset for x and y direction
    t += n.z * 6.;								    // make drops begin to slide down randomly
    float slide = SawTooth(t);
    bd.y += slide*2.;								// make drops slide down
    //bd.x += slide*0.5;
    float d = length(bd);							// distance to center of the drop
    vec2 normalbd = normalize(bd);
    float temp = -0.10 * normalbd.y + 0.20;
    //float temp = 0.2 * normalbd.y + -0.20;
    float mainDrop = smoothstep(temp, .1, d);
    return bd*mainDrop;
}

void main(void)
{
	vec2 uv = vUV;
    vec2 offs = vec2(0.);
    offs = GetDrops(uv*0.5, 1.);
    //offs += GetDrops2(uv*0.5, 1.);
    offs += GetDrops(uv*2., 25.);

    const vec2 lensRadius 	= vec2(1.5, 0.05);//vec2(0.65*1.5, 0.05);
    float dist = distance(uv.xy, vec2(0.5,0.5));
    float vigfin = pow(1.-smoothstep(lensRadius.x, lensRadius.y, dist),2.);
   
    offs *= vigfin*10.0;
    uv -= offs;


    gl_FragColor = texture2D(textureSampler, uv-offs);
	//fragColor = vec4(uv,0.5+0.5*sin(iTime),1.0);
}
