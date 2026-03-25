import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { cosmicState, mainMenu } from '../config/spaceConfig';

export default function CameraAnimator({ targetId, isF1Mode }) {
  const dummyCamera = useRef(new THREE.PerspectiveCamera());

  useFrame((state, delta) => {
    // F1 Modundayken kamerayı oyuncu (kullanıcı) yönetir
    if (isF1Mode) return;

    let tPos = null;
    let tLookAt = null;

    // Hedef Ana Menü ise statik kordinatlara git
    if (targetId === "mainMenu") {
      tPos = new THREE.Vector3(...mainMenu.position);
      tLookAt = new THREE.Vector3(...mainMenu.lookAtPoint);
    } 
    // Hedef bir gezegen ise (hareketli veya hareketsiz)
    else if (targetId && cosmicState.entityData[targetId]) {
      tPos = cosmicState.entityData[targetId].tourPosition;
      tLookAt = cosmicState.entityData[targetId].lookAtPoint;
    }

    if (!tPos || !tLookAt) return;

    const lerpSpeed = 3.5 * delta; // Gecikmeyi önlemek için hızlandırıldı

    // 1. Kamerayı hedefin (Sürekli değişen yörünge) konumuna usulca yaklaştır
    state.camera.position.lerp(tPos, lerpSpeed);

    // 2. Dummy kamerayı tam o konuma oturt ve hedefin anlık tam merkezine baktır
    dummyCamera.current.position.copy(state.camera.position);
    dummyCamera.current.lookAt(tLookAt);

    // 3. Ana kameranın görüş açısını (Quaternion) Dummy kameranın hesapladığı açıya Slerp ile pürüzsüzce hizala
    state.camera.quaternion.slerp(dummyCamera.current.quaternion, lerpSpeed);
  });

  return null;
}
