
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SpecialtiesList } from "@/components/specialties/SpecialtiesList";
import { Specialty } from "@/data/mockData";
import { fetchSpecialties, addSpecialty, updateSpecialty, deleteSpecialty } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const Specialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const specialtiesData: Specialty[] = await fetchSpecialties();
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error("Error loading specialties:", error);
        toast({
          title: "Error",
          description: "Failed to load specialties data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSpecialties();
  }, [toast]);
  
  const handleAddSpecialty = async (specialty: Omit<Specialty, "id">) => {
    try {
      const newSpecialtyId = await addSpecialty(specialty);
      const newSpecialty: Specialty = {
        ...specialty,
        id: newSpecialtyId,
      };
      
      setSpecialties([...specialties, newSpecialty]);
      toast({
        title: "Success",
        description: "Specialty added successfully",
      });
    } catch (error) {
      console.error("Error adding specialty:", error);
      toast({
        title: "Error",
        description: "Failed to add specialty",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateSpecialty = async (id: string, updatedFields: Partial<Specialty>) => {
    try {
      await updateSpecialty(id, updatedFields);
      setSpecialties(
        specialties.map((specialty) =>
          specialty.id === id ? { ...specialty, ...updatedFields } : specialty
        )
      );
      toast({
        title: "Success",
        description: "Specialty updated successfully",
      });
    } catch (error) {
      console.error("Error updating specialty:", error);
      toast({
        title: "Error",
        description: "Failed to update specialty",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSpecialty = async (id: string) => {
    try {
      await deleteSpecialty(id);
      setSpecialties(specialties.filter((specialty) => specialty.id !== id));
      toast({
        title: "Success",
        description: "Specialty deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting specialty:", error);
      toast({
        title: "Error",
        description: "Failed to delete specialty",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Specialties Management" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading specialties data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Header title="Specialties Management" />
      
      <SpecialtiesList 
        specialties={specialties}
        onAddSpecialty={handleAddSpecialty}
        onUpdateSpecialty={handleUpdateSpecialty}
        onDeleteSpecialty={handleDeleteSpecialty}
      />
    </div>
  );
};

export default Specialties;
