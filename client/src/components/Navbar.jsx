import { Bell, Search, UserCircle } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md h-16 flex items-center justify-between px-6">
      
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          TransitOps
        </h1>
        <p className="text-xs text-gray-500">
          Transport Management System
        </p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-2 w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <button className="relative">
          <Bell
            size={22}
            className="text-gray-600 hover:text-blue-600 transition"
          />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] px-1">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer">

          <UserCircle
            size={34}
            className="text-blue-600"
          />

          <div className="hidden md:block">
            <h2 className="font-semibold text-sm">
              Admin
            </h2>
            <p className="text-xs text-gray-500">
              Fleet Manager
            </p>
          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;