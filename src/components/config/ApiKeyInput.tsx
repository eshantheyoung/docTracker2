
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const ApiKeyInput = () => {
  const [open, setOpen] = useState(false);
  const [firebaseKeys, setFirebaseKeys] = useState({
    apiKey: localStorage.getItem("firebase_apiKey") || "",
    authDomain: localStorage.getItem("firebase_authDomain") || "",
    projectId: localStorage.getItem("firebase_projectId") || "",
    storageBucket: localStorage.getItem("firebase_storageBucket") || "",
    messagingSenderId: localStorage.getItem("firebase_messagingSenderId") || "",
    appId: localStorage.getItem("firebase_appId") || "",
  });
  const [googleMapsKey, setGoogleMapsKey] = useState(
    localStorage.getItem("google_maps_apiKey") || ""
  );

  const handleFirebaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseKeys(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleMapsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoogleMapsKey(e.target.value);
  };

  const handleSave = () => {
    // Save Firebase keys
    Object.entries(firebaseKeys).forEach(([key, value]) => {
      localStorage.setItem(`firebase_${key}`, value);
    });
    
    // Save Google Maps key
    localStorage.setItem("google_maps_apiKey", googleMapsKey);
    
    toast.success("API keys saved successfully.");
    setOpen(false);
    
    // Reload page to apply new configuration
    window.location.reload();
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-10"
      >
        Configure API Keys
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Configuration</DialogTitle>
            <DialogDescription>
              Enter your Firebase and Google Maps API keys to connect to your services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Firebase Configuration</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  name="apiKey"
                  value={firebaseKeys.apiKey}
                  onChange={handleFirebaseChange}
                  placeholder="Firebase API Key"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Auth Domain</label>
                <Input
                  name="authDomain"
                  value={firebaseKeys.authDomain}
                  onChange={handleFirebaseChange}
                  placeholder="example.firebaseapp.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Project ID</label>
                <Input
                  name="projectId"
                  value={firebaseKeys.projectId}
                  onChange={handleFirebaseChange}
                  placeholder="your-project-id"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Storage Bucket</label>
                <Input
                  name="storageBucket"
                  value={firebaseKeys.storageBucket}
                  onChange={handleFirebaseChange}
                  placeholder="example.appspot.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Messaging Sender ID</label>
                <Input
                  name="messagingSenderId"
                  value={firebaseKeys.messagingSenderId}
                  onChange={handleFirebaseChange}
                  placeholder="123456789012"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">App ID</label>
                <Input
                  name="appId"
                  value={firebaseKeys.appId}
                  onChange={handleFirebaseChange}
                  placeholder="1:123456789012:web:a1b2c3d4e5f6"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Google Maps Configuration</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  value={googleMapsKey}
                  onChange={handleGoogleMapsChange}
                  placeholder="Google Maps API Key"
                />
                <p className="text-xs text-amber-600 mt-1">
                  Get a key from the <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>. 
                  Make sure to enable Maps JavaScript API, Geocoding API, and Places API.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-medical-600">
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
