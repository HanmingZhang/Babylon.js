// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform float gamma; // default 0.6
uniform float numColors; // default 8.0

void main(void) 
{   
    vec3 c = texture2D(textureSampler, vUV).rgb;

    c = pow(c, vec3(gamma, gamma, gamma));

    c = c * numColors;
    c = floor(c);
    c = c / numColors;

    c = pow(c, vec3(1.0/gamma));
    gl_FragColor = vec4(c, 1.0);
}
