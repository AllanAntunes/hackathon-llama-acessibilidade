"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from 'react';

export default function SpaceForm({ params: paramsPromise }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const isEditing = params.id !== "new";
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnailUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchSpace();
    }
  }, [isEditing]);

  const fetchSpace = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/space/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch space');
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Error fetching space:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/space", {
        method: isEditing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(isEditing ? { ...formData, spaceId: params.id } : formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save space');
      }

      const result = await response.json();
      if (result.success) {
        router.push("/admin/spaces");
      }
    } catch (error) {
      console.error("Error saving space:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? "Editar Espaço Cultural" : "Novo Espaço Cultural"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Imagem
          </label>
          <input
            type="url"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/spaces")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 