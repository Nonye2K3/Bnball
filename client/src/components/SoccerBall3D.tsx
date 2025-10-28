import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function Ball({ position, scale, autoRotate = true }: { position: [number, number, number]; scale: number; autoRotate?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (autoRotate) {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
      }
      
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Mouse follow effect
      const mouseX = state.mouse.x * 0.3;
      const mouseY = state.mouse.y * 0.3;
      meshRef.current.rotation.x += (mouseY - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (mouseX - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? '#1a1a1a' : '#0a0a0a'}
        metalness={0.7}
        roughness={0.3}
        emissive={hovered ? '#FFD700' : '#000000'}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
      
      {/* Soccer ball pattern using simple geometry */}
      <Sphere args={[1.01, 32, 32]} scale={1}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.8}
          wireframe
        />
      </Sphere>
      
      {/* Binance logo representation (yellow diamond shape) */}
      <mesh position={[0, 0, 1.05]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 1.05]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </mesh>
  );
}

export function SoccerBall3D() {
  return (
    <div className="w-full h-full pointer-events-auto" style={{ minHeight: '500px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <spotLight position={[-10, -10, -5]} intensity={0.5} color="#FFD700" />
        <pointLight position={[0, 5, 5]} intensity={0.5} color="#00FF41" />
        
        {/* Two soccer balls at different positions and sizes */}
        <Ball position={[-1.5, 0, 0]} scale={0.8} />
        <Ball position={[1, 0.5, 0]} scale={1.2} autoRotate />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
