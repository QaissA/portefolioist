import { useMemo } from 'react'
import * as THREE from 'three'

// Distant mountain range, shaped entirely in the shader. The geometry is a flat
// strip; the vertex shader wraps it into a ring around the world (uv.x = angle)
// and lifts the top edge by ridged 3D noise sampled on a circle, so the range is
// seamless all the way round. The fragment shader flat-shades each facet
// (low-poly look matching the Kenney models), colours by height
// (forest → rock → snow) and blends into the sky haze for aerial perspective.

const vertexShader = /* glsl */ `
  uniform float uRadius;
  uniform float uDepth;
  uniform float uPeak;
  uniform float uFreq;
  uniform float uSeed;
  varying vec3 vWorld;
  varying float vH;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  // ridged fBm: 1 - |n| folds noise into sharp crests
  float ridge(vec3 p) {
    float h = 0.0, amp = 0.5;
    for (int i = 0; i < 5; i++) {
      float n = 1.0 - abs(noise(p) * 2.0 - 1.0);
      h += n * n * amp;
      p *= 2.03;
      amp *= 0.5;
    }
    return h;
  }

  void main() {
    float a = uv.x * 6.2831853;
    vec3 p = vec3(cos(a), sin(a), uSeed) * uFreq;
    float t = uv.y; // 0 = base, 1 = crest
    // big masses (low freq) gate the ridges so there are peaks and passes
    float mass = smoothstep(0.25, 0.75, noise(p * 0.45 + 7.0));
    float crest = uPeak * (0.2 + 0.8 * ridge(p)) * (0.45 + 0.55 * mass);
    // per-column slope exponent + gullies so the faces aren't a flat curtain
    float shape = 1.0 + 1.2 * noise(vec3(p.xy * 2.5, uSeed + 4.0));
    float y = crest * pow(t, shape);
    y += (noise(vec3(p.xy * 6.0, t * 6.0 + uSeed)) - 0.5) * crest * 0.6 * t * (1.0 - t);
    y = mix(-30.0, y, smoothstep(0.0, 0.05, t)); // sink the base below the ground
    float r = uRadius + t * uDepth; // base nearer, crest further: slopes lean back
    vec4 world = modelMatrix * vec4(cos(a) * r, y, sin(a) * r, 1.0);
    vWorld = world.xyz;
    vH = y / uPeak;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uHaze;
  uniform float uHazeAmt;
  uniform vec3 uLow;
  uniform vec3 uRock;
  uniform vec3 uSnow;
  varying vec3 vWorld;
  varying float vH;

  void main() {
    // per-facet normal from screen-space derivatives → flat low-poly shading
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    if (dot(n, cameraPosition - vWorld) < 0.0) n = -n;
    float light = 0.62 + 0.5 * max(dot(n, normalize(uSun)), 0.0); // high ambient: we mostly see the shaded side

    float steep = 1.0 - n.y; // steep faces show rock, flat ledges hold snow / green
    vec3 col = mix(uLow, uRock, smoothstep(0.1, 0.3, vH + steep * 0.2));
    col = mix(col, uSnow, smoothstep(0.42, 0.5, vH - steep * 0.15));
    col *= light;

    col = mix(col, uHaze, clamp(uHazeAmt + (1.0 - vH) * 0.2, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`

const SUN = new THREE.Vector3(80, 60, 40) // matches the scene's directional light
const HAZE = new THREE.Color('#c9e2ee') // matches the scene fog

function Range({ radius, depth, peak, freq, seed, haze }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uRadius: { value: radius },
          uDepth: { value: depth },
          uPeak: { value: peak },
          uFreq: { value: freq },
          uSeed: { value: seed },
          uSun: { value: SUN },
          uHaze: { value: HAZE },
          uHazeAmt: { value: haze },
          uLow: { value: new THREE.Color('#3f6b3a') },
          uRock: { value: new THREE.Color('#7b7a80') },
          uSnow: { value: new THREE.Color('#f4f6fa') },
        },
      }),
    [radius, depth, peak, freq, seed, haze],
  )
  return (
    // the shader builds the ring, so the flat strip's bounds are meaningless → no culling
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[1, 1, 360, 40]} />
    </mesh>
  )
}

/** Two shader-built mountain rings beyond the horizon hills: a nearer, clearer range and a taller, hazier one behind. */
export default function Mountains() {
  return (
    <group>
      <Range radius={390} depth={160} peak={230} freq={3.2} seed={11.3} haze={0.42} />
      <Range radius={300} depth={90} peak={110} freq={4.5} seed={3.7} haze={0.18} />
    </group>
  )
}
