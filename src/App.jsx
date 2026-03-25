import SpaceViewer from './components/SpaceViewer';
import { Loader } from '@react-three/drei';
import './App.css';

function App() {
  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <SpaceViewer />
      
      {/* 
        PREMIUM YÜKLEME EKRANI: 
        LinkedIn ve portfolyo sunumlarında 3D model/doku dosyalarının aniden belirmesini önleyip 
        yüzdelik bar ile akıcı bir yükleme ekranı gösterir.
      */}
      <Loader 
        containerStyles={{ background: '#000' }} 
        innerStyles={{ width: '400px', height: '4px' }} 
        barStyles={{ background: '#00ffcc' }} 
        dataStyles={{ color: '#00ffcc', fontSize: '16px', fontFamily: 'monospace', paddingTop: '10px' }} 
        dataInterpolation={(p) => `Evren Oluşturuluyor... ${p.toFixed(0)}%`} 
      />
    </div>
  );
}

export default App;
