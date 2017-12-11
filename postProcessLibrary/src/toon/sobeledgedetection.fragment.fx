// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform sampler2D sceneSampler;
uniform float width;
uniform float height;
uniform float edgeThickness;


// mainly refer to the Implementation of Sobel Edge 
// Detection Filter by Patrick Hebron

void make_kernel(inout vec4 n[9], sampler2D tex, vec2 coord)
{
	float w = edgeThickness / width;
	float h = edgeThickness / height;

	n[0] = texture2D(tex, coord + vec2( -w, -h));
	n[1] = texture2D(tex, coord + vec2(0.0, -h));
	n[2] = texture2D(tex, coord + vec2(  w, -h));
	n[3] = texture2D(tex, coord + vec2( -w, 0.0));
	n[4] = texture2D(tex, coord);
	n[5] = texture2D(tex, coord + vec2(  w, 0.0));
	n[6] = texture2D(tex, coord + vec2( -w, h));
	n[7] = texture2D(tex, coord + vec2(0.0, h));
	n[8] = texture2D(tex, coord + vec2(  w, h));
}

void main(void) 
{
	vec4 n[9];

	make_kernel( n, sceneSampler, vUV );

	vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  	vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
	vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));

	float minGradChannel = min(sobel.r, min(sobel.g, sobel.b));

	gl_FragColor = vec4( 1.0 - vec3(minGradChannel), 1.0 );
}
