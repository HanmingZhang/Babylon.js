// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform sampler2D othertexture;

void main(void) 
{
    vec3 framecolor = texture2D(othertexture, vUV).rgb;
    float alpha = texture2D(othertexture, vUV).a;

    gl_FragColor = vec4(texture2D(textureSampler, vUV).rgb * (1.0 - alpha) + framecolor * alpha, 1.0);
}