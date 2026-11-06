import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
};

/**
 * Where each chip sits. x/y are fractions of the section (0..1), or of the `anchor` element's box when given.
 * size is the chip's longest side in px on a 1440px-wide screen; z is depth (bigger = closer to the camera).
 * `desktopOnly` chips would sit on top of the copy on narrow screens, so they are skipped there.
 */
const CHIPS = [
  { src: '/images/slides/truffle/piece-3.webp', x: 0.53, y: 0.13, size: 190, z: 0.6, curl: 0.22, rot: [0.3, -0.4, 0.5], desktopOnly: true },
  { src: '/images/slides/jalapeno/piece-8.webp', x: -0.005, y: 0.3, size: 150, z: 1.6, curl: 0.18, rot: [-0.2, 0.5, -0.9] },
  { src: '/images/slides/truffle/piece-5.webp', x: 0.975, y: 0.07, size: 180, z: 1.9, curl: 0.25, rot: [0.4, 0.3, 1.1] },
  { src: '/images/slides/truffle/piece-2.webp', x: 0.49, y: 0.93, size: 85, z: -0.8, curl: 0.2, rot: [-0.3, -0.2, -0.3], desktopOnly: true },
  { src: '/images/slides/jalapeno/piece-3.webp', x: 0.96, y: 0.9, size: 190, z: 2.1, curl: 0.2, rot: [0.2, -0.5, 2.6] },
  { src: '/images/slides/truffle/piece-7.webp', x: 0.03, y: 0.89, size: 170, z: 1.7, curl: 0.24, rot: [-0.4, 0.2, 2.2] },
  { src: '/images/slides/jalapeno/piece-9.webp', anchor: '.story-quote', x: 0.98, y: 0.84, size: 120, z: 2.4, curl: 0.22, rot: [0.3, 0.4, 1.7] },
];

// Order the chips drop in as the section scrolls up (index into CHIPS → 0..1 delay); the card's chip lands last.
const DROP_DELAY = [0, 0.08, 0.14, 0.2, 0.3, 0.26, 0.4];

// Feathers the canvas top and bottom so a chip crossing the section edge fades out instead of being sliced off.
const FEATHER = 'linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%)';

/**
 * A potato chip as real geometry: a finely divided plane bent into a saddle with a soft ripple, so it catches
 * the light and shows its thickness of shape as it tumbles, instead of being a flat sticker.
 */
function chipGeometry(w, h, curl) {
  const g = new THREE.PlaneGeometry(w, h, 48, 48);
  const pos = g.attributes.position;
  const s = Math.max(w, h);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / (w / 2);
    const v = pos.getY(i) / (h / 2);
    const saddle = (u * u - v * v) * 0.5;
    const ripple = Math.sin(u * 3.2 + v * 1.4) * 0.12;
    pos.setZ(i, (saddle + ripple) * curl * s);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * The Manifesto's floating chips, rendered with three.js: lit, curved chips at different depths that tumble
 * slowly, sway with the pointer (near ones more than far ones) and drift with scroll. Everything is sharp: depth
 * comes from scale, lighting and parallax rather than blur. Falls back to plain images without WebGL.
 */
export default function ManifestoChips3D({ className = '' }) {
  const mountRef = useRef(null);
  const [fallback, setFallback] = useState(() => !hasWebGL());

  useEffect(() => {
    if (fallback) return undefined;
    const mount = mountRef.current;
    const section = mount.parentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFallback(true);
      return undefined;
    }
    const onLost = (e) => {
      e.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });

    const scene = new THREE.Scene();
    const CAM_Z = 12;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.z = CAM_Z;

    // Warm key light from the top-left, soft fill, and a golden rim from behind-right.
    scene.add(new THREE.HemisphereLight(0xfff6e6, 0xd9a35a, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffc266, 1.1);
    rim.position.set(6, -2, -4);
    scene.add(rim);

    const loader = new THREE.TextureLoader();
    const chips = [];
    let W = 1;
    let H = 1;

    // World-space half height of the view at depth z.
    const halfH = (z) => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (CAM_Z - z);

    // Converts each chip's px layout into world units (re-run on resize, since the layout is responsive).
    const place = () => {
      const sRect = section.getBoundingClientRect();
      const narrow = W < 1024;
      const scale = Math.min(1, Math.max(0.55, W / 1440));
      for (const c of chips) {
        const d = c.def;
        let px = d.x * W;
        let py = d.y * H;
        if (d.anchor) {
          const el = section.querySelector(d.anchor);
          if (el) {
            const r = el.getBoundingClientRect();
            px = r.left - sRect.left + d.x * r.width;
            py = r.top - sRect.top + d.y * r.height;
          }
        }
        const hh = halfH(d.z);
        const unitsPerPx = (2 * hh) / H;
        c.base.set((px - W / 2) * unitsPerPx, -(py - H / 2) * unitsPerPx, d.z);
        c.size = d.size * scale * unitsPerPx * (narrow ? 0.8 : 1);
      }
    };

    CHIPS.forEach((def, i) => {
      const entry = {
        def,
        base: new THREE.Vector3(),
        size: 1,
        phase: i * 1.7,
        delay: DROP_DELAY[i] ?? 0,
        t: reduceMotion ? 1 : 0,
        mesh: null,
      };
      loader.load(def.src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const { width, height } = tex.image;
        const m = Math.max(width, height);
        const mesh = new THREE.Mesh(
          // Unit-sized chip (longest side = 1); `place` scales it to its on-screen size.
          chipGeometry(width / m, height / m, def.curl),
          new THREE.MeshStandardMaterial({
            map: tex,
            // Alpha-blended (not alpha-tested) so the cut-out edges stay smooth instead of stair-stepped.
            transparent: true,
            alphaTest: 0.02,
            depthWrite: false,
            side: THREE.DoubleSide,
            roughness: 0.55,
            metalness: 0,
          }),
        );
        entry.mesh = mesh;
        chips.push(entry);
        scene.add(mesh);
        place();
      });
    });

    const resize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      place();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // Pointer anywhere over the section sways the chips; scroll position drifts them by depth.
    const mouse = new THREE.Vector2();
    const smooth = new THREE.Vector2();
    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onLeave = () => mouse.set(0, 0);
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);

    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    const clock = new THREE.Clock();
    let time = 0;
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduceMotion) time += dt;
      smooth.lerp(mouse, 0.05);

      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Story progress: 0 while the section's top is at the bottom of the screen, 1 once it has risen most of
      // the way up. The chips are scrubbed by it, so they fall in from the seam scrolling down and float back
      // up into it scrolling up.
      const enter = THREE.MathUtils.clamp((vh - r.top) / (vh * 0.8), 0, 1);
      // Gentle drift once settled: -1 entering from below, +1 leaving at the top.
      const scroll = reduceMotion ? 0 : THREE.MathUtils.clamp((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1, 1);
      const ease = Math.min(1, dt * 6);

      for (const c of chips) {
        const { def, base, phase, mesh } = c;
        if (!reduceMotion) c.t += (THREE.MathUtils.clamp((enter - c.delay) / 0.5, 0, 1) - c.t) * ease;
        const e = 1 - (1 - c.t) ** 3; // ease-out: quick drop, soft landing
        const depth = 0.6 + (def.z + 1) * 0.35; // near chips move more
        // Each chip starts just above the section's top edge (where the Lab's crumbs spill over) and drops home.
        const fall = (1 - e) * (halfH(def.z) - base.y + c.size * 0.5);
        mesh.position.set(
          base.x + smooth.x * 0.22 * depth + (1 - e) * Math.sin(phase) * 0.6,
          base.y + fall + smooth.y * 0.25 * depth + Math.sin(time * 1.1 + phase) * 0.12 - scroll * 0.35 * depth,
          base.z,
        );
        mesh.rotation.set(
          def.rot[0] + Math.sin(time * 0.6 + phase) * 0.35 - smooth.y * 0.3 + (1 - e) * 2.2,
          def.rot[1] + Math.cos(time * 0.5 + phase) * 0.45 + smooth.x * 0.4,
          def.rot[2] + Math.sin(time * 0.3 + phase) * 0.2 + scroll * 0.25 + (1 - e) * 2.6,
        );
        mesh.scale.setScalar(c.size * (0.6 + 0.4 * e));
        mesh.material.opacity = Math.min(1, e * 1.4);
        mesh.visible = e > 0.01 && !(W < 1024 && def.desktopOnly);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      chips.forEach((c) => {
        c.mesh.geometry.dispose();
        c.mesh.material.map?.dispose();
        c.mesh.material.dispose();
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [fallback]);

  if (fallback) {
    // Flat, still images in the same spots when WebGL isn't available.
    return (
      <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
        {CHIPS.filter((c) => !c.anchor).map((c) => (
          <img
            key={c.src + c.x}
            src={c.src}
            alt=""
            className={`absolute object-contain ${c.desktopOnly ? 'hidden lg:block' : ''}`}
            style={{
              left: `${c.x * 100}%`,
              top: `${c.y * 100}%`,
              width: c.size * 0.8,
              transform: `translate(-50%, -50%) rotate(${c.rot[2]}rad)`,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ maskImage: FEATHER, WebkitMaskImage: FEATHER }}
    />
  );
}
