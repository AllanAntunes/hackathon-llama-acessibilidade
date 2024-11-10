"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from 'react';
import Link from "next/link";
import BaseModal from "@/app/components/BaseModal";
import { FiUpload } from "react-icons/fi";
import { MdEdit, MdDelete } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";

function ItemModal({ item, spaceId, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    itemId: "",
    step: 1,
    name: "",
    description: "",
    authorName: "",
    authorDescription: "",
    imageUrl: "",
    aiDescription: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        itemId: item.itemId,
        step: item.step || 1,
        name: item.name || "",
        description: item.description || "",
        authorName: item.authorName || "",
        authorDescription: item.authorDescription || "",
        imageUrl: item.imageUrl || "",
        aiDescription: item.aiDescription || "",
      });
    } else {
      setFormData({
        itemId: "",
        step: 1,
        name: "",
        description: "",
        authorName: "",
        authorDescription: "",
        imageUrl: "",
        aiDescription: "",
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api.acessibilidade.tec.br/space/${spaceId}/item`, {
        method: item ? "PUT" : "POST",
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          item 
            ? formData
            : {
                name: formData.name,
                step: formData.step,
                description: formData.description,
                authorName: formData.authorName,
                authorDescription: formData.authorDescription,
                imageUrl: formData.imageUrl,
              }
        ),
      });

      if (!response.ok) throw new Error(item ? 'Failed to update item' : 'Failed to create item');
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      alert(`Falha ao ${item ? 'atualizar' : 'criar'} o item. Por favor, tente novamente.`);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Editar Item" : "Novo Item"}
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

        {item && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audiodescrição com Llama 3.2
            </label>
            <textarea
              value={formData.aiDescription}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600"
              rows={3}
              disabled
            />
          </div>
        )}

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
            Nome do Autor
          </label>
          <input
            type="text"
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição do Autor
          </label>
          <textarea
            value={formData.authorDescription}
            onChange={(e) => setFormData({ ...formData, authorDescription: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
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
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem
          </label>
          <input
            type="number"
            value={formData.step}
            onChange={(e) => setFormData({ ...formData, step: parseInt(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {item ? 'Atualizar' : 'Criar'}
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

export default function SpaceItemsPage({ params: paramsPromise }) {
  const router = useRouter();
  const params = use(paramsPromise);
  const [items, setItems] = useState([]);
  const [space, setSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchSpace();
    fetchItems();
  }, []);

  const fetchSpace = async () => {
    try {
      const response = await fetch(`https://api.acessibilidade.tec.br/space/${params.id}`, {
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch space');
      const data = await response.json();
      setSpace(data);
    } catch (error) {
      console.error("Error fetching space:", error);
      setError("Falha ao carregar informações do espaço cultural.");
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`https://api.acessibilidade.tec.br/space/${params.id}/item`, {
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Falha ao carregar os itens do espaço cultural.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      const response = await fetch(`https://api.acessibilidade.tec.br/space/${params.id}/item`, {
        method: "DELETE",
        headers: {
          'Authorization': '0s43GUYwLLYtcsJudJZAxypxwAnlQKu5wxAffVOu0Vrkb1XSZJFGc7cAzXt0IJkF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        fetchItems();
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Falha ao excluir o item. Por favor, tente novamente.");
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Link href="/admin/spaces" className="hover:text-indigo-600 flex items-center gap-1">
            <IoMdArrowBack />
            Espaços Culturais
          </Link>
          <span>→</span>
          <span className="text-gray-800">{space?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Itens do Espaço</h1>
          <button
            onClick={() => {
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <AiOutlinePlus />
            Novo Item
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                {item.name}
              </h2>
              <h2 className="text-gray-600 mb-4 line-clamp-2 text-sm">
                {item.aiDescription}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                {item.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-center hover:bg-indigo-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <MdEdit />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.itemId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
                >
                  <MdDelete />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <ItemModal
        item={selectedItem}
        spaceId={params.id}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={fetchItems}
      />

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum item cadastrado neste espaço cultural.
          </p>
        </div>
      )}
    </div>
  );
} 