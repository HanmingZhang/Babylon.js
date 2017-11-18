
// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

// additional sampler
uniform sampler2D sceneSampler;


void main(void) 
{
 // simply return composed value
    gl_FragColor = texture2D(textureSampler, vUV) * texture2D(sceneSampler, vUV);

}