import * as THREE from 'three';

// --- KÜRESEL UZAY DURUMU (GLOBAL STATE) ---
// Zamanın hızını ve gezegenlerin anlık dinamik pozisyonlarını tutar.
// React state kullanmıyoruz çünkü saniyede 60 kez güncellenecek (Performans optimizasyonu)
export const cosmicState = {
  timeMultiplier: 1, // 0 = Duraklat, 1 = Normal, >1 = Hızlandır
  entityData: {}     // Örn: { earth: { position: Vector3, lookAtPoint: Vector3 } }
};

// ... Gezegen ve Menü Ayarları ...
export const spaceConfig = {
  sunSize: 50,
};

export const mainMenu = {
  position: [0, 500, 1000],
  lookAtPoint: [0, 0, 0], // Güneşin merkezi
  infoBox: {
    title: "Mucize Uzay",
    description: "Güneş sistemimizin o muazzam düzenini ve muhteşem cisimlerini tanımaya ne dersiniz? Etkileşimli JavaScript uygulaması ile güneş sistemimizi yakından tanıyın! NOT: F1 TUŞUNA BASARAK GEZİNTİ MODUNA GEÇEBİLİR, ÖZGÜRLÜĞÜN TADINI ÇIKARABİLİRSİNİZ!",
    float: "left",
    margin: 60,
    top: 0,
    bottom: 20
  }
};

export const varlıklar = [
  {
    id: "sun", name: "Güneş", gezintiIndex: 0,
    position: [0, 0, 0],
    lookAtPoint: [0, 0, 0],
    tourPosition: [90, 10, 80],
    textures: { map: '/textures/sun.jpg' },
    infoBox: {
      title: "Güneş",
      description: "Sistemimizin merkezi yıldızı. Devasa nükleer reaksiyonlarla ısı ve ışık saçan, her şeyi bir arada tutan çekim merkezi. Çapı yaklaşık 1.39 milyon km'dir ve içine 1 milyon Dünya sığabilir. Güneş'in yüzey sıcaklığı 5.500°C iken çekirdek sıcaklığı 15 milyon°C'dir.",
      float: "left", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.002, 0], axialTilt: 7.25, size: spaceConfig.sunSize
  },
  {
    id: "mercury", name: "Merkür", gezintiIndex: 1,
    orbitRadius: 52, orbitSpeed: 0.04, orbitAngle: 2.1,
    // position, lookAtPoint, tourPosition dinamik hesaplanacak
    textures: { map: '/textures/mercury.jpg' },
    infoBox: {
      title: "Merkür",
      description: "Güneş'e en yakın ve en küçük gezegen. Gündüzleri kurşunu eritecek kadar sıcak (430°C), geceleri ise dondurucu soğuk (-180°C). Çapı 4.880 km'dir. Atmosferi olmadığı için sıcaklık farkı Güneş Sistemi'ndeki en yüksek değerdedir. Kendi etrafında çok yavaş döner.",
      float: "right", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.005, 0], axialTilt: 0.03, size: 0.17
  },
  {
    id: "venus", name: "Venüs", gezintiIndex: 2,
    orbitRadius: 100, orbitSpeed: 0.015, orbitAngle: 4.5,
    textures: { map: '/textures/venus_surface.jpg', normalMap: '/textures/venus_atmosphere.jpg' },
    infoBox: {
      title: "Venüs",
      description: "Fenasal bir sıcaklığa ve sülfürik asit yağmurlarına sahip, kendi etrafında ters dönen gizemli komşumuz. Yüzey sıcaklığı 462 - 471 °C'dir. Venüs, Güneş Sistemi'ndeki en sıcak gezegendir. Atmosfer basıncı Dünya'nınkinden 90 kat daha fazladır. Venüs'ün bir günü, bir yılından daha uzundur. Venüs'ün yüzeyinde volkanik dağlar ve geniş lav ovaları bulunur. Venüs'ün atmosferi karbondioksitten oluşur. Venüsün çapı 12.104 km'dir.",
      float: "left", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 177, size: 0.43
  },
  {
    id: "earth", name: "Dünya (Earth)", gezintiIndex: 3,
    orbitRadius: 152, orbitSpeed: 0.01, orbitAngle: 0.0,
    textures: { map: '/textures/earth_daymap.jpg', normalMap: '/textures/earth_normalmap.jpg', specularMap: '/textures/earth_specularmap.jpg' },
    infoBox: {
      title: "Dünya (Earth)",
      description: "Güneş Sistemi'ndeki tek yaşam barındıran gezegenimiz. Yüzeyinin %71'i sularla kaplıdır. Dünya'nın çapı 12.742 km'dir. Yüzey sıcaklığı değişkenlik gösterir. Dünya atmosferi, gezegeni çevreleyen %78 azot, %21 oksijen ve %1 diğer gazlardan (argon, karbondioksit vb.) oluşan, yaşamı koruyan gaz kütlesidir. Yerden yukarı doğru troposfer, stratosfer, mezosfer, termosfer ve ekzosfer katmanlarından oluşur.",
      float: "left", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 23.5, size: 0.45
  },
  {
    id: "moon", name: "Ay", gezintiIndex: 4,
    // Ay'ı Dünya'nın uydusu olarak manuel veya basit kodla bağlayacağız. Şimdilik kendi yörüngesini dünya merkezine bağlıyoruz.
    isSatelliteOf: "earth", satelliteRadius: 8, satelliteSpeed: 0.1, orbitAngle: 0,
    textures: { map: '/textures/moon.jpg' },
    infoBox: {
      title: "Ay",
      description: "Dünya'nın tek doğal uydusudur. Gelgit olaylarına yön verir ve geceyi aydınlatır. Ay'ın çapı 3.474,8 km'dir. Yüzey sıcaklığı -173 °C ile 127 °C arasında değişir. Ay'ın yüzeyi kraterlerle doludur. Ay'ın atmosferi yoktur.",
      float: "left", margin: 80, top: 0, bottom: 0
    },
    rotationSpeed: [0, 0.018, 0], axialTilt: 6.6, size: 0.12
  },
  {
    id: "mars", name: "Mars", gezintiIndex: 5,
    orbitRadius: 228, orbitSpeed: 0.005, orbitAngle: 1.2,
    textures: { map: '/textures/mars.jpg' },
    infoBox: {
      title: "Mars",
      description: "Kızıl Gezegen. Demir oksit kaplı yüzeyi ve eskiden akarsular barındırdığına dair kurumuş vadileriyle bilinir. Mars'ın çapı 6.779 km'dir. Yüzey sıcaklığı -153 °C ile 20 °C arasında değişir. Mars'ın yüzeyi kraterlerle doludur. Mars'ın atmosferi karbondioksitten oluşur. Mars'ın en yüksek dağı Olympus Mons'tur. Yaklaşık 22.000-25.000 metre yüksekliktedir.",
      float: "right", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 25.1, size: 0.24
  },
  {
    id: "jupiter", name: "Jüpiter", gezintiIndex: 6,
    orbitRadius: 452, orbitSpeed: 0.001, orbitAngle: 3.5,
    textures: { map: '/textures/jupiter.jpg' },
    infoBox: {
      title: "Jüpiter",
      description: "Sistemin tartışmasız kralı. Diğer tüm gezegenlerin toplamından 2.5 kat daha ağır olan muazzam bir gaz devidir. Jüpiter'in çapı 139.820 km'dir. Jüpiter'in atmosferinin üst katmanlarındaki (bulut tepeleri) ortalama sıcaklık yaklaşık -110°C ile -145°C arasındadır. Bir gaz devi olduğu için katı bir yüzeyi yoktur; derine inildikçe basınç ve sıcaklık aşırı derecede artar, merkezindeki sıcaklığın ise 24.000°C ile 35.000°C dereceye kadar ulaşabileceği düşünülmektedir. ",
      float: "right", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 3.1, size: 5.0
  },
  {
    id: "saturn", name: "Satürn", gezintiIndex: 7,
    orbitRadius: 650, orbitSpeed: 0.0007, orbitAngle: 5.8,
    textures: { map: '/textures/saturn.jpg', rings: '/textures/saturnRing.png' },
    infoBox: {
      title: "Satürn",
      description: "Görkemli halkalarıyla bilinen, Güneş sistemimizin mücevheri. Okyanusa atılsaydı yoğunluğu sudan hafif olduğu için yüzerdi. Satürn de aynı Jüpiter gibi bir gaz devidir. Çapı 116.460 km'dir. Satürn'ün katı bir yüzeyi yoktur; gaz devinin üst bulut katmanlarındaki ortalama sıcaklık yaklaşık -180°C civarındadır. Satürn'ün halkaları, %90-95 oranında su buzu ile kaplı kaya ve toz parçacıklarından oluşur. Bu parçacıkların boyutu mikroskobik toz tanelerinden, ev veya otobüs büyüklüğündeki devasa kaya kütlelerine kadar çeşitlilik gösterir. ",
      float: "left", margin: 80, top: -20, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 26.7, size: 4.16
  },
  {
    id: "uranus", name: "Uranüs", gezintiIndex: 8,
    orbitRadius: 960, orbitSpeed: 0.0003, orbitAngle: 0.5,
    textures: { map: '/textures/uranus.jpg' },
    infoBox: {
      title: "Uranüs",
      description: "Buz devleri sınıfında yer alan, yan yatmış ekseni sebebiyle yuvarlanarak dönen soğuk ve uzak bir gezegen. Uranüs, Güneş Sistemi'ndeki diğer gezegenlerden farklı olarak neredeyse yan yatmış bir şekilde döner. Eksen eğikliği yaklaşık 97.7 derecedir. Bu durum, Uranüs'ün mevsimlerinin aşırı uçlarda yaşanmasına neden olur. Gezegenin yüzey sıcaklığı yaklaşık -195 ile -224°C civarındadır. Uranüs'ün atmosferi çoğunlukla hidrojen ve helyumdan oluşur. Uranüs'ün çapı 50.724 km'dir.",
      float: "right", margin: 80, top: 0, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 97.7, size: 1.81
  },
  {
    id: "neptune", name: "Neptün", gezintiIndex: 9,
    orbitRadius: 1300, orbitSpeed: 0.0001, orbitAngle: 2.9,
    textures: { map: '/textures/neptune.jpg' },
    infoBox: {
      title: "Neptün",
      description: "Neptün, Güneş Sistemi'ndeki en hızlı rüzgarlara sahip gezegendir ve rüzgar hızları saatte 2.100 km'den (yaklaşık 1300 mil) fazlaya ulaşabilir. Bu süpersonik hızlar, Dünya'daki en şiddetli kasırgalardan bile çok daha güçlüdür ve gezegenin soğuk atmosferi ile iç ısısı arasındaki farktan kaynaklanır. Neptün'ün çapı 49.244 km'dir. Yüzey sıcaklığı -220 ile -214°C civarındadır.",
      float: "left", margin: 80, top: 0, bottom: 0
    },
    rotationSpeed: [0, 0.009, 0], axialTilt: 28.3, size: 1.76
  },
  {
    id: "phoenix_a", name: "Karadelik", gezintiIndex: 10, type: "blackhole",
    position: [2500, 600, -2500],
    lookAtPoint: [2500, 600, -2500],
    tourPosition: [2800, 650, -2200], // Karadeliği caprazdan gosterir
    infoBox: {
      title: "Karadelikler (Black Holes)",
      description: "Karadelikler, uzay-zamanın, kütleçekiminin o kadar güçlü olduğu bir bölgesidir ki, ışık bile oradan kaçamaz. Bu nesneler, devasa yıldızların ömrünün sonunda kendi içine çökmesiyle oluşur. Etraflarındaki madde, karadeliğe doğru çekilirken aşırı ısınır ve parlak bir disk oluşturur. Bu disk, karadeliğin kendisini değil, etrafındaki maddeyi görmemizi sağlar. Karadelikler hakkında doğru bilinen bir yanlışı düzeltelim: Karadelikler aslında anormal derecede çekim gücüne sahip değillerdir. Onları bu kadar güçlü yapan şey yoğunluklarıdır. Yani, Güneş ile aynı kütleli bir karadeliği Güneş'in yerine koysaydık, ışıksız kalmamız dışında yörüngede bir değişiklik olmazdı. Ancak cismin yarıçapı 3 km'ye düşerdi. Veya Güneş'in çapı kadar olan bir kara delik düşünürsek, kütlesi Güneş'ten 236 bin kat fazla olurdu.",
      float: "right", margin: 80, top: 0, bottom: 0
    },
    rotationSpeed: [0, 0.015, 0], axialTilt: 15, size: 60
  },
  {
    id: "rosette_nebula", name: "Bulutsu", gezintiIndex: 11, type: "nebula",
    position: [-3000, -500, 3000],
    lookAtPoint: [-3000, -500, 3000],
    tourPosition: [-5500, -400, 5500], // Nebulayi uzaktan butun olarak gormek icin
    infoBox: {
      title: "Bulutsular (Nebulalar)",
      description: "Devasa gaz ve toz bulutlarından oluşan çarpıcı bir yıldız oluşum bölgesidir. İçindeki genç ve sıcak yıldızların radyasyonu, etrafındaki gazı iyonize ederek bu muazzam fraktal bulutsu yapıyı uca buca sığmaz şekilde aydınlatır.",
      float: "left", margin: 80, top: 0, bottom: 0
    },
    rotationSpeed: [0, 0.001, 0], axialTilt: 99, size: 800
  }
];

export const glbvarlıklar = [];