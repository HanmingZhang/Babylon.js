// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;

uniform float radius;
uniform float width;
uniform float height;

void main(void) 
{   

    int loopTimes = int(radius);

	 vec2 src_size = vec2 (1.0 / width, 1.0 / height);
     float n = (radius + 1.0) * (radius + 1.0);

     int i; 
	 int j;

     vec3 m0 = vec3(0.0); vec3 m1 = vec3(0.0); vec3 m2 = vec3(0.0); vec3 m3 = vec3(0.0);
     vec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);
     vec3 c;

     for (int j = -loopTimes; j <= 0; ++j)  {
         for (int i = -loopTimes; i <= 0; ++i)  {
             c = texture2D(textureSampler, vUV + vec2(i,j) * src_size).rgb;
             m0 += c;
             s0 += c * c;
         }
     }

     for (int j = -loopTimes; j <= 0; ++j)  {
         for (int i = 0; i <= loopTimes; ++i)  {
             c = texture2D(textureSampler, vUV + vec2(i,j) * src_size).rgb;
             m1 += c;
             s1 += c * c;
         }
     }

     for (int j = 0; j <= loopTimes; ++j)  {
         for (int i = 0; i <= loopTimes; ++i)  {
             c = texture2D(textureSampler, vUV + vec2(i,j) * src_size).rgb;
             m2 += c;
             s2 += c * c;
         }
     }

     for (int j = 0; j <= loopTimes; ++j)  {
         for (int i = -loopTimes; i <= 0; ++i)  {
             c = texture2D(textureSampler, vUV + vec2(i,j) * src_size).rgb;
             m3 += c;
             s3 += c * c;
         }
     }


     float min_sigma2 = 100.0;
     m0 /= n;
     s0 = abs(s0 / n - m0 * m0);

     float sigma2 = s0.r + s0.g + s0.b;
     if (sigma2 < min_sigma2) {
         min_sigma2 = sigma2;
         gl_FragColor = vec4(m0, 1.0);
     }

     m1 /= n;
     s1 = abs(s1 / n - m1 * m1);

     sigma2 = s1.r + s1.g + s1.b;
     if (sigma2 < min_sigma2) {
         min_sigma2 = sigma2;
         gl_FragColor = vec4(m1, 1.0);
     }

     m2 /= n;
     s2 = abs(s2 / n - m2 * m2);

     sigma2 = s2.r + s2.g + s2.b;
     if (sigma2 < min_sigma2) {
         min_sigma2 = sigma2;
         gl_FragColor = vec4(m2, 1.0);
     }
}