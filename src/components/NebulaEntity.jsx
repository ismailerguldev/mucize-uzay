import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { cosmicState } from '../config/spaceConfig';

// 1. Rosette (Gül) Bulutsusu İçin Özel GLSL Volumetric Shader
const RosetteNebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorHole: new THREE.Color('#ffaa55'), // Merkez sıcak ışıma 
    uColorCore: new THREE.Color('#ff0033'), // Gül yaprakları (Derin Kırmızı)
    uColorEdge: new THREE.Color('#440022'), // Dış uzaya dağılan karanlık kızıl
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
  uniform vec3 uColorHole;
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  varying vec2 vUv;

  // 2D Pseudo-Random
  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Gürültü (Noise)
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
  }

  // Kesirli Brown Hareketi (Fractional Brownian Motion - FBM)
  // Gaz bulutlarının o pamuksu ve karmaşık yapısını simüle etmek için!
  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  void main() {
      // UV koordinatlarını merkeze al (0,0)
      vec2 uv = vUv - 0.5;
      
      // Bulutsu çok yavaşça kendi etrafında dönsün
      float s = sin(uTime * 0.05);
      float c = cos(uTime * 0.05);
      uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

      // Açı ve Merkezi Uzaklık
      float dist = length(uv);
      float angle = atan(uv.y, uv.x);

      // 6 Taç Yapraklı Gül (Rosette) Bükülmesi
      float petal = sin(angle * 6.0) * 0.02;
      float modifiedDist = dist + petal;

      // Dinamik FBM Alanları (İç içe geçmiş gaz katmanları)
      vec2 q = vec2(0.0);
      q.x = fbm(uv * 4.0 + uTime * 0.1);
      q.y = fbm(uv * 4.0 + vec2(1.0));

      vec2 r = vec2(0.0);
      r.x = fbm(uv * 5.0 + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
      r.y = fbm(uv * 5.0 + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

      float f = fbm(uv * 3.0 + r);

      // Merkezde devasa bir delik aç (Yıldız radyasyonu gazı itmiş) ve dışarı doğru yumuşatarak kaybet
      float alphaMask = smoothstep(0.08, 0.25, modifiedDist) * smoothstep(0.5, 0.3, modifiedDist);
      
      // FBM Gürültüsü ve Maskeyi birleştir
      float density = f * alphaMask;
      
      // Renk Karışımı (Gradient)
      // Dışarıdan içeriye doğru koyudan aydınlığa renklendirme
      vec3 color = mix(uColorCore, uColorEdge, smoothstep(0.15, 0.4, modifiedDist));
      color = mix(uColorHole, color, smoothstep(0.05, 0.25, modifiedDist));

      // Yoğun bloblarda ana kırmızı rengi güçlendir (Fotoğraflardaki gibi parlak gaz havuzları)
      color += f * 0.6 * uColorCore;

      // Opaklık (Density) hesaplaması, gaz ne kadar yoğunsa o kadar görünür
      gl_FragColor = vec4(color, density * 2.0);
  }
  `
);

// React Three Fiber'a özel tag oluştur
extend({ RosetteNebulaMaterial });

export default function NebulaEntity({ entity }) {
  const shaderMatRef = useRef();
  const groupRef = useRef();
  const size = entity.size || 300;

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
    // Zaman parametresini güncelleyerek gazı hareketlendir (uTime)
    if (shaderMatRef.current) {
      shaderMatRef.current.uTime += delta * 0.5; // Akış hızı
    }
    
    // Kamera billboard efekti: Hangi açıdan gelirsek gelelim devasa plane'i her zaman kameraya dik tut!
    if (groupRef.current) {
      groupRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={entity.position || [0, 0, 0]}>
      {/* 
        UV sınırlarının [0,1] olduğunu biliyoruz, Shader içinde -0.5 yapıp merkezi sıfıra aldık.
        Dairesel bir gaz bulutu olduğu için kare bir plane yeterlidir, Alpha kendi sınırlarını gizleyecektir.
      */}
      <mesh>
        <planeGeometry args={[size * 3, size * 3]} />
        <rosetteNebulaMaterial 
          ref={shaderMatRef} 
          transparent={true} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}
