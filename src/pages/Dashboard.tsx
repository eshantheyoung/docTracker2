
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { fetchDoctors, fetchSpecialties } from "@/lib/firebase";
import { FileText, UserPlus, Users, Star } from "lucide-react";
import { Doctor, Specialty } from "@/data/mockData";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    specialties: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from Firebase
        const doctorsData: Doctor[] = await fetchDoctors();
        const specialtiesData: Specialty[] = await fetchSpecialties();
        
        // Calculate statistics from actual data
        const activeDoctors = doctorsData.filter((doc) => doc.status === "active").length;
        const totalRating = doctorsData.reduce((sum, doctor) => sum + (doctor.rating || 0), 0);
        const avgRating = doctorsData.length > 0 ? totalRating / doctorsData.length : 0;
        
        setStats({
          totalDoctors: doctorsData.length,
          activeDoctors,
          specialties: specialtiesData.length,
          averageRating: Number(avgRating.toFixed(1)),
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Dashboard" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Header title="Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Doctors" 
          value={stats.totalDoctors}
          icon={<UserPlus className="h-5 w-5" />}
          color="blue"
          trend={{ value: 0, positive: true }}
        />
        
        <StatCard 
          title="Active Doctors" 
          value={stats.activeDoctors}
          icon={<Users className="h-5 w-5" />}
          color="teal"
          trend={{ value: 0, positive: true }}
        />
        
        <StatCard 
          title="Specialties" 
          value={stats.specialties}
          icon={<FileText className="h-5 w-5" />}
          color="amber"
        />
        
        <StatCard 
          title="Average Rating" 
          value={stats.averageRating}
          icon={<Star className="h-5 w-5" />}
          color="blue"
          trend={{ value: 0, positive: true }}
        />
      </div>
      
      <DashboardCharts />
    </div>
  );
};

export default Dashboard;
