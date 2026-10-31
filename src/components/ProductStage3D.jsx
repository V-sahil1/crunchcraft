import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { CAMERA_Z, PACK_H, STAGE_FOV } from '../data/stage.js';

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
};

// Seeded random so every flavour gets the same "random" depth/phase each load.
const rand = (seed) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

// Where each piece floats around the pack, in world units. Shared by the WebGL scene and the flat fallback.
function layoutPieces(scene) {
  return scene.pieces.map((p, i) => {
    const angle = Math.atan2(p.y, p.x) + (scene.rotate || 0);
    const r0 = Math.hypot(p.x, p.y);
    const front = i % 3 === 1; // a third of the pieces fly in front of the pack
    const size = Math.max(p.w, p.h) * PACK_H * (front ? 0.95 : 1.15);
    return {
      src: p.src,
      angle,
      radius: Math.min((front ? 2.2 : 1.65) + r0 * 2.3, 3.2),
      w: (p.w / Math.max(p.w, p.h)) * size,
      h: (p.h / Math.max(p.w, p.h)) * size,
      z: front ? 0.9 + rand(i + 3) * 1.1 : -0.4 - rand(i + 7) * 1.8,
      front,
      seed: i,
    };
  });
}

/**
 * Builds one flavour: the pack in the middle, its ingredients orbiting around it
 * (some behind, some in front), and a dust layer far behind.
 */
function buildFlavour(scene, loadTex) {
  const group = new THREE.Group();
  group.visible = false;
  const tint = new THREE.Color(scene.tint || '#ffffff');
  const items = [];

  const plane = (src, w, h, color = tint) => {
    const mat = new THREE.MeshBasicMaterial({ map: loadTex(src), color, transparent: true, depthWrite: false, opacity: 0 });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  };

  const dust = plane(scene.dust.src, scene.dust.w * PACK_H * 1.25, scene.dust.h * PACK_H * 1.25);
  dust.position.z = -3;
  dust.renderOrder = 0;
  group.add(dust);

  // Pieces sit radially out of the pack's footprint, keeping their angle from the photo.
  layoutPieces(scene).forEach((p) => {
    const i = p.seed;
    const mesh = plane(p.src, p.w, p.h);
    mesh.renderOrder = p.front ? 3 : 1;
    mesh.userData = {
      angle: p.angle,
      radius: p.radius,
      z: p.z,
      phase: rand(i + 11) * Math.PI * 2,
      spin: (rand(i + 13) - 0.5) * 0.5,
      bob: 0.08 + rand(i + 17) * 0.14,
      push: new THREE.Vector2(),
      t: 0, // intro 0..1
      o: 0, // exit 0..1
    };
    group.add(mesh);
    items.push(mesh);
  });

  const pack = plane(scene.pack, PACK_H * scene.packAspect, PACK_H, new THREE.Color('#ffffff'));
  pack.renderOrder = 2;
  pack.userData = { t: 0, o: 0 };
  group.add(pack);

  return { group, items, pack, dust };
}

/**
 * WebGL product stage: pack in the centre with its chips, chillies and limes floating
 * around it in 3D. Pieces react to the pointer (parallax + push away) and the scene
 * blasts out / pulls in when `index` changes.
 */
export default function ProductStage3D({ scenes, index, direction = 1, hold = false, alt, className = '' }) {
  const mountRef = useRef(null);
  const api = useRef(null);
  const holdRef = useRef(hold);
  const dirRef = useRef(direction);
  dirRef.current = direction;
  const [fallback, setFallback] = useState(() => !hasWebGL());

  useEffect(() => {
    if (fallback) return undefined;
    const mount = mountRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFallback(true);
      return undefined;
    }
    // If the GPU drops the context the canvas goes blank white; swap to the flat stage instead.
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
    const camera = new THREE.PerspectiveCamera(STAGE_FOV, 1, 0.1, 100);
    camera.position.z = CAMERA_Z;

    const loader = new THREE.TextureLoader();
    const texCache = new Map();
    const loadTex = (src) => {
      if (!texCache.has(src)) {
        const tex = loader.load(src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        texCache.set(src, tex);
      }
      return texCache.get(src);
    };

    const flavours = scenes.map((s) => buildFlavour(s, loadTex));
    flavours.forEach((f) => scene.add(f.group));

    // Pointer: normalised -1..1 plus its position on the z=0 plane (for pushing pieces).
    const mouse = new THREE.Vector2();
    const smooth = new THREE.Vector2();
    const pointer = new THREE.Vector2(99, 99);
    let pointerIn = false;
    const onMove = (e) => {
      const r = mount.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAMERA_Z;
      pointer.set(mouse.x * halfH * camera.aspect, mouse.y * halfH);
      pointerIn = true;
    };
    const onLeave = () => {
      mouse.set(0, 0);
      pointerIn = false;
    };
    // Click / tap: everything bursts outward and springs back.
    const burst = { v: 0 };
    const onDown = () => {
      gsap.killTweensOf(burst);
      gsap
        .timeline()
        .to(burst, { v: 1, duration: 0.22, ease: 'power3.out' })
        .to(burst, { v: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
    };
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerleave', onLeave);
    mount.addEventListener('pointerdown', onDown);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    // `landed`: the pack was just handed over from the hero, so it appears in place and only the pieces burst out.
    const SLIDE = 9; // world units a pack travels sideways when switching flavours
    const enter = (f, instant, landed = false) => {
      f.group.visible = true;
      gsap.killTweensOf(f.group.position);
      if (instant || landed) f.group.position.x = 0;
      else gsap.fromTo(f.group.position, { x: SLIDE * dirRef.current }, { x: 0, duration: 1.1, ease: 'power3.out' });
      const all = [f.pack.userData, ...f.items.map((m) => m.userData)];
      gsap.killTweensOf(all);
      all.forEach((u) => {
        u.o = 0;
      });
      if (instant) {
        all.forEach((u) => {
          u.t = 1;
        });
        return;
      }
      if (landed) f.pack.userData.t = 1;
      else gsap.fromTo(f.pack.userData, { t: 0 }, { t: 1, duration: 1.1, delay: 0.25, ease: 'back.out(1.6)' });
      gsap.fromTo(
        f.items.map((m) => m.userData),
        { t: 0 },
        { t: 1, duration: 1.3, delay: landed ? 0 : 0.35, ease: 'expo.out', stagger: { each: 0.035, from: 'random' } },
      );
    };
    const exit = (f, instant) => {
      const all = [f.pack.userData, ...f.items.map((m) => m.userData)];
      gsap.killTweensOf(all);
      if (instant) {
        f.group.visible = false;
        return;
      }
      gsap.killTweensOf(f.group.position);
      gsap.to(f.group.position, { x: -SLIDE * dirRef.current, duration: 0.8, ease: 'power2.in' });
      gsap.to(all, {
        o: 1,
        duration: 0.7,
        ease: 'power2.in',
        stagger: { each: 0.015, from: 'random' },
        onComplete: () => {
          f.group.visible = false;
        },
      });
    };
    if (!holdRef.current) enter(flavours[index], reduceMotion);

    const clock = new THREE.Clock();
    let time = 0;
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduceMotion) time += dt;
      smooth.lerp(mouse, 0.06);

      for (const f of flavours) {
        if (!f.group.visible) continue;
        const pu = f.pack.userData;
        const packVis = pu.t * (1 - pu.o);
        f.pack.material.opacity = Math.min(1, packVis * 1.4);
        const ps = (0.6 + 0.4 * pu.t) * (1 - 0.35 * pu.o) * (1 - burst.v * 0.06);
        f.pack.scale.setScalar(ps);
        f.pack.position.set(smooth.x * 0.12, Math.sin(time * 1.1) * 0.08 + pu.o * 0.6, 0);
        f.pack.rotation.set(-smooth.y * 0.22, smooth.x * 0.32, (1 - pu.t) * 0.35 - pu.o * 0.3 + Math.sin(time * 0.7) * 0.025);

        let groupVis = 0;
        for (const m of f.items) {
          const u = m.userData;
          const vis = u.t * (1 - u.o);
          groupVis = Math.max(groupVis, vis);
          // Slow orbit + bob; intro flies out from the pack, exit blasts further out.
          const a = u.angle + time * 0.05 + Math.sin(time * 0.4 + u.phase) * 0.05;
          const r = u.radius * (0.15 + 0.85 * u.t) * (1 + u.o * 0.9 + burst.v * 0.35);
          let x = Math.cos(a) * r * 1.08;
          let y = Math.sin(a) * r + Math.sin(time * 1.3 + u.phase) * u.bob;

          // Push away from the pointer.
          if (pointerIn) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d = Math.hypot(dx, dy) || 1;
            const force = Math.max(0, 1.6 - d) * 0.55;
            u.push.x += ((dx / d) * force - u.push.x) * 0.1;
            u.push.y += ((dy / d) * force - u.push.y) * 0.1;
          } else {
            u.push.multiplyScalar(0.92);
          }
          x += u.push.x;
          y += u.push.y;

          // Depth parallax: near pieces swing more than far ones.
          const depth = 1 + u.z * 0.35;
          m.position.set(x + smooth.x * 0.35 * depth, y + smooth.y * 0.3 * depth, u.z);
          m.rotation.set(
            Math.sin(time * 0.9 + u.phase) * 0.35,
            Math.cos(time * 0.7 + u.phase) * 0.45,
            u.spin * time + u.phase * 0.2 + (1 - u.t) * 1.5,
          );
          m.scale.setScalar(0.3 + 0.7 * u.t);
          m.material.opacity = vis;
        }
        f.dust.material.opacity = groupVis * 0.55;
        f.dust.rotation.z = time * 0.02;
        f.dust.position.set(-smooth.x * 0.25, -smooth.y * 0.2, -3);
      }

      renderer.render(scene, camera);
    };
    tick();

    api.current = { flavours, current: index, reduceMotion, enter, exit, held: holdRef.current };

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      ro.disconnect();
      io.disconnect();
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerleave', onLeave);
      mount.removeEventListener('pointerdown', onDown);
      gsap.killTweensOf(burst);
      flavours.forEach((f) => {
        gsap.killTweensOf([f.pack.userData, ...f.items.map((m) => m.userData)]);
        f.group.traverse((o) => {
          if (o.isMesh) {
            o.geometry.dispose();
            o.material.dispose();
          }
        });
      });
      texCache.forEach((t) => t.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      api.current = null;
    };
    // Scene is built once; index changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback, scenes]);

  // `hold`: the hero pack is mid-flight towards this stage, so keep the scene empty until it lands.
  useEffect(() => {
    holdRef.current = hold;
    const a = api.current;
    if (!a) return;
    if (hold) {
      if (!a.held) a.exit(a.flavours[a.current], true);
      a.held = true;
      a.current = index;
      return;
    }
    if (a.held) {
      a.held = false;
      a.current = index;
      a.enter(a.flavours[index], a.reduceMotion, true);
      return;
    }
    // Blast the old flavour out, pull the new one in.
    if (a.current === index) return;
    a.exit(a.flavours[a.current], a.reduceMotion);
    a.enter(a.flavours[index], a.reduceMotion);
    a.current = index;
  }, [index, hold]);

  if (fallback) return <FlatStage scene={scenes[index]} direction={direction} show={!hold} alt={alt} className={className} />;

  return <div ref={mountRef} role="img" aria-label={alt} className={`${className} cursor-pointer touch-pan-y`} />;
}

/**
 * No-WebGL version of the stage: the same pack and ingredient layout, projected flat.
 * Interactive like the 3D one: the pack tilts towards the cursor, pieces shift with depth
 * and get pushed away from the cursor, and a click bursts everything outward.
 */
function FlatStage({ scene, direction = 1, show, alt, className }) {
  const view = 2 * Math.tan(THREE.MathUtils.degToRad(STAGE_FOV / 2)) * CAMERA_Z; // stage height in world units
  const pct = (v) => `${(v / view) * 100}%`;
  const at = (x, y, w, h) => ({
    left: `calc(50% + ${pct(x - w / 2)})`,
    top: `calc(50% - ${pct(y + h / 2)})`,
    width: pct(w),
  });
  const dustS = CAMERA_Z / (CAMERA_Z + 3);
  const dw = scene.dust.w * PACK_H * 1.25 * dustS;
  const dh = scene.dust.h * PACK_H * 1.25 * dustS;
  const packW = PACK_H * scene.packAspect;

  // Screen-space layout for every piece; fx/fy are offsets from centre as stage fractions (y down).
  const pieces = layoutPieces(scene).map((p) => {
    const s = CAMERA_Z / (CAMERA_Z - p.z); // perspective scale for this depth
    const x = Math.cos(p.angle) * p.radius * 1.08 * s;
    const y = Math.sin(p.angle) * p.radius * s;
    return { ...p, x, y, w: p.w * s, h: p.h * s, fx: x / view, fy: -y / view };
  });

  const rootRef = useRef(null);
  const packRef = useRef(null);
  const moverRefs = useRef([]);
  const shownScene = useRef(scene);
  const [leaving, setLeaving] = useState(null);

  useEffect(() => {
    if (shownScene.current === scene) return undefined;
    setLeaving({ scene: shownScene.current, direction });
    shownScene.current = scene;
    const t = setTimeout(() => setLeaving(null), 750);
    return () => clearTimeout(t);
    // direction is read at the moment the scene changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !show || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const target = { x: 0, y: 0, in: false };
    const cur = { x: 0, y: 0 };
    const burst = { v: 0 };
    const push = pieces.map(() => ({ x: 0, y: 0 }));

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      target.in = true;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      target.in = false;
    };
    // Click / tap: everything bursts outward and springs back.
    const onDown = () => {
      gsap.killTweensOf(burst);
      gsap
        .timeline()
        .to(burst, { v: 1, duration: 0.22, ease: 'power3.out' })
        .to(burst, { v: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);

    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(el);
    const last = pieces.map(() => '');
    let lastPack = '';

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen) return;
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      const r = (v) => Math.round(v * 100) / 100;
      const packT = `perspective(900px) rotateY(${r(cur.x * 26)}deg) rotateX(${r(-cur.y * 20)}deg) translate(${r(cur.x * 4)}%, ${r(cur.y * 3)}%) scale(${r(1 - burst.v * 0.06)})`;
      if (packRef.current && packT !== lastPack) {
        lastPack = packT;
        packRef.current.style.transform = packT;
      }
      pieces.forEach((p, i) => {
        const node = moverRefs.current[i];
        if (!node) return;
        // Push away from the cursor.
        const q = push[i];
        if (target.in) {
          const dx = p.fx - target.x;
          const dy = p.fy - target.y;
          const d = Math.hypot(dx, dy) || 1;
          const force = Math.max(0, 0.22 - d) * 0.9;
          q.x += ((dx / d) * force - q.x) * 0.12;
          q.y += ((dy / d) * force - q.y) * 0.12;
        } else {
          q.x *= 0.92;
          q.y *= 0.92;
        }
        // Depth parallax: near pieces swing more than far ones; the burst throws them outward.
        const depth = 1 + p.z * 0.45;
        const len = Math.hypot(p.fx, p.fy) || 1;
        const ox = cur.x * 0.07 * depth + q.x + (p.fx / len) * burst.v * 0.14;
        const oy = cur.y * 0.06 * depth + q.y + (p.fy / len) * burst.v * 0.14;
        const t = `translate3d(${Math.round(ox * el.clientWidth * 10) / 10}px, ${Math.round(oy * el.clientHeight * 10) / 10}px, 0) rotate(${r((q.x - q.y) * 120 + burst.v * (p.front ? 40 : -30))}deg)`;
        if (t !== last[i]) {
          last[i] = t;
          node.style.transform = t;
        }
      });
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      gsap.killTweensOf(burst);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
    };
    // pieces are derived from scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, show]);

  return (
    <div ref={rootRef} role="img" aria-label={alt} className={`${className} relative cursor-pointer touch-pan-y`}>
      {show && leaving && <LeavingLayer scene={leaving.scene} direction={leaving.direction} at={at} />}
      {show && (
        <div
          key={scene.pack}
          aria-hidden="true"
          className="stage-enter absolute inset-0 select-none will-change-transform"
          style={{ '--dir': direction }}
        >
          <img src={scene.dust.src} alt="" draggable="false"
                  decoding="async" className="stage-pop absolute opacity-50" style={at(0, 0, dw, dh)} />
          {pieces.map((p, i) => (
            <div
              key={p.src}
              className="stage-pop absolute"
              style={{
                ...at(p.x, p.y, p.w, p.h),
                zIndex: p.front ? 3 : 1,
                '--dx': `${(-p.x / p.w) * 100}%`,
                '--dy': `${(p.y / p.h) * 100}%`,
                animationDelay: `${rand(p.seed + 5) * 0.4}s`,
              }}
            >
              <div
                ref={(n) => {
                  moverRefs.current[i] = n;
                }}
                className="will-change-transform"
              >
                <img
                  src={p.src}
                  alt=""
                  draggable="false"
                  decoding="async"
                  className="stage-bob w-full h-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                  style={{ rotate: `${(rand(p.seed + 13) - 0.5) * 40}deg`, animationDelay: `${-rand(p.seed + 11) * 5}s` }}
                />
              </div>
            </div>
          ))}
          <div ref={packRef} className="absolute z-[2] will-change-transform" style={at(0, 0, packW, PACK_H)}>
            <img
              src={scene.pack}
              alt=""
              draggable="false"
                  decoding="async"
              className="stage-bob w-full h-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
              style={{ animationDuration: '6s' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// The outgoing flavour in the flat stage: a static copy that slides off the opposite side.
function LeavingLayer({ scene, direction, at }) {
  return (
    <div aria-hidden="true" className="stage-leave absolute inset-0 pointer-events-none will-change-transform" style={{ '--dir': direction }}>
      {layoutPieces(scene).map((p) => {
        const s = CAMERA_Z / (CAMERA_Z - p.z);
        const x = Math.cos(p.angle) * p.radius * 1.08 * s;
        const y = Math.sin(p.angle) * p.radius * s;
        return (
          <img
            key={p.src}
            src={p.src}
            alt=""
            className="absolute drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
            style={{ ...at(x, y, p.w * s, p.h * s), zIndex: p.front ? 3 : 1, rotate: `${(rand(p.seed + 13) - 0.5) * 40}deg` }}
          />
        );
      })}
      <img
        src={scene.pack}
        alt=""
        className="absolute z-[2] drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
        style={at(0, 0, PACK_H * scene.packAspect, PACK_H)}
      />
    </div>
  );
}
