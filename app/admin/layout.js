"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaLandmark } from "react-icons/fa";
import { RiMenuFill, RiCloseLine } from "react-icons/ri";
import Image from "next/image";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <MdDashboard className="text-xl" /> },
    { name: "Espaços Culturais", path: "/admin/spaces", icon: <FaLandmark className="text-xl" /> },
  ];

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white/90 backdrop-blur-md border-r border-gray-200/50 w-64 shadow-lg`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center">
            <Image
              src="/curadorIA_logo.png"
              alt="Curador.ia Logo"
              width={150}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-88px)] justify-between">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-indigo-600"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <MdLogout className="text-xl" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`p-4 ${isSidebarOpen ? "lg:ml-64" : ""}`}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 backdrop-blur-md shadow-lg hover:bg-gray-100 transition-colors lg:hidden ${
            isSidebarOpen ? "hidden" : "block"
          }`}
        >
          <RiMenuFill className="text-xl" />
        </button>

        {/* Content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
