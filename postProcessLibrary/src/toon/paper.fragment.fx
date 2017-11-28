// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform sampler2D othertexture;

void main(void) 
{
	vec3 color = texture2D(textureSampler, vUV).rgb * texture2D(othertexture, vUV).rgb;

    gl_FragColor = vec4(color, 1.0);
}