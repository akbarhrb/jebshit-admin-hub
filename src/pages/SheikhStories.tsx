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
import { SheikhStory, ContentStatus } from '@/types/content';

const SheikhStories: React.FC = () => {
  const { data: stories, isLoading, add, update, remove } = useFirestore<SheikhStory>('stories');
  const { deleteImage } = useFirebaseStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SheikhStory | null>(null);
  const [deleteItem, setDeleteItem] = useState<SheikhStory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft' as ContentStatus,
  });

  const filteredStories = stories.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      images: [],
      publishDate: new Date().toISOString().split('T')[0],
      status: 'draft',
    });
    setEditingItem(null);
  };

  const openModal = (item?: SheikhStory) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        images: item.images || [],
        publishDate: item.publishDate,
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
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingItem) {
        // Delete removed images
        const removedImages = (editingItem.images || []).filter(
          (img) => !formData.images.includes(img)
        );
        await Promise.all(removedImages.map((img) => deleteImage(img)));
        
        await update(editingItem.id, formData);
        toast.success('Story updated successfully');
      } else {
        await add(formData);
        toast.success('Story created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SheikhStory) => {
    try {
      // Delete all images
      await Promise.all((item.images || []).map((img) => deleteImage(img)));
      await remove(item.id);
      toast.success('Story deleted successfully');
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, images: [url, ...formData.images.slice(0, 3)] });
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index];
    // Only delete from storage if it's a new upload (not saved yet)
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-header">Sheikh Ragheb Harb Stories</h1>
            <p className="text-muted-foreground mt-1">Manage stories and teachings</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Story
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {searchQuery ? 'No stories found matching your search' : 'No stories yet. Add your first story!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={item.content.substring(0, 100)}
                image={item.images?.[0]}
                status={item.status}
                date={new Date(item.publishDate).toLocaleDateString()}
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
          title={editingItem ? 'Edit Story' : 'Add Story'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Story Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-input min-h-[150px] resize-y"
                placeholder="Enter story content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images (up to 4)</label>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.images.length < 4 && (
                <ImageUpload onChange={handleImageChange} storagePath="stories" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Publish Date</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
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
          title="Delete Story"
          message="Are you sure you want to delete this story? This action cannot be undone."
        />
      </div>
    </DashboardLayout>
  );
};

export default SheikhStories;
