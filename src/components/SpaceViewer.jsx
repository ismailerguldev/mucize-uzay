import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { varlıklar, glbvarlıklar, mainMenu } from "../config/spaceConfig"
import SpaceEntity from './SpaceEntity';
import GLBEntity from './GLBEntity';
import BlackHoleEntity from './BlackHoleEntity'; 
import NebulaEntity from './NebulaEntity';       
import F1Controls from './F1Controls';
import CameraAnimator from './CameraAnimator'; 
import { cosmicState } from '../config/spaceConfig';
import * as THREE from 'three';

function SkyBox() {
  const texture = useTexture('/textures/space.jpg');
  return (
    <mesh>
      {/* 40.000 birim çapında devasa bir küre */}
      <sphereGeometry args={[40000, 64, 64]} />
      {/* BackSide ile kürenin İÇİNDEN uzaya bakıyoruz */}
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

// Gezinti sırasına göre tüm varlıkları filtreleyip diziyoruz.
const tourList = [...(varlıklar || []), ...(glbvarlıklar || [])]
  .filter(e => e.gezintiIndex !== undefined)
  .sort((a, b) => a.gezintiIndex - b.gezintiIndex);

export default function SpaceViewer() {
  const [isF1Mode, setIsF1Mode] = useState(false);
  const [timeMult, setTimeMult] = useState(1);
  const [timeInput, setTimeInput] = useState("1"); // Yazıyla girmek için

  // tourIndex -1 ise Ana Menü, 0 ve üzeri ise gezinti indexi
  const [tourIndex, setTourIndex] = useState(-1);
  const overlayRef = useRef(null);

  // Arama menüsü state'leri
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsF1Mode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Zaman çarpanını güncelleme fonksiyonu
  const handleTimeChange = (val) => {
    const num = parseFloat(val);
    setTimeInput(val);
    if (!isNaN(num)) {
      cosmicState.timeMultiplier = num;
      setTimeMult(num);
    }
  };

  // Şu anki aktif kamera hedefini alıyoruz
  const currentTarget = tourIndex === -1 ? mainMenu : tourList[tourIndex];
  const targetPos = currentTarget.tourPosition || currentTarget.position;
  const targetLookAtPoint = currentTarget.lookAtPoint || currentTarget.position;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* F1 HUD */}
      <div
        ref={overlayRef}
        style={{
          display: isF1Mode ? 'block' : 'none',
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(0, 0, 8, 0.7)', border: '1px solid rgba(0, 255, 204, 0.3)',
          boxShadow: '0 0 10px rgba(0, 255, 204, 0.1)', color: '#00ffcc',
          padding: '20px', borderRadius: '8px', fontFamily: 'monospace',
          fontSize: '14px', zIndex: 10, pointerEvents: 'none', userSelect: 'none', width: '300px'
        }}
      />

      {/* ZAMAN ÇARPANI (TIME CONTROLLER) UI */}
      {!isF1Mode && (
        <div style={{ 
          position: 'absolute', bottom: 40, left: 40, zIndex: 15, 
          background: 'rgba(10, 15, 25, 0.85)', backdropFilter: 'blur(15px)', 
          padding: '15px 20px', borderRadius: '16px', border: '1px solid rgba(0, 255, 204, 0.3)', 
          color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' 
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '15px', color: '#00ffcc' }}>🚀 Zaman Çarpanı</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="number" 
              value={timeInput} 
              onChange={(e) => handleTimeChange(e.target.value)} 
              style={{ 
                width: '80px', padding: '8px', borderRadius: '8px', 
                border: '1px solid rgba(0,255,204,0.5)', background: 'rgba(0,0,0,0.5)', 
                color: 'white', outline: 'none', fontSize: '14px' 
              }} 
            />
            <span style={{ fontSize: '14px' }}>x Hız</span>
            
            <button onClick={() => handleTimeChange("1")} style={{ cursor: 'pointer', padding: '5px 10px', background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: '5px' }}>1x</button>
            <button onClick={() => handleTimeChange("10")} style={{ cursor: 'pointer', padding: '5px 10px', background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: '5px' }}>10x</button>
          </div>
        </div>
      )}

      {/* ARAMA MENÜSÜ UI */}
      {!isF1Mode && (
        <div style={{ position: 'absolute', bottom: 40, right: 40, zIndex: 15 }}>
          {/* Animated Container */}
          <div style={{
            display: isSearchOpen ? 'block' : 'none',
            background: 'rgba(10, 15, 25, 0.85)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(0, 255, 204, 0.3)',
            borderRadius: '16px',
            padding: '15px',
            marginBottom: '15px',
            width: '280px',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            <input 
              type="text" 
              placeholder="Gezegen Ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 15px', borderRadius: '10px',
                border: '1px solid rgba(0,255,204,0.4)', background: 'rgba(0,0,0,0.5)',
                color: 'white', outline: 'none',
                boxSizing: 'border-box', marginBottom: '10px', fontSize: '15px'
              }}
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
              {tourList
                .filter(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => {
                  const realIndex = tourList.findIndex(t => t.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => { setTourIndex(realIndex); setIsSearchOpen(false); setSearchQuery(''); }}
                      style={{ 
                        padding: '10px 15px', cursor: 'pointer', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px', transition: '0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0,255,204,0.15)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {item.name}
                    </div>
                  );
                })}
            </div>
          </div>

          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{
              background: isSearchOpen ? 'transparent' : '#00ffcc', 
              color: isSearchOpen ? '#00ffcc' : '#000', 
              border: '2px solid #00ffcc', padding: '12px 24px', 
              borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', 
              cursor: 'pointer', float: 'right', transition: '0.3s'
            }}
          >
            {isSearchOpen ? 'Kapat' : '🔍 Hedef Ara'}
          </button>
        </div>
      )}

      {/* METİN KUTUSU (INFO BOX) UI */}
      {!isF1Mode && currentTarget?.infoBox && (
        <div
          key={`info-${tourIndex}`} // Her objede UI'ın yeniden animasyonla gelmesi için
          className="info-box"
          style={{
            position: 'absolute',
            top: '50%',
            marginTop: `${(currentTarget.infoBox.top || 0) - (currentTarget.infoBox.bottom || 0)}px`,
            left: currentTarget.infoBox.float === 'left' ? `${currentTarget.infoBox.margin || 20}px` : 'auto',
            right: currentTarget.infoBox.float === 'right' ? `${currentTarget.infoBox.margin || 20}px` : 'auto',
            zIndex: 5
          }}
        >
          <h2>{currentTarget.infoBox.title}</h2>
          <p>{currentTarget.infoBox.description}</p>
        </div>
      )}

      {/* GEZİNTİ (TOUR) UI */}
      {!isF1Mode && (
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.85)', padding: '15px 30px',
          borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', alignItems: 'center', zIndex: 10
        }}>
          {tourIndex === -1 ? (
            <button
              onClick={() => setTourIndex(0)}
              style={{ background: '#00ffcc', color: '#000', border: 'none', padding: '10px 30px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            >
              BAŞLA
            </button>
          ) : (
            <>
              <button
                onClick={() => setTourIndex(tourIndex - 1)}
                style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}
              >
                Geri
              </button>

              <div style={{ fontSize: '22px', fontWeight: 'bold', minWidth: '150px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                {tourList[tourIndex]?.name}
              </div>

              <button
                disabled={tourIndex === tourList.length - 1}
                onClick={() => setTourIndex(tourIndex + 1)}
                style={{
                  background: tourIndex === tourList.length - 1 ? 'transparent' : '#fff',
                  border: '1px solid #fff',
                  color: tourIndex === tourList.length - 1 ? 'rgba(255,255,255,0.3)' : '#000',
                  padding: '8px 20px', borderRadius: '20px',
                  cursor: tourIndex === tourList.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                İleri
              </button>
            </>
          )}
        </div>
      )}

      {/* fov 45 ve far clip'i devasa boyutlu uzay ortamına uygun olarak artırıyoruz */}
      <Canvas camera={{ position: mainMenu.position, fov: 45, far: 50000 }}>
        <color attach="background" args={['#000000']} />

        <ambientLight intensity={0.35} /> 
        <pointLight position={[0, 0, 0]} intensity={5} distance={50000} decay={0} />

        {isF1Mode ? (
          <F1Controls overlayRef={overlayRef} />
        ) : (
          <CameraAnimator targetId={currentTarget?.id || "mainMenu"} isF1Mode={isF1Mode} />
        )}

        <Suspense fallback={null}>
          <SkyBox />
          {varlıklar && varlıklar.map((entity, index) => {
            if (entity.type === 'blackhole') {
              return <BlackHoleEntity key={entity.id || index} entity={entity} />;
            }
            if (entity.type === 'nebula') {
              return <NebulaEntity key={entity.id || index} entity={entity} />;
            }
            return <SpaceEntity key={entity.id || index} entity={entity} />;
          })}

          {glbvarlıklar && glbvarlıklar.length > 0 && glbvarlıklar.map((entity, index) => (
            <GLBEntity key={entity.id || index} entity={entity} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
