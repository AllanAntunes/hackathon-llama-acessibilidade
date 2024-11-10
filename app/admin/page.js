"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSpaces: 0,
    totalItems: 0,
    activeUsers: 45, // Keeping this mocked for now
    monthlyVisits: 1234 // Keeping this mocked for now
  });
  const [recentSpaces, setRecentSpaces] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch spaces
      const spacesResponse = await fetch("https://api.acessibilidade.tec.br/space", {
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'
        }
      });

      if (!spacesResponse.ok) throw new Error('Failed to fetch spaces');
      const spacesData = await spacesResponse.ok ? await spacesResponse.json() : [];

      // Fetch items from space ID 4
      const itemsResponse = await fetch("https://api.acessibilidade.tec.br/space/4/item", {
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'
        }
      });

      if (!itemsResponse.ok) throw new Error('Failed to fetch items');
      const itemsData = await itemsResponse.ok ? await itemsResponse.json() : [];

      // Update stats
      setStats({
        ...stats,
        totalSpaces: spacesData.length,
        totalItems: itemsData.length,
      });

      // Update recent spaces (last 3)
      setRecentSpaces(spacesData.slice(-3).reverse());

      // Update popular items (first 5)
      setPopularItems(itemsData.slice(0, 5).map(item => ({
        ...item,
        views: Math.floor(Math.random() * 1000) + 100, // Random views for visualization
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Espaços Culturais</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSpaces}</p>
            </div>
            <span className="text-3xl">🏛️</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Items</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            </div>
            <span className="text-3xl">🖼️</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visitas Mensais</p>
              <p className="text-2xl font-bold text-gray-800">{stats.monthlyVisits}</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
      </div>

      {/* Recent Spaces */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Espaços Recentes</h2>
          <Link 
            href="/admin/spaces" 
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentSpaces.map((space) => (
            <div key={space.spaceId} className="border rounded-lg overflow-hidden">
              <img 
                src={space.thumbnailUrl} 
                alt={space.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-gray-800">{space.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{space.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Items Populares</h2>
        <div className="space-y-4">
          {popularItems.map((item) => (
            <div key={item.itemId} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{item.views}</p>
                <p className="text-xs text-gray-400">visualizações</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
