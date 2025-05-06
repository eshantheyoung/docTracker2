import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctor, Specialty } from "@/data/mockData"; // Assuming Doctor and Specialty types are defined here
import { fetchSpecialties, addSpecialty } from "@/lib/firebase"; // Import Firebase functions
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { useQuery } from "@tanstack/react-query"; // Assuming react-query is used for data fetching
import { MapPicker } from "../maps/MapPicker"; // Assuming MapPicker component exists and is imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming shadcn/ui tabs are used


// Define a type for the flattened form state
interface DoctorFormState {
  name: string;
  email: string;
  phone: string;
  // Changed specialty type to string | undefined
  specialty: string | undefined;
  city: string; // Flattened city field - Keeping these as they might still be needed
  lat: number;  // Flattened lat field - Keeping these as they might still be needed
  lng: number;  // Flattened lng field - Keeping these as they might still be needed
  status: "active" | "suspended"; // Assuming these are the possible statuses
  image: string; // Assuming image field is still part of the data structure
}


interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  // onSubmit expects the data structure that matches Omit<Doctor, "id" | "rating" | "joinedDate">
  // which includes the nested location object.
  onSubmit: (doctor: Omit<Doctor, "id" | "rating" | "joinedDate">) => void;
  initialData?: Doctor; // initialData comes with the nested location structure
}

export const DoctorForm = ({ isOpen, onClose, onSubmit, initialData }: DoctorFormProps) => {
  // State to hold form data, using the new flattened type
  const [formData, setFormData] = useState<DoctorFormState>({
    name: "",
    email: "",
    phone: "",
    // Initialized specialty to undefined
    specialty: undefined,
    city: "", // Flattened city field
    lat: -33.918861, // Flattened lat field with default
    lng: 18.423300, // Flattened lng field with default
    status: "active",
    image: "" // Assuming image field is still part of the data structure, even if using placeholder
  });

  const [loading, setLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [showNewSpecialtyInput, setShowNewSpecialtyInput] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");


  // Fetch specialties using react-query
  const { data: specialties = [], refetch, isLoading: isLoadingSpecialties } = useQuery<Specialty[]>({
    queryKey: ['specialties'],
    queryFn: async () => {
      console.log("Fetching specialties from Firebase...");
      const data = await fetchSpecialties();
      console.log("Specialties fetched:", data);
      return data;
    },
    enabled: isOpen, // Only fetch when the form is open
    staleTime: 0, // Consider data immediately stale to force refetch
    refetchOnMount: 'always', // Always refetch when component mounts
  });

  // Force refetch when the form opens
  useEffect(() => {
    if (isOpen) {
      console.log("Form opened, refetching specialties...");
      refetch();
    }
  }, [isOpen, refetch]);

  // Debug specialties data changes
  useEffect(() => {
    console.log("Specialties data updated:", specialties);
  }, [specialties]);

  // Effect to populate form when initialData changes or dialog opens
  useEffect(() => {
    if (initialData) {
      // Ensure initialData.location and initialData.location.coordinates exist before accessing lat/lng
      const initialLat = initialData.location?.coordinates?.lat ?? -33.918861;
      const initialLng = initialData.location?.coordinates?.lng ?? 18.423300;
      const initialCity = initialData.location?.address ?? "";

      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        // Set specialty from initialData, could be undefined if missing
        specialty: initialData.specialty || undefined,
        status: initialData.status || "active",
        image: initialData.image || "",
        // Map nested location from initialData to flattened state fields
        lat: initialLat,
        lng: initialLng,
        city: initialCity,
      });
    } else {
      // Reset form when registering a new doctor
      setFormData({
        name: "",
        email: "",
        phone: "",
        // Reset specialty to undefined
        specialty: undefined,
        city: "",
        lat: -33.918861,
        lng: 18.423300,
        status: "active",
        image: ""
      });
    }
    // Reset active tab when dialog opens
    setActiveTab("basic");
  }, [initialData, isOpen]); // Added initialData to dependencies

  // Handler for basic text/select inputs
  const handleChange = (field: keyof DoctorFormState, value: string | number | undefined) => {
    // Ensure value type matches the field type if using strict checking
    // For simplicity here, we cast, but in a real app, you might validate/parse based on field
    setFormData((prev) => ({
      ...prev,
      [field]: value as any // Casting to any for simplicity, refine if needed
    }));
  };

  // Handler for adding a new specialty
  const handleAddNewSpecialty = async () => {
    if (!newSpecialty.trim()) return;

    try {
      setLoading(true);

      // Add specialty to Firebase
      const newSpecialtyData = {
        name: newSpecialty.trim(),
        description: "", // Default description for new specialty
        doctorCount: 0 // New specialties start with count 0
      };

      const newSpecialtyId = await addSpecialty(newSpecialtyData);
      console.log("New specialty added with ID:", newSpecialtyId);

      // Set the newly added specialty as the selected one
      handleChange("specialty", newSpecialty.trim());

      // Force refresh the specialties list to include the new one
      await refetch();

      // Reset UI state for adding new specialty
      setNewSpecialty("");
      setShowNewSpecialtyInput(false);

      toast.success("New specialty added");
    } catch (error) {
      console.error("Error adding specialty:", error);
      toast.error("Failed to add new specialty");
    } finally {
      setLoading(false);
    }
  };

  // Handler for when a location is selected on the map
  const handleLocationSelected = (lat: number, lng: number, city: string) => {
    setFormData(prev => ({
      ...prev,
      lat, // Update flattened lat state
      lng, // Update flattened lng state
      city // Update flattened city state
    }));
    toast.success("Location updated");
    setActiveTab("basic"); // Switch back to basic info tab after selecting location
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use a default placeholder image instead of uploading
      // (Assuming image upload is handled elsewhere or not needed for this version)
      const defaultImage = "https://via.placeholder.com/150";

      // --- Transformation: Construct the nested location object from flattened state ---
      // This matches the expected Omit<Doctor, "id" | "rating" | "joinedDate"> structure
      const doctorDataToSubmit: Omit<Doctor, "id" | "rating" | "joinedDate"> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Ensure specialty is a string for submission, use empty string if undefined
        specialty: formData.specialty || "",
        status: formData.status,
        image: formData.image || defaultImage, // Use existing image URL or the default placeholder
        // Construct the nested location object using flattened state fields
        location: {
          // Using city from flattened state as the address.
          address: formData.city || "",
          coordinates: {
            lat: formData.lat, // Use the lat from flattened state
            lng: formData.lng, // Use the lng from flattened state
          }
        },
      };
      // -----------------------------------------------------------------------------

      // Call the parent's onSubmit function with the transformed data
      onSubmit(doctorDataToSubmit);

      // Assuming onSubmit handles closing the dialog or navigating
      // If not, you might call onClose() here after successful submission handling by parent

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while saving the doctor information.");
    } finally {
      setLoading(false);
    }
  };

  // useRef for file input is not used in this version as image upload logic is removed
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // handleSelectImage and handleImageChange functions are removed as image upload logic is removed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Doctor" : "Register New Doctor"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  {showNewSpecialtyInput ? (
                    <div className="flex space-x-2 items-center">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Enter new specialty"
                      />
                      <Button
                        type="button"
                        onClick={handleAddNewSpecialty}
                        disabled={loading || !newSpecialty.trim()}
                        size="sm"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewSpecialtyInput(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 items-center">
                      <Select
                        // Pass undefined if formData.specialty is undefined, otherwise pass the string value
                        value={formData.specialty}
                        onValueChange={(value) => handleChange("specialty", value)}
                        disabled={isLoadingSpecialties}
                      >
                        <SelectTrigger className="flex-1">
                          {isLoadingSpecialties ? (
                            <span className="text-gray-500">Loading...</span>
                          ) : (
                            // Show placeholder if formData.specialty is undefined or empty string
                            <SelectValue placeholder="Select specialty" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {console.log("Specialties after filter:", specialties.filter(specialty => typeof specialty.name === 'string' && specialty.name.trim() !== ''))}
                          {/* --- Filter out specialties with empty names and log each item before rendering --- */}
                          {isLoadingSpecialties ? (
                            <SelectItem value="loading" disabled>Loading specialties...</SelectItem>
                          ) : specialties.length === 0 ? (
                            <SelectItem value="no-specialties" disabled>No specialties available</SelectItem>
                          ) : (
                            specialties
                              // Filter out specialties where name is null, undefined, or empty string after trimming
                              .filter(specialty => typeof specialty.name === 'string' && specialty.name.trim() !== '')
                              .map((specialty) => {
                                // --- Debugging: Log each specialty item before rendering SelectItem ---
                                console.log("Rendering SelectItem for specialty:", specialty);
                                return (
                                  <SelectItem key={specialty.id} value={specialty.name}>
                                    {specialty.name}
                                  </SelectItem>
                                );
                              })
                          )}
                          {/* ------------------------------------------------------- */}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewSpecialtyInput(true)}
                        size="sm"
                        disabled={isLoadingSpecialties}
                      >
                        New
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "suspended") => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Summary in Basic Info Tab */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="p-2 border rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600">{formData.city || "No location set"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                       Lat: {formData.lat.toFixed(6)}, Lng: {formData.lng.toFixed(6)} {/* Display coordinates */}
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("location")}
                      >
                        Change Location
                      </Button>
                    </div>
                  </div>
                </div>

                 {/* Image field - keeping it in basic tab for now, using placeholder */}
                 <div className="space-y-2 col-span-2">
                   <label className="text-sm font-medium">Profile Image URL</label>
                   <Input
                     value={formData.image}
                     onChange={(e) => handleChange("image", e.target.value)}
                     placeholder="Enter image URL or leave blank for placeholder"
                   />
                    {formData.image && (
                      <div className="h-20 w-20 rounded-md overflow-hidden mt-2">
                        <img
                          src={formData.image}
                          alt="Doctor preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback image if the URL fails
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
                          }}
                        />
                      </div>
                    )}
                    {!formData.image && (
                       <p className="text-sm text-gray-500 mt-2">
                         Using a placeholder image if no URL is provided.
                       </p>
                     )}
                 </div>

              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="space-y-4">
                 {/* MapPicker component */}
                <MapPicker
                  initialLat={formData.lat}
                  initialLng={formData.lng}
                  initialCity={formData.city} // Pass current city for initial display
                  onLocationSelected={handleLocationSelected} // Handle location selection
                />
              </div>
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-medical-600" disabled={loading}>
                {loading ? "Saving..." : initialData ? "Update" : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
