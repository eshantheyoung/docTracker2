
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDoctors, fetchSpecialties } from "@/lib/firebase";
import { Doctor, Specialty } from "@/data/mockData";
import { groupBy } from "lodash";
import { format, parseISO, isValid, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardCharts = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorsData = await fetchDoctors();
        const specialtiesData = await fetchSpecialties();
        
        setDoctors(doctorsData);
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Create registration data based on recent months (last 6 months)
  const registrationData = createRecentMonthsData(doctors);
  
  // Sort specialties by doctor count (descending)
  const sortedSpecialties = [...specialties].sort((a, b) => b.doctorCount - a.doctorCount).slice(0, 7);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {loading ? (
        <>
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Doctor Registrations</CardTitle>
              <CardDescription>Monthly doctor registration trend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {registrationData.map(item => (
                  <div key={item.month} className="p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-500">{item.month}</p>
                    <p className="text-xl font-bold">{item.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Specialty Distribution</CardTitle>
              <CardDescription>Number of doctors by specialty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {sortedSpecialties.map(specialty => (
                  <div key={specialty.id} className="flex justify-between items-center p-2 bg-teal-50 rounded-md">
                    <span>{specialty.name}</span>
                    <span className="font-bold">{specialty.doctorCount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Helper function to create data for recent months
function createRecentMonthsData(doctors: Doctor[]) {
  const now = new Date();
  const months = [];
  
  // Generate the last 6 months
  for (let i = 0; i < 6; i++) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'yyyy-MM');
    months.unshift({
      monthKey,
      month: format(date, 'MMM'),
      date
    });
  }
  
  // Group doctors by their join month
  const grouped = groupBy(doctors, doctor => {
    // Safely handle the joinedDate property
    let joinDate;
    
    // Check if joinedDate exists and is a string
    if (typeof doctor.joinedDate === 'string') {
      joinDate = parseISO(doctor.joinedDate);
    } else if (doctor.joinedDate instanceof Date) {
      // Handle if it's already a Date object
      joinDate = doctor.joinedDate;
    } else {
      // Default to current date if invalid/missing
      console.warn('Invalid joinedDate for doctor:', doctor);
      return 'Unknown';
    }
    
    return isValid(joinDate) ? format(joinDate, 'yyyy-MM') : 'Unknown';
  });
  
  // Map each month to its count
  return months.map(({ monthKey, month }) => ({
    month,
    count: grouped[monthKey] ? grouped[monthKey].length : 0
  }));
}
