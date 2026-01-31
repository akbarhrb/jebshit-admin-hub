import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Search, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import { useFirestore } from '@/hooks/useFirestore';
import { JobOpportunity, ContentStatus, JobType } from '@/types/content';

const JobOpportunities: React.FC = () => {
  const { t } = useTranslation();
  const { data: jobs, isLoading, add, update, remove } = useFirestore<JobOpportunity>('jobs');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobOpportunity | null>(null);
  const [deleteItem, setDeleteItem] = useState<JobOpportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'full-time' as JobType,
    location: '',
    contactInfo: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'draft' as ContentStatus,
  });

  const filteredJobs = jobs.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      jobType: 'full-time',
      location: '',
      contactInfo: '',
      content: '',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: JobOpportunity) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        jobType: item.jobType,
        location: item.location,
        contactInfo: item.contactInfo,
        content: item.content,
        publishDate: item.publishDate || new Date().toISOString().split('T')[0],
        expiryDate: item.expiryDate || '',
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
      toast.error(t('jobs.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('jobs.descriptionRequired'));
      return;
    }

    if (!formData.location.trim()) {
      toast.error(t('jobs.locationRequired'));
      return;
    }

    if (!formData.contactInfo.trim()) {
      toast.error(t('jobs.contactRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        expiryDate: formData.expiryDate || undefined,
      };

      if (editingItem) {
        await update(editingItem.id, dataToSave);
        toast.success(t('jobs.updatedSuccess'));
      } else {
        await add(dataToSave);
        toast.success(t('jobs.createdSuccess'));
      }
      closeModal();
    } catch (error) {
      toast.error(t('jobs.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: JobOpportunity) => {
    try {
      await remove(item.id);
      toast.success(t('jobs.deletedSuccess'));
    } catch (error) {
      toast.error(t('jobs.deleteFailed'));
    }
  };

  const getJobTypeLabel = (type: JobType) => {
    switch (type) {
      case 'full-time': return t('jobs.fullTime');
      case 'part-time': return t('jobs.partTime');
      case 'temporary': return t('jobs.temporary');
      default: return type;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-header">{t('jobs.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('jobs.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('jobs.addJob')}
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('jobs.searchJobs')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input ps-10"
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? t('jobs.noJobsFound') : t('jobs.noJobs')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={`${getJobTypeLabel(item.jobType)} • ${item.location}`}
                status={item.status}
                statusLabels={{ published: t('jobs.statusPublished'), draft: t('jobs.statusDraft') }}
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
          title={editingItem ? t('jobs.editJob') : t('jobs.addJob')}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('jobs.titleLabel')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder={t('jobs.titlePlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('jobs.descriptionLabel')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px] resize-y"
                placeholder={t('jobs.descriptionPlaceholder')}
                dir="auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('jobs.jobTypeLabel')} *</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                  className="form-input"
                >
                  <option value="full-time">{t('jobs.fullTime')}</option>
                  <option value="part-time">{t('jobs.partTime')}</option>
                  <option value="temporary">{t('jobs.temporary')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('jobs.locationLabel')} *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-input"
                  placeholder={t('jobs.locationPlaceholder')}
                  dir="auto"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('jobs.contactLabel')} *</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="form-input"
                placeholder={t('jobs.contactPlaceholder')}
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('jobs.contentLabel')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[120px] resize-y"
                placeholder={t('jobs.contentPlaceholder')}
                dir="auto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('jobs.publishDateLabel')}</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('jobs.expiryDateLabel')}</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('jobs.statusLabel')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                className="form-input"
              >
                <option value="draft">{t('jobs.statusDraft')}</option>
                <option value="published">{t('jobs.statusPublished')}</option>
              </select>
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
          title={t('jobs.deleteTitle')}
          message={t('jobs.deleteMessage')}
        />
      </div>
    </DashboardLayout>
  );
};

export default JobOpportunities;
