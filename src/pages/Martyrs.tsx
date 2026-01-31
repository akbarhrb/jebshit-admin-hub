import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        dateOfMartyrdom: item.dateOfMartyrdom || '',
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
      toast.error(t('martyrs.nameRequired'));
      return;
    }

    if (!formData.biography.trim()) {
      toast.error(t('martyrs.biographyRequired'));
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
        toast.success(t('martyrs.updatedSuccess'));
      } else {
        await add(formData);
        toast.success(t('martyrs.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('martyrs.saveFailed'));
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
      toast.success(t('martyrs.deletedSuccess'));
    } catch (error) {
      toast.error(t('martyrs.deleteFailed'));
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
            <h1 className="page-header">{t('martyrs.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('martyrs.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('martyrs.addMartyr')}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('martyrs.searchMartyrs')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {/* Grid */}
        {filteredMartyrs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('martyrs.noMartyrsFound') : t('martyrs.noMartyrs')}
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
                statusLabels={{ published: t('martyrs.statusPublished'), draft: t('martyrs.statusDraft') }}
                date={item.dateOfMartyrdom ? new Date(item.dateOfMartyrdom).toLocaleDateString() : ''}
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
          title={editingItem ? t('martyrs.editMartyr') : t('martyrs.addMartyr')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('martyrs.nameLabel')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder={t('martyrs.namePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('martyrs.biographyLabel')} *</label>
              <textarea
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                className="form-input min-h-[150px] resize-y"
                placeholder={t('martyrs.biographyPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('martyrs.imageLabel')}</label>
              <ImageUpload
                value={formData.photo}
                onChange={(url) => setFormData({ ...formData, photo: url || '' })}
                storagePath="martyrs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('martyrs.dateOfMartyrdomLabel')}</label>
                <input
                  type="date"
                  value={formData.dateOfMartyrdom}
                  onChange={(e) => setFormData({ ...formData, dateOfMartyrdom: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('martyrs.statusLabel')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">{t('martyrs.statusDraft')}</option>
                  <option value="published">{t('martyrs.statusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1" disabled={isSubmitting}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : editingItem ? t('common.update') : t('common.create')}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <DeleteConfirmation
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteItem && handleDelete(deleteItem)}
          title={t('martyrs.deleteTitle')}
          message={t('martyrs.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default Martyrs;