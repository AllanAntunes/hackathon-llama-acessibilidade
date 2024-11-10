"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BaseModal from "@/app/components/BaseModal";
import { FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";

function SpaceModal({ space, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    spaceId: "",
    name: "",
    description: "",
    thumbnailUrl: "",
  });

  useEffect(() => {
    if (space) {
      setFormData({
        spaceId: space.spaceId,
        name: space.name || "",
        description: space.description || "",
        thumbnailUrl: space.thumbnailUrl || "",
      });
    } else {
      // Reset form when creating new space
      setFormData({
        spaceId: "",
        name: "",
        description: "",
        thumbnailUrl: "",
      });
    }
  }, [space]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://api.acessibilidade.tec.br/space", {
        method: space ? "PUT" : "POST",
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(space ? formData : {
          name: formData.name,
          description: formData.description,
          thumbnailUrl: formData.thumbnailUrl,
        }),
      });

      if (!response.ok) throw new Error(space ? 'Failed to update space' : 'Failed to create space');
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving space:", error);
      alert(`Falha ao ${space ? 'atualizar' : 'criar'} o espaço. Por favor, tente novamente.`);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={space ? "Editar Espaço Cultural" : "Novo Espaço Cultural"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Imagem
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => alert('Funcionalidade de upload será implementada em breve!')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiUpload className="text-lg" />
              Upload
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {space ? 'Atualizar' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await fetch("https://api.acessibilidade.tec.br/space", {
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const data = await response.json();
      setSpaces(data);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      setError("Falha ao carregar os espaços culturais. Por favor, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (spaceId) => {
    if (!confirm("Tem certeza que deseja excluir este espaço?")) return;

    try {
      const response = await fetch("https://api.acessibilidade.tec.br/space", {
        method: "DELETE",
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spaceId }),
      });

      if (response.ok) {
        fetchSpaces();
      } else {
        throw new Error('Failed to delete space');
      }
    } catch (error) {
      console.error("Error deleting space:", error);
      alert("Falha ao excluir o espaço. Por favor, tente novamente.");
    }
  };

  const handleEditClick = (space) => {
    setSelectedSpace(space);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedSpace(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Espaços Culturais</h1>
        <button
          onClick={handleNewClick}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Novo Espaço
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => (
          <div
            key={space.spaceId}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div 
              onClick={() => router.push(`/admin/spaces/${space.spaceId}/items`)}
              className="cursor-pointer"
            >
              <div className="relative h-48">
                <img
                  src={space.thumbnailUrl}
                  alt={space.name}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                  {space.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                  {space.description}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(space)}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-center hover:bg-indigo-600 transition-colors text-sm"
                >
                  Editar
                </button>
                <Link
                  href={`/admin/spaces/${space.spaceId}/items`}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg text-center hover:bg-purple-600 transition-colors text-sm"
                >
                  Itens
                </Link>
                <button
                  onClick={() => handleDelete(space.spaceId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SpaceModal
        space={selectedSpace}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpace(null);
        }}
        onSave={fetchSpaces}
      />

      {spaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum espaço cultural cadastrado.
          </p>
        </div>
      )}
    </div>
  );
} 