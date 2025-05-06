
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DoctorsList } from "@/components/doctors/DoctorsList";
import { Doctor } from "@/data/mockData";
import { fetchDoctors, addDoctor, updateDoctor, deleteDoctor } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Doctors = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use Tanstack Query for data fetching - updated to use onError inside meta
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors,
    meta: {
      onError: (error: Error) => {
        console.error("Error loading doctors:", error);
        toast({
          title: "Error",
          description: "Failed to load doctors data",
          variant: "destructive",
        });
      }
    }
  });
  
  // Add doctor mutation
  const addDoctorMutation = useMutation({
    mutationFn: (doctor: Omit<Doctor, "id" | "rating" | "joinedDate">) => addDoctor(doctor),
    onSuccess: (newDoctorId, doctor) => {
      // Invalidate and refetch doctors query
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      
      // Also invalidate any specialty-related queries
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      
      toast({
        title: "Success",
        description: "Doctor added successfully",
      });
    },
    onError: (error) => {
      console.error("Error adding doctor:", error);
      toast({
        title: "Error",
        description: "Failed to add doctor",
        variant: "destructive",
      });
    }
  });
  
  // Update doctor mutation
  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, updatedFields }: { id: string; updatedFields: Partial<Doctor> }) => 
      updateDoctor(id, updatedFields),
    onSuccess: (_, { updatedFields }) => {
      // Invalidate and refetch doctors query
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      
      // Also invalidate specialties if specialty was updated
      if (updatedFields.specialty) {
        queryClient.invalidateQueries({ queryKey: ['specialties'] });
      }
      
      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating doctor:", error);
      toast({
        title: "Error",
        description: "Failed to update doctor",
        variant: "destructive",
      });
    }
  });
  
  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      // Invalidate and refetch doctors query
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      
      // Also invalidate specialties since counts will change
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  });
  
  const handleAddDoctor = async (doctor: Omit<Doctor, "id" | "rating" | "joinedDate">) => {
    addDoctorMutation.mutate(doctor);
  };
  
  const handleUpdateDoctor = async (id: string, updatedFields: Partial<Doctor>) => {
    updateDoctorMutation.mutate({ id, updatedFields });
  };
  
  const handleDeleteDoctor = async (id: string) => {
    deleteDoctorMutation.mutate(id);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Doctors Management" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading doctors data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Header title="Doctors Management" />
      
      <DoctorsList 
        doctors={doctors}
        onAddDoctor={handleAddDoctor}
        onUpdateDoctor={handleUpdateDoctor}
        onDeleteDoctor={handleDeleteDoctor}
      />
    </div>
  );
};

export default Doctors;
