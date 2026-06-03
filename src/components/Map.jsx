import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix des icônes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [locationStatus, setLocationStatus] = useState('Recherche de votre position...');
  const [currentMap, setCurrentMap] = useState('satellite');

  // Configuration des maps
  const maps = {
    satellite: {
      name: '🛰️ Satellite',
      url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '© Google',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    roadmap: {
      name: '🗺️ Plan',
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '© Google',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    terrain: {
      name: '⛰️ Terrain',
      url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '© Google',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    hybrid: {
      name: '🔀 Hybride',
      url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '© Google',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    osm: {
      name: '🌍 OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap',
      subdomains: ['a', 'b', 'c']
    }
  };

  // Initialisation de la carte
  useEffect(() => {
    // Attendre que le DOM soit prêt
    const initMap = () => {
      if (!mapRef.current && document.getElementById('map')) {
        mapRef.current = true;
        
        // Créer la carte
        mapInstanceRef.current = L.map('map', {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([48.8566, 2.3522], 13);
        
        // Ajouter la couche satellite par défaut
        const defaultLayer = L.tileLayer(
          maps.satellite.url,
          {
            attribution: maps.satellite.attribution,
            subdomains: maps.satellite.subdomains,
            maxZoom: 20
          }
        ).addTo(mapInstanceRef.current);
        
        mapInstanceRef.current.currentLayer = defaultLayer;

        // Récupérer la position
        if (navigator.geolocation) {
          setLocationStatus('📍 Recherche de votre position...');
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const userLocation = [latitude, longitude];
              
              console.log("Position trouvée:", latitude, longitude);
              
              // Centrer la carte
              mapInstanceRef.current.setView(userLocation, 15);
              
              // Supprimer l'ancien marqueur
              if (markerRef.current) {
                markerRef.current.remove();
              }
              
              // Ajouter un beau marqueur
              const customIcon = L.divIcon({
                html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>',
                iconSize: [12, 12],
                className: 'custom-marker'
              });
              
              // language=HTML
                markerRef.current = L.marker(userLocation, { icon: customIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
                  <div class="text-center">
                    <strong>📍 Vous êtes ici</strong><br/>
                    <span class="text-sm text-gray-600">Lat: ${latitude.toFixed(4)}</span><br/>
                    <span class="text-sm text-gray-600">Lng: ${longitude.toFixed(4)}</span>
                  </div>
                `)
                .openPopup();
              
              setLocationStatus('✅ Position trouvée !');
              
              // Ajouter un cercle de précision
              L.circle(userLocation, {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                radius: 100
              }).addTo(mapInstanceRef.current);
              
            },
            (error) => {
              console.error("Erreur géoloc:", error);
              let errorMsg = "❌ ";
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg += "Permission refusée. Activez la géolocalisation.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg += "Position non disponible.";
                  break;
                case error.TIMEOUT:
                  errorMsg += "Timeout - Vérifiez votre connexion.";
                  break;
                default:
                  errorMsg += "Erreur inconnue.";
              }
              setLocationStatus(errorMsg);
              mapInstanceRef.current.setView([48.8566, 2.3522], 13);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          setLocationStatus("❌ Géolocalisation non supportée");
        }
      }
    };

    // Petit délai pour que le DOM soit bien prêt
    setTimeout(initMap, 100);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapRef.current = null;
      }
    };
  }, []);

  // Fonction pour changer de map
  const switchMap = (mapType) => {
    if (mapInstanceRef.current && mapInstanceRef.current.currentLayer) {
      mapInstanceRef.current.removeLayer(mapInstanceRef.current.currentLayer);
      
      const newLayer = L.tileLayer(
        maps[mapType].url,
        {
          attribution: maps[mapType].attribution,
          subdomains: maps[mapType].subdomains,
          maxZoom: 20
        }
      ).addTo(mapInstanceRef.current);
      
      mapInstanceRef.current.currentLayer = newLayer;
      setCurrentMap(mapType);
    }
  };

  // Fonction pour recentrer sur la position
  const recenterOnMe = () => {
    setLocationStatus('📍 Recherche...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.flyTo([latitude, longitude], 15, {
            duration: 1.5
          });
          
          // Animation du marqueur existant
          if (markerRef.current) {
            markerRef.current.openPopup();
          }
          
          setLocationStatus('✅ Recentré !');
          setTimeout(() => {
            if (markerRef.current) {
              setLocationStatus('📍 Position active');
            }
          }, 2000);
        },
        (error) => {
          console.error("Erreur:", error);
          setLocationStatus("❌ Impossible de vous localiser");
          setTimeout(() => {
            setLocationStatus("📍 Cliquez sur 'Ma position'");
          }, 3000);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000
        }
      );
    } else {
      setLocationStatus("❌ Géolocalisation non supportée");
    }
  };

  return (
    <div className="relative w-full">
      <div id="map" className="w-full h-150 rounded-xl shadow-lg z-0"></div>
      
      {/* Contrôles - Avec z-index plus élevé */}
      <div className="absolute top-4 right-4 z-1000 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-2 flex flex-col gap-2 min-w-37.5 border border-gray-200">
        <div className="text-xs text-gray-500 mb-1 px-2">Changer de carte :</div>
        {Object.keys(maps).map((key) => (
          <button 
            key={key}
            onClick={() => switchMap(key)} 
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              currentMap === key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {maps[key].name}
          </button>
        ))}
      </div>
      
      {/* Bouton recentrer - z-index élevé */}
      <button 
        onClick={recenterOnMe}
        className="absolute bottom-4 right-4 z-1000 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg shadow-xl transition-all flex items-center gap-2"
      >
        <span className="text-xl">📍</span>
        Ma position
      </button>
      
      {/* Statut - z-index élevé */}
      <div className="absolute bottom-4 left-4 z-1000 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            locationStatus.includes('✅') || locationStatus.includes('trouvée') 
              ? 'bg-green-500 animate-pulse' 
              : locationStatus.includes('❌') 
                ? 'bg-red-500' 
                : 'bg-yellow-500 animate-pulse'
          }`}></div>
          <span className="text-gray-700">{locationStatus}</span>
        </div>
      </div>
      
      {/* Légende */}
      <div className="absolute top-4 left-4 z-1000 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Votre position</span>
        </div>
      </div>
    </div>
  );
};

export default Map;