import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import ImageUpload from '@/components/ui/ImageUpload';
import VideoUpload, { YouTubePreview } from '@/components/ui/VideoUpload';
import { useFirestore } from '@/hooks/useFirestore';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { VillageMemory, ContentStatus } from '@/types/content';

const VillageMemories: React.FC = () => {
  const { t } = useTranslation();
  const { data: memories, isLoading, add, update, remove } = useFirestore<VillageMemory>('memories');
  const { deleteImage } = useFirebaseStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VillageMemory | null>(null);
  const [deleteItem, setDeleteItem] = useState<VillageMemory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    images: [] as string[],
    youtubeIds: [] as string[],
    memoryDate: '',
    status: 'draft' as ContentStatus,
  });

  const filteredMemories = memories.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      images: [],
      youtubeIds: [],
      memoryDate: '',
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: VillageMemory) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        content: item.content,
        images: item.images || [],
        youtubeIds: item.youtubeIds || [],
        memoryDate: item.memoryDate || '',
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
      toast.error(t('memories.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('memories.descriptionRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        memoryDate: formData.memoryDate || undefined,
      };

      if (editingItem) {
        const removedImages = (editingItem.images || []).filter(
          (img) => !formData.images.includes(img)
        );
        await Promise.all(removedImages.map((img) => deleteImage(img)));
        
        await update(editingItem.id, dataToSave);
        toast.success(t('memories.updatedSuccess'));
      } else {
        await add(dataToSave);
        toast.success(t('memories.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('memories.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: VillageMemory) => {
    try {
      await Promise.all((item.images || []).map((img) => deleteImage(img)));
      await remove(item.id);
      toast.success(t('memories.deletedSuccess'));
    } catch (error) {
      toast.error(t('memories.deleteFailed'));
    }
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, images: [url, ...formData.images.slice(0, 5)] });
    }
  };

  const handleVideoChange = (youtubeId: string | undefined) => {
    if (youtubeId) {
      setFormData({ ...formData, youtubeIds: [youtubeId, ...formData.youtubeIds.slice(0, 3)] });
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

  const removeVideo = (index: number) => {
    setFormData({
      ...formData,
      youtubeIds: formData.youtubeIds.filter((_, i) => i !== index),
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
            <h1 className="page-header">{t('memories.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('memories.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('memories.addMemory')}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('memories.searchMemories')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('memories.noMemoriesFound') : t('memories.noMemories')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={item.description}
                image={item.images?.[0]}
                status={item.status}
                statusLabels={{ published: t('memories.statusPublished'), draft: t('memories.statusDraft') }}
                date={item.memoryDate ? new Date(item.memoryDate).toLocaleDateString() : undefined}
                onEdit={() => openModal(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? t('memories.editMemory') : t('memories.addMemory')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('memories.titleLabel')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder={t('memories.titlePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('memories.descriptionLabel')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px] resize-y"
                placeholder={t('memories.descriptionPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('memories.contentLabel')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[120px] resize-y"
                placeholder={t('memories.contentPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('memories.imagesLabel')} (6 max)</label>
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
                <ImageUpload onChange={handleImageChange} storagePath="memories" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('memories.videosLabel')} (4 max)</label>
              {formData.youtubeIds.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {formData.youtubeIds.map((id, index) => (
                    <YouTubePreview
                      key={index}
                      youtubeId={id}
                      onRemove={() => removeVideo(index)}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}
              {formData.youtubeIds.length < 4 && (
                <VideoUpload onChange={handleVideoChange} title={formData.title || 'Village Memory'} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('memories.dateLabel')}</label>
                <input
                  type="date"
                  value={formData.memoryDate}
                  onChange={(e) => setFormData({ ...formData, memoryDate: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('memories.statusLabel')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">{t('memories.statusDraft')}</option>
                  <option value="published">{t('memories.statusPublished')}</option>
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
          title={t('memories.deleteTitle')}
          message={t('memories.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default VillageMemories;
