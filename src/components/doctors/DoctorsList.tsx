
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorCard } from "./DoctorCard";
import { DoctorForm } from "./DoctorForm";
import { Doctor } from "@/data/mockData";
import { UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DoctorsListProps {
  doctors: Doctor[];
  onAddDoctor: (doctor: Omit<Doctor, "id" | "rating" | "joinedDate">) => void;
  onUpdateDoctor: (id: string, doctor: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}

export const DoctorsList = ({ doctors, onAddDoctor, onUpdateDoctor, onDeleteDoctor }: DoctorsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined);
  
  const { toast } = useToast();
  
  // Get unique specialties from doctors list
  const specialties = Array.from(new Set(doctors.map((doctor) => doctor.specialty)));
  
  const handleOpenForm = (doctor?: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDoctor(undefined);
  };
  
  const handleSubmit = (doctorData: Omit<Doctor, "id" | "rating" | "joinedDate">) => {
    if (selectedDoctor) {
      onUpdateDoctor(selectedDoctor.id, doctorData);
      toast({
        title: "Doctor Updated",
        description: `${doctorData.name} has been updated successfully.`,
      });
    } else {
      onAddDoctor(doctorData);
      toast({
        title: "Doctor Added",
        description: `${doctorData.name} has been registered successfully.`,
      });
    }
    handleCloseForm();
  };
  
  const handleStatusChange = (id: string, newStatus: "active" | "suspended") => {
    onUpdateDoctor(id, { status: newStatus });
    const doctor = doctors.find((d) => d.id === id);
    if (doctor) {
      toast({
        title: newStatus === "active" ? "Doctor Activated" : "Doctor Suspended",
        description: `${doctor.name} has been ${newStatus === "active" ? "activated" : "suspended"}.`,
      });
    }
  };
  
  const handleDeleteDoctor = (id: string) => {
    const doctor = doctors.find((d) => d.id === id);
    if (doctor) {
      onDeleteDoctor(id);
      toast({
        title: "Doctor Deleted",
        description: `${doctor.name} has been removed from the system.`,
        variant: "destructive",
      });
    }
  };
  
  // Filter doctors based on search term, specialty, and status
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
    const matchesStatus = statusFilter === "all" || doctor.status === statusFilter;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-64"
            />
          </div>
          
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="bg-medical-600 w-full md:w-auto" onClick={() => handleOpenForm()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Register New Doctor
        </Button>
      </div>
      
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No doctors found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onEdit={handleOpenForm}
              onDelete={handleDeleteDoctor}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
      
      <DoctorForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={selectedDoctor}
      />
    </div>
  );
};
