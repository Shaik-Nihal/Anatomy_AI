import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";

function HologramMesh() {
  const meshRef = useRef();

  // Constantly rotate the mesh
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial 
          color="#06B6D4"
          emissive="#3B82F6"
          emissiveIntensity={1.5}
          wireframe={true}
          distort={0.3}
          speed={3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Inner solid core */}
      <mesh ref={meshRef} scale={0.6}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial 
          color="#10B981"
          emissive="#06B6D4"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={1}
        />
      </mesh>
    </Float>
  );
}

export default function HologramLogo() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} color="#A78BFA" intensity={2} />
        
        <HologramMesh />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
