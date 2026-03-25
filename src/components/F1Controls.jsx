import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';

export default function F1Controls({ overlayRef }) {
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false, space: false });
  const controlsRef = useRef();

  // İlk render edildiğinde fareyi otomatik kilitlemeyi dener (bazı tarayıcılar izin vermeyebilir, tık gerektirebilir)
  useEffect(() => {
    if (controlsRef.current) {
      setTimeout(() => {
        try {
          controlsRef.current.lock();
        } catch(e) { /* ignore */ }
      }, 100);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = true; break;
        case 'KeyA': keys.current.a = true; break;
        case 'KeyS': keys.current.s = true; break;
        case 'KeyD': keys.current.d = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': keys.current.shift = true; break;
        case 'Space': keys.current.space = true; break;
        default: break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = false; break;
        case 'KeyA': keys.current.a = false; break;
        case 'KeyS': keys.current.s = false; break;
        case 'KeyD': keys.current.d = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': keys.current.shift = false; break;
        case 'Space': keys.current.space = false; break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const baseSpeed = 10;
    const speed = keys.current.shift ? baseSpeed * 3 : baseSpeed;
    const velocity = speed * delta;

    if (keys.current.w) camera.translateZ(-velocity);
    if (keys.current.s) camera.translateZ(velocity);
    if (keys.current.a) camera.translateX(-velocity);
    if (keys.current.d) camera.translateX(velocity);
    if (keys.current.space) camera.translateY(velocity);

    if (overlayRef.current) {
      const pos = camera.position;
      const rot = camera.quaternion;
      // React state yerine doğrudan DOM elementini güncelliyoruz -> 60fps performans sağlar
      overlayRef.current.innerHTML = `
        <div style="margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">
          <b style="color: #fff">🚀 UÇUŞ MODU (F1)</b><br/>
          <span style="font-size: 11px; color: #aaa;">Hareket: W/A/S/D | Yüksel: Space | Hızlı: Shift</span><br/>
          <span style="font-size: 10px; color: #ff5555;">Kilit çözmek için ESC'ye, moddan çıkmak için tekrar F1'e basın.</span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: #ffaa00">📍 Position (X, Y, Z):</strong><br/>
          <div style="font-size: 16px; margin-top:4px;">
            [ ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)} ]
          </div>
        </div>
        <div>
          <strong style="color: #00aaff">🔄 Quaternion (X, Y, Z, W):</strong><br/>
          <div style="font-size: 16px; margin-top:4px;">
            [ ${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)}, ${rot.w.toFixed(2)} ]
          </div>
        </div>
      `;
    }
  });

  return <PointerLockControls ref={controlsRef} />;
}
