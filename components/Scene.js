"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import {
  Float,
  Stars,
  MeshDistortMaterial,
  PerspectiveCamera,
} from "@react-three/drei";

function FuturisticShape(props) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.2 : 1}
    >
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <MeshDistortMaterial
        color={hovered ? "#732ADF" : "#65BBBD"}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div className="w-full h-full min-h-50 absolute inset-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
        />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#732ADF"
        />

        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <FuturisticShape position={[0, 0, 0]} />
        </Float>

        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>
    </div>
  );
}
