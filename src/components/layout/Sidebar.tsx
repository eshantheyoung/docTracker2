
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, UserPlus, Users, ChartBar, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active ? "bg-medical-600 text-white" : "hover:bg-medical-100"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { href: "/", icon: ChartBar, label: "Dashboard" },
    { href: "/doctors", icon: UserPlus, label: "Doctors" },
    { href: "/specialties", icon: Users, label: "Specialties" },
  ];

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-md shadow-md"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto shadow-md md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <User className="h-8 w-8 text-medical-600" />
            <h1 className="text-xl font-bold text-medical-900">Doc Tracker Admin Portal</h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.href}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};
