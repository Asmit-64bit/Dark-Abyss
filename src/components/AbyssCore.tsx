import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Decorative Three.js anomaly ported from Schrodinger's Abyss. */
export function AbyssCore({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const anomaly = new THREE.Group();
    scene.add(anomaly);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.28, 3),
      new THREE.MeshBasicMaterial({ color: 0x45100d, wireframe: true, transparent: true, opacity: 0.92 }),
    );
    anomaly.add(core);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.86, 2),
      new THREE.MeshBasicMaterial({ color: 0xb41616, wireframe: true, transparent: true, opacity: 0.5 }),
    );
    anomaly.add(inner);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x811b19, transparent: true, opacity: 0.56 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.018, 8, 100), ringMaterial);
    ringA.rotation.x = Math.PI / 2.7;
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.012, 8, 100), ringMaterial.clone());
    ringB.rotation.set(Math.PI / 3, Math.PI / 4, 0);
    anomaly.add(ringA, ringB);

    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xdd3c31, size: 0.03, transparent: true, opacity: 0.68 }),
    );
    const positions = new Float32Array(360 * 3);
    for (let index = 0; index < 360; index += 1) {
      const radius = 2.2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    particles.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    anomaly.add(particles);

    const light = new THREE.PointLight(0xc4261d, 12, 10);
    light.position.set(0, 0, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x210606, 0.9));

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      // updateStyle=true: the canvas has no CSS sizing of its own (only its wrapper
      // div does), so without this it displays at its raw width/height *attribute*
      // values — which encode the DPR-scaled buffer size — and gets clipped on any
      // display with devicePixelRatio > 1.
      renderer.setSize(width, height, true);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const animate = (time: number) => {
      anomaly.rotation.y = time * 0.0001;
      anomaly.rotation.x = Math.sin(time * 0.00024) * 0.16;
      anomaly.scale.setScalar(1 + Math.sin(time * 0.002) * 0.045);
      inner.rotation.y = -time * 0.00028;
      ringA.rotation.z = time * 0.00034;
      ringB.rotation.z = -time * 0.00022;
      particles.rotation.y = -time * 0.00006;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      inner.geometry.dispose();
      (inner.material as THREE.Material).dispose();
      ringA.geometry.dispose();
      (ringA.material as THREE.Material).dispose();
      ringB.geometry.dispose();
      (ringB.material as THREE.Material).dispose();
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className={`abyss-core-canvas ${className}`} />;
}
