import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { cosmicState } from '../config/spaceConfig';

function EntityMaterial({ textures, size, isSun }) {
  // cloudsMap özel bir katman olduğu için standart material propertylerinden ayırıyoruz
  const { cloudsMap, ...standardTextures } = textures;

  // Standart texture'lar (map, normalMap, specularMap vb.) yükleniyor
  const loadedProps = Object.keys(standardTextures).length > 0 ? useTexture(standardTextures) : {};

  // Eğer bulut katmanı belirtilmişse ayrıca yüklüyoruz
  const loadedClouds = cloudsMap ? useTexture(cloudsMap) : null;

  return (
    <>
      {/* meshStandardMaterial specularMap desteklemez, meshPhongMaterial destekler.
          Gezegen texture paketleri genelde phong materyaline göre (specular) hazırlanır.
          Ayrıca obje Güneş ise (isSun), karanlık kalmaması için kendi kendine parıl (emissive) efekti veriyoruz. */}
      <meshPhongMaterial
        {...loadedProps}
        emissive={isSun ? '#ffffff' : '#000000'}
        emissiveMap={isSun ? loadedProps.map : null}
        emissiveIntensity={isSun ? 1.5 : 0}
      />

      {loadedClouds && (
        <mesh>
          <sphereGeometry args={[size * 1.01, 64, 64]} />
          <meshPhongMaterial
            map={loadedClouds}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
            blending={2} // THREE.AdditiveBlending daha iyi bulut görünümü verebilir
          />
        </mesh>
      )}
    </>
  );
}

export default function SpaceEntity({ entity }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const orbitRef = useRef({ angle: entity.orbitAngle || 0 });

  // Initialize central tracking for CameraAnimator
  useEffect(() => {
    if (!cosmicState.entityData[entity.id]) {
      cosmicState.entityData[entity.id] = {
        position: new THREE.Vector3(...(entity.position || [0, 0, 0])),
        lookAtPoint: new THREE.Vector3(...(entity.lookAtPoint || [0, 0, 0])),
        tourPosition: new THREE.Vector3(...(entity.tourPosition || [0, 0, 0]))
      };
    }
  }, [entity]);

  useFrame((state, delta) => {
    // 1. Kendi etrafında dönüş (Axial Rotation)
    if (meshRef.current && entity.rotationSpeed) {
      meshRef.current.rotation.y += entity.rotationSpeed[1] * cosmicState.timeMultiplier || 0;
    }

    // 2. Güneş etrafında yörünge (Orbital Revolution) ve Uydu Yörüngesi
    if (groupRef.current && (entity.orbitRadius || entity.isSatelliteOf)) {
      // Delta time ve zaman hızlandırıcısı ile yörünge açısını güncelle
      orbitRef.current.angle += (entity.orbitSpeed || entity.satelliteSpeed || 0) * delta * cosmicState.timeMultiplier;

      let x = 0, z = 0, y = entity.position?.[1] || 0;

      // Eğer Ay gibi bir uyduysa, merkez noktasını bağlı olduğu gezegene al
      if (entity.isSatelliteOf && cosmicState.entityData[entity.isSatelliteOf]) {
        const parentPos = cosmicState.entityData[entity.isSatelliteOf].position;
        x = parentPos.x + Math.cos(orbitRef.current.angle) * entity.satelliteRadius;
        z = parentPos.z + Math.sin(orbitRef.current.angle) * entity.satelliteRadius;
        y = parentPos.y + (Math.sin(orbitRef.current.angle) * 2); // Havada hafif 3D eğimli yörünge
      } else {
        // Normal güneş etrafında yörünge
        x = Math.cos(orbitRef.current.angle) * entity.orbitRadius;
        z = Math.sin(orbitRef.current.angle) * entity.orbitRadius;
      }

      // Grubu fiziksel olarak hareket ettir
      groupRef.current.position.set(x, y, z);

      // 3. Uzay Kamerasının (CameraAnimator) takip edebilmesi için Global State'e anlık konum yazıyoruz
      if (cosmicState.entityData[entity.id]) {
        const pSize = entity.size || 1;
        // Kamera hedefe ne kadar yaklaşsın (Aya çok girmemesi için alt sınır 9)
        const offsetDist = Math.max(9, pSize * 2.5 + 4); 

        cosmicState.entityData[entity.id].position.set(x, y, z);
        cosmicState.entityData[entity.id].lookAtPoint.set(x, y, z);
        // Kamerayı gezegene yaklaştır ve yörünge açısından hafif çapraz/yukarıdan bak
        cosmicState.entityData[entity.id].tourPosition.set(
          x + Math.cos(orbitRef.current.angle - 0.2) * offsetDist,
          y + Math.max(1.5, pSize * 1.2),
          z + Math.sin(orbitRef.current.angle - 0.2) * offsetDist
        );
      }
    }
  });

  const tiltRad = entity.axialTilt ? entity.axialTilt * (Math.PI / 180) : 0;
  const textureObj = entity.textures || (entity.textureUrl ? { map: entity.textureUrl } : null);

  // Güneş ışığı (PointLight)
  const isSun = entity.id === 'sun';

  return (
    <>
      {/* 4. Yörünge Çizgisi (Orbit Trail) */}
      {!isSun && entity.orbitRadius && !entity.isSatelliteOf && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[entity.orbitRadius - 0.2, entity.orbitRadius + 0.2, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Gezegen Grubu */}
      <group ref={groupRef} position={entity.position || [0, 0, 0]} rotation={[0, 0, tiltRad]}>
        {isSun && <pointLight position={[0, 0, 0]} intensity={8000} distance={4000} decay={2} color="#ffffff" />}
        <mesh ref={meshRef}>
          <sphereGeometry args={[entity.size || 1, 64, 64]} />
          {textureObj ? (
            <EntityMaterial textures={textureObj} size={entity.size || 1} isSun={isSun} />
          ) : (
            <meshPhongMaterial color="white" wireframe />
          )}
        </mesh>
      </group>
    </>
  );
}
