import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Phone, Map, Star, MoreVertical } from "lucide-react";
import { Doctor } from "@/data/mockData"; // Assuming Doctor type is defined here
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isValid } from "date-fns"; // Assuming date-fns is used

interface DoctorCardProps {
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: "active" | "suspended") => void;
}

export const DoctorCard = ({ doctor, onEdit, onDelete, onStatusChange }: DoctorCardProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  // Retrieve the Google Maps API key from environment variables (Vite)
  // Ensure VITE_GOOGLE_MAPS_API_KEY is set in your .env.local file
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-amber-500 text-amber-500" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-amber-500" />); // Assuming you have a way to render a half star icon, or use a full star for simplicity
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Enhanced date formatting function to handle various date types including Firestore timestamps
  const formatJoinedDate = (dateValue?: string | Date | { seconds: number; nanoseconds: number } | any) => {
    if (!dateValue) return "N/A";

    try {
      let date: Date;

      // Handle Firestore timestamp objects (they have seconds and nanoseconds)
      if (typeof dateValue === 'object' && dateValue !== null && 'seconds' in dateValue && typeof dateValue.seconds === 'number') {
        // Convert Firestore timestamp to Date
        date = new Date(dateValue.seconds * 1000);
      }
      // Handle string ISO dates
      else if (typeof dateValue === 'string') {
        const parsedDate = parseISO(dateValue);
         if (isValid(parsedDate)) {
            date = parsedDate;
         } else {
             // Fallback for potentially non-ISO strings or simple timestamps as strings
             const timestamp = Date.parse(dateValue);
             if (!isNaN(timestamp)) {
                 date = new Date(timestamp);
             } else {
                 console.warn("Could not parse date string:", dateValue);
                 return "Date unavailable";
             }
         }
      }
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle other potential number timestamps
      else if (typeof dateValue === 'number') {
          date = new Date(dateValue);
      }
      else {
          console.warn("Unsupported date value type:", dateValue);
          return "Date unavailable";
      }


      if (isValid(date)) {
         return format(date, 'MMM d, yyyy'); // Format the valid Date object
      } else {
         console.warn("Invalid Date object after parsing:", dateValue);
         return "Date unavailable";
      }

    } catch (error) {
      console.error("Error formatting date:", error, dateValue);
      return "Date unavailable";
    }
  };


  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part.charAt(0)) // Use charAt(0) for safety
      .join('')
      .toUpperCase()
      .substring(0, 2); // Ensure max 2 initials
  };

  return (
    <Card className={`overflow-hidden ${doctor.status === "suspended" ? "opacity-70" : ""}`}>
      {/* Avatar and Status Badge */}
      <div className="p-4 flex flex-col items-center"> {/* Use flex-col and items-center for centering */}
        <Avatar className="h-24 w-24">
          {/* Assuming doctor.image is the URL */}
          {doctor.image ? (
            <img
              src={doctor.image}
              alt={`${doctor.name}'s avatar`}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image icon
                // You might want to show the AvatarFallback instead or replace the element
                const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex'; // Show fallback
              }}
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-xl flex items-center justify-center"> {/* Ensure fallback is centered */}
            {getInitials(doctor.name)}
          </AvatarFallback>
        </Avatar>
        <Badge
          className={`absolute top-2 right-2 ${doctor.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`} // Added hover effects and text color
        >
          {doctor.status}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{doctor.name}</h3>
            <p className="text-sm text-gray-500">{doctor.specialty}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(doctor)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(
                  doctor.id,
                  doctor.status === "active" ? "suspended" : "active"
                )}
              >
                {doctor.status === "active" ? "Suspend" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50" // Added focus style
                onClick={() => onDelete(doctor.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3"> {/* Increased spacing */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{doctor.phone || 'N/A'}</span> {/* Added fallback */}
          </div>

          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-gray-500" />
             {/* Use doctor.location.address and check if coordinates exist */}
            {doctor.location?.coordinates?.lat != null && doctor.location?.coordinates?.lng != null ? (
                <button
                  onClick={() => setIsMapOpen(!isMapOpen)}
                  className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded" // Added focus styles
                >
                  {doctor.location.address || 'View on Map'} {/* Use address from location */}
                </button>
            ) : (
                 <span className="text-sm text-gray-500">{doctor.location?.address || 'Location not available'}</span> // Display address if no coordinates
            )}
          </div>

          <div className="flex items-center gap-1 mt-2">
            {renderStars(doctor.rating || 0)}
            <span className="ml-1 text-sm font-medium">{doctor.rating?.toFixed(1) || '0.0'}</span> {/* Format rating and add fallback */}
          </div>
        </div>

        {/* Google Maps Embed API iframe */}
        {isMapOpen && googleMapsApiKey && doctor.location?.coordinates?.lat != null && doctor.location?.coordinates?.lng != null && (
          <div className="mt-4 h-48 bg-gray-100 rounded-md relative overflow-hidden"> {/* Added overflow-hidden */}
            <iframe
              title={`Map for ${doctor.name}`}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }} // Added inline style for border consistency
              // Corrected Google Maps Embed API URL
              src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${doctor.location.coordinates.lat},${doctor.location.coordinates.lng}`}
              allowFullScreen={true} // Use boolean true
              loading="lazy" // Add lazy loading
              referrerPolicy="no-referrer-when-downgrade" // Recommended for security
            ></iframe>
             {/* Optional: Add a loading spinner or placeholder while iframe loads */}
          </div>
        )}
         {/* Message if map cannot be shown */}
         {isMapOpen && (!googleMapsApiKey || doctor.location?.coordinates?.lat == null || doctor.location?.coordinates?.lng == null) && (
             <div className="mt-4 h-48 flex items-center justify-center bg-gray-100 rounded-md text-gray-500 text-sm">
                 Map cannot be displayed. Check API key or location data.
             </div>
         )}
      </CardContent>

      <CardFooter className="border-t pt-4 text-sm text-gray-500">
        Joined {formatJoinedDate(doctor.joinedDate)}
      </CardFooter>
    </Card>
  );
};
