import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function GLBEntity({ entity }) {
  const meshRef = useRef();
  
  // Model yüklenirken askıya alma (Suspend) durumu kullanılabilir. Ana bileşende Suspense kullanılmalı.
  const { scene } = useGLTF(entity.glbUrl);

  const tiltRad = entity.axialTilt ? (entity.axialTilt * Math.PI) / 180 : 0;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += (entity.rotationSpeed?.[0] || 0) * delta * 60;
      meshRef.current.rotation.y += (entity.rotationSpeed?.[1] || 0) * delta * 60;
      meshRef.current.rotation.z += (entity.rotationSpeed?.[2] || 0) * delta * 60;
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene.clone()} 
      position={entity.position || [0, 0, 0]} 
      rotation={[0, 0, tiltRad]}
      scale={entity.scale || 1} 
    />
  );
}
