import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import ImageUpload from '@/components/ui/ImageUpload';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Martyr, ContentStatus } from '@/types/content';

const Martyrs: React.FC = () => {
  const [martyrs, setMartyrs] = useLocalStorage<Martyr[]>('jebshit_martyrs', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Martyr | null>(null);
  const [deleteItem, setDeleteItem] = useState<Martyr | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    dateOfMartyrdom: '',
    biography: '',
    status: 'draft' as ContentStatus,
  });

  const filteredMartyrs = martyrs.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      photo: '',
      dateOfMartyrdom: '',
      biography: '',
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: Martyr) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        photo: item.photo || '',
        dateOfMartyrdom: item.dateOfMartyrdom,
        biography: item.biography,
        status: item.status,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.biography.trim()) {
      toast.error('Biography is required');
      return;
    }

    const now = new Date().toISOString();

    if (editingItem) {
      setMartyrs((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...formData, updatedAt: now }
            : item
        )
      );
      toast.success('Martyr updated successfully');
    } else {
      const newItem: Martyr = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setMartyrs((prev) => [newItem, ...prev]);
      toast.success('Martyr created successfully');
    }

    closeModal();
  };

  const handleDelete = (item: Martyr) => {
    setMartyrs((prev) => prev.filter((m) => m.id !== item.id));
    toast.success('Martyr deleted successfully');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-header">Martyrs</h1>
            <p className="text-muted-foreground mt-1">Manage martyr profiles</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Martyr
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search martyrs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Grid */}
        {filteredMartyrs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? 'No martyrs found matching your search' : 'No martyrs yet. Add your first profile!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMartyrs.map((item) => (
              <ContentCard
                key={item.id}
                title={item.name}
                subtitle={item.biography.substring(0, 100)}
                image={item.photo}
                status={item.status}
                date={item.dateOfMartyrdom ? new Date(item.dateOfMartyrdom).toLocaleDateString() : 'Date not set'}
                onEdit={() => openModal(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? 'Edit Martyr' : 'Add Martyr'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Biography *</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="form-input min-h-[150px] resize-y"
                placeholder="Enter biography"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photo</label>
              <ImageUpload
                value={formData.photo}
                onChange={(url) => setFormData({ ...formData, photo: url || '' })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date of Martyrdom</label>
                <input
                  type="date"
                  value={formData.dateOfMartyrdom}
                  onChange={(e) => setFormData({ ...formData, dateOfMartyrdom: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirmation
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteItem && handleDelete(deleteItem)}
          title="Delete Martyr"
          message="Are you sure you want to delete this martyr profile? This action cannot be undone."
        />
      </div>
    </DashboardLayout>
  );
};

export default Martyrs;
