
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialCity?: string;
  onLocationSelected: (lat: number, lng: number, city: string) => void;
}

export const MapPicker = ({ 
  initialLat = -33.918861, 
  initialLng = 18.423300, 
  initialCity = "",
  onLocationSelected 
}: MapPickerProps) => {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [city, setCity] = useState(initialCity);
  const [apiKey, setApiKey] = useState<string>("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  // Load Google Maps API key from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem("AIzaSyDavxgq9wYfh06xb-wIEmHY6MUx8edDZnM");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiError("Google Maps API key is not configured.");
    }
  }, []);
  
  // Load Google Maps API
  useEffect(() => {
    if (!apiKey || isMapLoaded) return;
    setApiError(null);
    
    // Check if Google Maps API is already loaded
    if (window.google?.maps) {
      initializeMap();
      return;
    }
    
    // Load Google Maps API script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initializeMap();
    };
    
    script.onerror = (error) => {
      console.error("Google Maps API loading error:", error);
      setApiError("Failed to load Google Maps. Your API key might be invalid or restricted.");
      toast.error("Failed to load Google Maps. Check your API key.");
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup function
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);
  
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;
    
    try {
      // Create map instance
      const mapOptions: google.maps.MapOptions = {
        center: { lat, lng },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false
      };
      
      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      
      // Create marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        animation: google.maps.Animation.DROP
      });
      markerRef.current = marker;
      
      // Create geocoder
      geocoderRef.current = new google.maps.Geocoder();
      
      // Add event listener for marker drag end
      marker.addListener("dragend", handleMarkerDragEnd);
      
      // Add event listener for map click
      map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;
        
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        
        marker.setPosition({ lat: newLat, lng: newLng });
        setLat(newLat);
        setLng(newLng);
        
        // Get address from coordinates
        geocodePosition(newLat, newLng);
      });
      
      setIsMapLoaded(true);
      
      // If we have initial coordinates, geocode them to get the city
      if (initialLat && initialLng && !initialCity) {
        geocodePosition(initialLat, initialLng);
      }
    } catch (error) {
      console.error("Map initialization error:", error);
      setApiError("Failed to initialize Google Maps. Please refresh the page or check your API key.");
      toast.error("Failed to initialize Google Maps");
    }
  };
  
  const handleMarkerDragEnd = () => {
    if (!markerRef.current) return;
    
    const position = markerRef.current.getPosition();
    if (!position) return;
    
    const newLat = position.lat();
    const newLng = position.lng();
    
    setLat(newLat);
    setLng(newLng);
    
    // Get address from coordinates
    geocodePosition(newLat, newLng);
  };
  
  const geocodePosition = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        let cityName = "";
        
        // Extract city name from address components
        for (const component of results[0].address_components) {
          if (component.types.includes("locality")) {
            cityName = component.long_name;
            break;
          } else if (component.types.includes("administrative_area_level_1")) {
            cityName = component.long_name;
          }
        }
        
        if (!cityName && results[0].formatted_address) {
          cityName = results[0].formatted_address;
        }
        
        setCity(cityName);
      } else {
        console.error("Geocoder failed due to: " + status);
        toast.error("Failed to get location details");
      }
    });
  };
  
  const handleSearch = () => {
    if (!searchQuery.trim() || !geocoderRef.current || !mapInstanceRef.current || !markerRef.current) return;
    
    geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        const newLat = location.lat();
        const newLng = location.lng();
        
        // Update map and marker
        mapInstanceRef.current?.setCenter(location);
        markerRef.current?.setPosition(location);
        
        // Update state
        setLat(newLat);
        setLng(newLng);
        
        // Get full address details
        let cityName = "";
        
        // Extract city name from address components
        for (const component of results[0].address_components) {
          if (component.types.includes("locality")) {
            cityName = component.long_name;
            break;
          } else if (component.types.includes("administrative_area_level_1")) {
            cityName = component.long_name;
          }
        }
        
        if (!cityName && results[0].formatted_address) {
          cityName = results[0].formatted_address;
        }
        
        setCity(cityName);
      } else {
        toast.error("Location not found");
      }
    });
  };
  
  const handleApplyLocation = () => {
    onLocationSelected(lat, lng, city);
  };
  
  const handleConfigureApiKey = () => {
    const configButton = document.querySelector('[class*="fixed bottom-4 right-4"]') as HTMLButtonElement;
    if (configButton) {
      configButton.click();
    } else {
      toast.error("Couldn't find the configuration button. Please scroll to the bottom right of the page to configure your API key.");
    }
  };
  
  // If API key is not set or there's an API error, show a message
  if (!apiKey || apiError) {
    return (
      <div className="p-4 text-center border rounded-md bg-amber-50">
        <p className="mb-2 text-amber-700">{apiError || "Google Maps API key is not configured."}</p>
        <p className="text-sm text-amber-600 mb-4">
          You need to set up a Google Maps API key with Maps JavaScript API, Geocoding API, and Places API enabled.
        </p>
        <Button 
          onClick={handleConfigureApiKey} 
          className="bg-amber-600 hover:bg-amber-700"
        >
          Configure API Key
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button type="button" onClick={handleSearch} size="sm">
          Search
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[300px] rounded-md border"
        aria-label="Google Map"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Latitude:</span>
          </div>
          <Input
            value={lat.toFixed(6)}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            type="number"
            step="0.000001"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Longitude:</span>
          </div>
          <Input
            value={lng.toFixed(6)}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            type="number"
            step="0.000001"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">City / Location Name:</label>
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City name will be detected automatically"
        />
      </div>
      
      <Button 
        type="button" 
        onClick={handleApplyLocation} 
        className="w-full bg-medical-600"
      >
        Apply This Location
      </Button>
    </div>
  );
};
