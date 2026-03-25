import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { cosmicState } from '../config/spaceConfig';

// 1. Accretion Disk (Yığılım Diski) İçin Özel GLSL Shader
const AccretionDiskMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorInner: new THREE.Color('#ffffff'), // Merkez bembeyaz sıcak
    uColorOuter: new THREE.Color('#ff4400'), // Dışa doğru kızıllaşan gaz
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  varying vec2 vUv;

  // Rastgelelik/Gürültü fonksiyonu
  float random(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // vUv.x = dairesel açı (0'dan 1'e)
    // vUv.y = yarıçap (0 iç kenar, 1 dış kenar)
    float radius = vUv.y;
    float angle = vUv.x * 6.28318;

    // Girdap (Swirl) ve Akış Efekti
    float timeScaled = uTime * 2.0;
    vec2 noiseUv = vec2(angle * 10.0 - timeScaled, radius * 15.0 + timeScaled * 0.5);
    
    float noise = random(floor(noiseUv * 1.5)) * 0.4 + random(noiseUv * 5.0) * 0.6;

    // İçten ve dıştan pürüzsüz kaybolma (Smooth şeffaflık)
    float edgeAlpha = smoothstep(0.0, 0.2, radius) * smoothstep(1.0, 0.5, radius);
    
    // Gaz bulutu hissiyatı için gürültü ile saydamlığı birleştir
    float alpha = edgeAlpha * (0.2 + 0.8 * noise);

    // Renkleri merkeze göre geçişli yap
    vec3 color = mix(uColorInner, uColorOuter, pow(radius, 0.6));

    gl_FragColor = vec4(color, alpha);
  }
  `
);

// React Three Fiber tag havuzuna ekliyoruz ( <accretionDiskMaterial /> )
extend({ AccretionDiskMaterial });


export default function BlackHoleEntity({ entity }) {
  const diskMatRef = useRef();

  // Kameranın buraya uçabilmesi için objenin statik pozisyonlarını global tracker'a ekliyoruz
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
    // Shader'a zaman değişkenini (uTime) göndererek gazın akılmasını/dönmesini sağlıyoruz
    if (diskMatRef.current) {
      diskMatRef.current.uTime += delta;
    }
  });

  const size = entity.size || 50;

  return (
    // Eksen eğikliği
    <group position={entity.position || [0, 0, 0]} rotation={[0, 0, entity.axialTilt ? entity.axialTilt * (Math.PI/180) : 0]}>
      
      {/* 1. Yığılım Diski (Accretion Disk) - Gelişmiş Şeffaf GLSL Shader */}
      <mesh rotation={[Math.PI / 2.1, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 5.0, 128]} />
        <accretionDiskMaterial 
          ref={diskMatRef} 
          transparent={true} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 2. Olay Ufku (Event Horizon) - Kırılma lensinin İÇİNDE kalmalı ancak ışığı tamamen emmeli */}
      <mesh>
        <sphereGeometry args={[size * 1.0, 64, 64]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* 3. Gravitational Lensing (Kırılma Lensi) */}
      <mesh>
        <sphereGeometry args={[size * 2.5, 64, 64]} />
        <MeshTransmissionMaterial 
          transmission={1}
          thickness={size * 4} 
          ior={2.5} 
          chromaticAberration={0.05} // Renk bozulması minimuma indirildi
          roughness={0} // Asla buzlu cam gibi bulanıklaşmaz! 
          clearcoat={1}
          distortion={0} // SIFIR! Şekilsiz dalgalanmayı kapatır ve matematiksel yuvarlak mercek sağlar.
          backside={true} 
        />
      </mesh>
      
    </group>
  );
}
