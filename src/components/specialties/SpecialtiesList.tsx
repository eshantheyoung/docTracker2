
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Specialty } from "@/data/mockData";
import { Search, Users, Plus, Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SpecialtiesListProps {
  specialties: Specialty[];
  onAddSpecialty: (specialty: Omit<Specialty, "id">) => void;
  onUpdateSpecialty: (id: string, specialty: Partial<Specialty>) => void;
  onDeleteSpecialty: (id: string) => void;
}

export const SpecialtiesList = ({
  specialties,
  onAddSpecialty,
  onUpdateSpecialty,
  onDeleteSpecialty,
}: SpecialtiesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    doctorCount: 0,
  });
  
  const { toast } = useToast();
  
  const handleOpenForm = (specialty?: Specialty) => {
    if (specialty) {
      setFormData({
        name: specialty.name,
        description: specialty.description,
        doctorCount: specialty.doctorCount,
      });
      setSelectedSpecialty(specialty);
    } else {
      setFormData({
        name: "",
        description: "",
        doctorCount: 0,
      });
      setSelectedSpecialty(undefined);
    }
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialty) {
      onUpdateSpecialty(selectedSpecialty.id, formData);
      toast({
        title: "Specialty Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      onAddSpecialty(formData);
      toast({
        title: "Specialty Added",
        description: `${formData.name} has been added successfully.`,
      });
    }
    handleCloseForm();
  };
  
  const handleDeleteSpecialty = (specialty: Specialty) => {
    onDeleteSpecialty(specialty.id);
    toast({
      title: "Specialty Deleted",
      description: `${specialty.name} has been removed from the system.`,
      variant: "destructive",
    });
  };
  
  // Filter specialties based on search term
  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full md:w-64"
          />
        </div>
        
        <Button className="bg-medical-600 w-full md:w-auto" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Specialty
        </Button>
      </div>
      
      {filteredSpecialties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No specialties found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSpecialties.map((specialty) => (
            <Card key={specialty.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-start">
                  {specialty.name}
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleOpenForm(specialty)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-500"
                      onClick={() => handleDeleteSpecialty(specialty)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {specialty.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{specialty.doctorCount} doctors</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSpecialty ? "Edit Specialty" : "Add New Specialty"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialty Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            {selectedSpecialty && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Doctor Count</label>
                <Input
                  type="number"
                  value={formData.doctorCount}
                  onChange={(e) => setFormData({ ...formData, doctorCount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-medical-600">
                {selectedSpecialty ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
