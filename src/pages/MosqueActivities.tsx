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
import { MosqueActivity, ContentStatus } from '@/types/content';

const MosqueActivities: React.FC = () => {
  const { t } = useTranslation();
  const { data: activities, isLoading, add, update, remove } = useFirestore<MosqueActivity>('activities');
  const { deleteImage } = useFirebaseStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MosqueActivity | null>(null);
  const [deleteItem, setDeleteItem] = useState<MosqueActivity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    images: [] as string[],
    status: 'draft' as ContentStatus,
  });

  const filteredActivities = activities.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: MosqueActivity) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        content: item.content,
        date: item.date,
        images: item.images || [],
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

    if (!formData.title.trim()) {
      toast.error(t('activities.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('activities.descriptionRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingItem) {
        const removedImages = (editingItem.images || []).filter(
          (img) => !formData.images.includes(img)
        );
        await Promise.all(removedImages.map((img) => deleteImage(img)));
        
        await update(editingItem.id, formData);
        toast.success(t('activities.updatedSuccess'));
      } else {
        await add(formData);
        toast.success(t('activities.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('activities.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MosqueActivity) => {
    try {
      await Promise.all((item.images || []).map((img) => deleteImage(img)));
      await remove(item.id);
      toast.success(t('activities.deletedSuccess'));
    } catch (error) {
      toast.error(t('activities.deleteFailed'));
    }
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, images: [url, ...formData.images.slice(0, 5)] });
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index];
    if (!editingItem || !editingItem.images?.includes(imageToRemove)) {
      await deleteImage(imageToRemove);
    }
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-header">{t('activities.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('activities.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('activities.addActivity')}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('activities.searchActivities')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('activities.noActivitiesFound') : t('activities.noActivities')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={item.description}
                image={item.images?.[0]}
                status={item.status}
                statusLabels={{ published: t('activities.statusPublished'), draft: t('activities.statusDraft') }}
                date={new Date(item.date).toLocaleDateString()}
                onEdit={() => openModal(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? t('activities.editActivity') : t('activities.addActivity')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('activities.titleLabel')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder={t('activities.titlePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('activities.descriptionLabel')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px] resize-y"
                placeholder={t('activities.descriptionPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('activities.contentLabel')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[120px] resize-y"
                placeholder={t('activities.contentPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('activities.imagesLabel')} (6 max)</label>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 end-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.images.length < 6 && (
                <ImageUpload onChange={handleImageChange} storagePath="activities" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('activities.dateLabel')}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('activities.statusLabel')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">{t('activities.statusDraft')}</option>
                  <option value="published">{t('activities.statusPublished')}</option>
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

        <DeleteConfirmation
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteItem && handleDelete(deleteItem)}
          title={t('activities.deleteTitle')}
          message={t('activities.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default MosqueActivities;
