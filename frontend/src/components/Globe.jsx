import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function latLngToXYZ(lat, lng, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [-(r * Math.sin(phi) * Math.cos(theta)), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}
function LocationPin({ position }) {
  const pos = useMemo(() => new THREE.Vector3(...position), [position]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
    return q;
  }, [pos]);

  return (
    <group position={pos} quaternion={quaternion}>
       <mesh position={[0, 0.02, 0]}>
         <cylinderGeometry args={[0.003, 0.003, 0.04, 4]} />
        <meshBasicMaterial color="#34d399" />
       </mesh>
       <mesh position={[0, 0.055, 0]}>
         <sphereGeometry args={[0.018, 8, 8]} />
         <meshBasicMaterial color="#10b981" />
       </mesh>
       <mesh position={[0, 0.055, 0]}>
         <sphereGeometry args={[0.007, 6, 6]} />
         <meshBasicMaterial color="#ffffff" />
       </mesh>
    </group>
  );
}

function InternalParticles() {
  const geo = useMemo(() => {
    const positions = [];
    const count = 200;
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#10b981" size={0.015} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function InternalRings() {
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.21, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <ringGeometry args={[1.0, 1.01, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, -Math.PI / 3, Math.PI / 6]}>
        <ringGeometry args={[0.8, 0.81, 64]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function GlobeMesh() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  const markers = useMemo(() => [
    [28.6, 77.2], [40.7, -74.0], [51.5, -0.1], [35.7, 139.7],
    [-33.9, 18.4], [-23.5, -46.6], [1.3, 103.8], [48.9, 2.3],
    [55.8, 37.6], [-37.8, 144.9], [19.4, -99.1], [30.0, 31.2],
  ].map(([lat, lng]) => latLngToXYZ(lat, lng, 1.72)), []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.7, 36, 36]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.25} />
      </mesh>

      <InternalParticles />

      <InternalRings />

      {markers.map((pos, i) => <LocationPin key={i} position={pos} />)}
    </group>
  );
}

export default function Globe() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <GlobeMesh />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
