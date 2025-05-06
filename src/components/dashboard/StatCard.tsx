
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "default" | "blue" | "teal" | "amber";
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  color = "default",
  trend,
  className,
}: StatCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-medical-50 border-medical-200 text-medical-700";
      case "teal":
        return "bg-teal-50 border-teal-200 text-teal-700";
      case "amber":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getIconColorClass = () => {
    switch (color) {
      case "blue":
        return "text-medical-500";
      case "teal":
        return "text-teal-500";
      case "amber":
        return "text-amber-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl border shadow-sm",
        getColorClasses(),
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && <div className={getIconColorClass()}>{icon}</div>}
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              "font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.positive ? "+" : "-"}
            {trend.value}%
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};
