import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import ImageUpload from '@/components/ui/ImageUpload';
import { useFirestore } from '@/hooks/useFirestore';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { Martyr, ContentStatus } from '@/types/content';

const Martyrs: React.FC = () => {
  const { data: martyrs, isLoading, add, update, remove } = useFirestore<Martyr>('martyrs');
  const { deleteImage } = useFirebaseStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Martyr | null>(null);
  const [deleteItem, setDeleteItem] = useState<Martyr | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.biography.trim()) {
      toast.error('Biography is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingItem) {
        // Delete old photo if changed
        if (editingItem.photo && editingItem.photo !== formData.photo) {
          await deleteImage(editingItem.photo);
        }
        await update(editingItem.id, formData);
        toast.success('Martyr updated successfully');
      } else {
        await add(formData);
        toast.success('Martyr created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save martyr');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Martyr) => {
    try {
      if (item.photo) {
        await deleteImage(item.photo);
      }
      await remove(item.id);
      toast.success('Martyr deleted successfully');
    } catch (error) {
      toast.error('Failed to delete martyr');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                storagePath="martyrs"
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
              <button type="button" onClick={closeModal} className="btn-secondary flex-1" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : editingItem ? 'Update' : 'Create'}
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
