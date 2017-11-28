// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D othertexture;
uniform float width;
uniform float height;
uniform float time;


#define FROSTYNESS 2.0
#define COLORIZE   1.0
#define COLOR_RGB  0.2,1.0,1.0

float rand(vec2 uv) {
 
    float a = dot(uv, vec2(92., 80.));
    float b = dot(uv, vec2(41., 62.));
    
    float x = sin(a) + cos(b) * 51.;
    return fract(x);
}
#define HASHSCALE1 .1031
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

void main( void)
{
	vec2 uv = vUV;
    vec4 d = texture2D(othertexture, uv);
	vec2 rnd = vec2(rand(uv+d.r*.05), rand(uv+d.b*.05));
    
    //vignette
    const vec2 lensRadius 	= vec2(2.0, 0.05);//vec2(0.65*1.5, 0.05);
    float dist = distance(uv.xy, vec2(0.5,0.5));
    float vigfin = pow(1.-smoothstep(lensRadius.x, lensRadius.y, dist),2.);
   
    rnd *= .025*vigfin+d.rg*FROSTYNESS*vigfin;
    uv += rnd;
    gl_FragColor = mix(texture2D(textureSampler, uv),vec4(COLOR_RGB,1.0),COLORIZE*vec4(rnd.r));
}