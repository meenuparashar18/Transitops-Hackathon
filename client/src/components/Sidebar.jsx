import {
  LayoutDashboard,
  Truck,
  Users,
  Package,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menus = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      title: "Vehicles",
      icon: <Truck size={20} />,
      path: "/vehicles",
    },
    {
      title: "Drivers",
      icon: <Users size={20} />,
      path: "/drivers",
    },
    {
      title: "Shipments",
      icon: <Package size={20} />,
      path: "/shipments",
    },
    {
      title: "Alerts",
      icon: <Bell size={20} />,
      path: "/alerts",
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col">

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">
          TransitOps
        </h1>

        <p className="text-sm text-gray-400">
          Smart Fleet Management
        </p>
      </div>

      <div className="flex-1 mt-6">

        {menus.map((menu) => (
          <NavLink
            key={menu.title}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 transition-all duration-300 ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`
            }
          >
            {menu.icon}
            <span>{menu.title}</span>
          </NavLink>
        ))}

      </div>

      <div className="border-t border-slate-700">

        <button className="flex items-center gap-4 px-6 py-5 w-full hover:bg-red-600 transition">

          <LogOut size={20} />

          Logout

        </button>

      </div>
    </div>
  );
};

export default Sidebar;