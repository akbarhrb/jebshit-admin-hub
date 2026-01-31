import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Search, Loader2, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import { useFirestore } from '@/hooks/useFirestore';
import { NewsItem, ContentStatus } from '@/types/content';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const News: React.FC = () => {
  const { t } = useTranslation();
  const { data: news, isLoading, add, update, remove } = useFirestore<NewsItem>('news');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    isUrgent: false,
    status: 'draft' as ContentStatus,
  });

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      isUrgent: false,
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: NewsItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        content: item.content,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isUrgent: item.isUrgent || false,
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
      toast.error(t('news.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('news.descriptionRequired'));
      return;
    }

    if (!formData.content.trim()) {
      toast.error(t('news.contentRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const newsData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        date: formData.date, // Will be converted to Timestamp by useFirestore
        isUrgent: formData.isUrgent,
        status: formData.status,
      };

      if (editingItem) {
        await update(editingItem.id, newsData);
        toast.success(t('news.updatedSuccess'));
      } else {
        await add(newsData);
        toast.success(t('news.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('news.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    try {
      await remove(item.id);
      toast.success(t('news.deletedSuccess'));
    } catch (error) {
      toast.error(t('news.deleteFailed'));
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
            <h1 className="page-header">{t('news.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('news.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('news.addNews')}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('news.searchNews')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {/* Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('news.noNewsFound') : t('news.noNews')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg border border-border overflow-hidden card-hover"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {item.isUrgent && (
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                      <h3 className="font-medium text-card-foreground line-clamp-2" dir="auto">
                        {item.title}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full shrink-0 ${
                      item.status === 'published' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'published' ? t('news.statusPublished') : t('news.statusDraft')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3" dir="auto">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {item.date ? new Date(item.date).toLocaleDateString() : t('news.noDate')}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title={t('common.edit')}
                      >
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                        title={t('common.delete')}
                      >
                        <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? t('news.editNews') : t('news.createNews')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('news.titleLabel')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder={t('news.titlePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('news.descriptionLabel')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px] resize-y"
                placeholder={t('news.descriptionPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('news.contentLabel')} *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[200px] resize-y"
                placeholder={t('news.contentPlaceholder')}
                dir="auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('news.dateLabel')}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('news.statusLabel')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                  className="form-input"
                >
                  <option value="draft">{t('news.statusDraft')}</option>
                  <option value="published">{t('news.statusPublished')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isUrgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked })}
              />
              <Label htmlFor="isUrgent" className="flex items-center gap-2 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                {t('news.markAsUrgent')}
              </Label>
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
          title={t('news.deleteTitle')}
          message={t('news.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default News;