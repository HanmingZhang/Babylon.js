// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform float width; 
uniform float height; 

uniform float pixel_w;
uniform float pixel_h;


void main() 
{ 
  // Just for comparison,
  // delete this if not needed
  //float vx_offset = 0.65;
  
  vec3 tc = vec3(1.0, 0.0, 0.0);

  //if (vUV.x < (vx_offset - 0.005))
  //{
    float dx = pixel_w * (1.0 / width);
    float dy = pixel_h * (1.0 / height);

    vec2 coord = vec2(dx * floor(vUV.x / dx),
                      dy * floor(vUV.y / dy));

    tc = texture2D(textureSampler, coord).rgb;
  //}
  
  // Just for comparison,
  // delete this part if not needed
  //else if (vUV.x >= (vx_offset + 0.005))
  //{
  //  tc = texture2D(textureSampler, vUV).rgb;
  //}

   gl_FragColor = vec4(tc, 1.0);
}