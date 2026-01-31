import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import ImageUpload from '@/components/ui/ImageUpload';
import VideoUpload, { VideoPreview } from '@/components/ui/VideoUpload';
import { useFirestore } from '@/hooks/useFirestore';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { ReligiousTopic, ContentStatus } from '@/types/content';

const ReligiousTopics: React.FC = () => {
  const { t } = useTranslation();
  const { data: topics, isLoading, add, update, remove } = useFirestore<ReligiousTopic>('topics');
  const { deleteImage } = useFirebaseStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReligiousTopic | null>(null);
  const [deleteItem, setDeleteItem] = useState<ReligiousTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    images: [] as string[],
    videos: [] as string[],
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft' as ContentStatus,
  });

  const filteredTopics = topics.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      images: [],
      videos: [],
      publishDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: ReligiousTopic) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        content: item.content,
        images: item.images || [],
        videos: item.videos || [],
        publishDate: item.publishDate || new Date().toISOString().split('T')[0],
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
      toast.error(t('topics.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('topics.descriptionRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingItem) {
        // Delete removed images
        const removedImages = (editingItem.images || []).filter(
          (img) => !formData.images.includes(img)
        );
        // Delete removed videos
        const removedVideos = (editingItem.videos || []).filter(
          (vid) => !formData.videos.includes(vid)
        );
        await Promise.all([
          ...removedImages.map((img) => deleteImage(img)),
          ...removedVideos.map((vid) => deleteImage(vid)),
        ]);
        
        await update(editingItem.id, formData);
        toast.success(t('topics.updatedSuccess'));
      } else {
        await add(formData);
        toast.success(t('topics.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('topics.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ReligiousTopic) => {
    try {
      await Promise.all([
        ...(item.images || []).map((img) => deleteImage(img)),
        ...(item.videos || []).map((vid) => deleteImage(vid)),
      ]);
      await remove(item.id);
      toast.success(t('topics.deletedSuccess'));
    } catch (error) {
      toast.error(t('topics.deleteFailed'));
    }
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, images: [url, ...formData.images.slice(0, 5)] });
    }
  };

  const handleVideoChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, videos: [url, ...formData.videos.slice(0, 2)] });
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

  const removeVideo = async (index: number) => {
    const videoToRemove = formData.videos[index];
    if (!editingItem || !editingItem.videos?.includes(videoToRemove)) {
      await deleteImage(videoToRemove);
    }
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index),
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
            <h1 className="page-header">{t('topics.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('topics.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('topics.addTopic')}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('topics.searchTopics')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('topics.noTopicsFound') : t('topics.noTopics')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={item.description}
                image={item.images?.[0]}
                status={item.status}
                statusLabels={{ published: t('topics.statusPublished'), draft: t('topics.statusDraft') }}
                date={item.publishDate ? new Date(item.publishDate).toLocaleDateString() : ''}
                onEdit={() => openModal(item)}
                onDelete={() => setDeleteItem(item)}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? t('topics.editTopic') : t('topics.addTopic')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('topics.titleLabel')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder={t('topics.titlePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('topics.descriptionLabel')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px] resize-y"
                placeholder={t('topics.descriptionPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('topics.contentLabel')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[120px] resize-y"
                placeholder={t('topics.contentPlaceholder')}
                dir="auto"
              />
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('topics.imagesLabel')} (6 max)</label>
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
                <ImageUpload onChange={handleImageChange} storagePath="topics" />
              )}
            </div>

            {/* Videos Section */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('topics.videosLabel')} (3 max)</label>
              {formData.videos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {formData.videos.map((vid, index) => (
                    <VideoPreview
                      key={index}
                      url={vid}
                      onRemove={() => removeVideo(index)}
                    />
                  ))}
                </div>
              )}
              {formData.videos.length < 3 && (
                <VideoUpload onChange={handleVideoChange} storagePath="topics" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('topics.dateLabel')}</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('topics.statusLabel')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">{t('topics.statusDraft')}</option>
                  <option value="published">{t('topics.statusPublished')}</option>
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
          title={t('topics.deleteTitle')}
          message={t('topics.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default ReligiousTopics;
