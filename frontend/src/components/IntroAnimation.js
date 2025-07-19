// src/components/IntroAnimation.js

import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Galaxy() {
  const ref = useRef();
  const numPoints = 150000;
  const radius = 8;

  // Genera las posiciones de las estrellas
  const positions = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    const r = Math.random() * radius;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  // Anima la galaxia en cada frame
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.1;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ec008c"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function IntroAnimation({ onAnimationComplete }) {
  const wrapperRef = useRef();

  useEffect(() => {
    // Simula el final de la animación después de unos segundos
    const timer = setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = 'opacity 1s ease-out';
        wrapperRef.current.style.opacity = 0;
        wrapperRef.current.ontransitionend = onAnimationComplete;
      }
    }, 4000); // Duración de la intro

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div ref={wrapperRef} className="fixed inset-0 bg-black z-50">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Galaxy />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl font-black text-white tracking-wider">
          <span style={{ color: 'var(--theme-primary)' }}>MAYA</span>
          <span style={{ color: 'var(--theme-secondary)' }}>DIGITAL</span>
        </h1>
      </div>
    </div>
  );
}