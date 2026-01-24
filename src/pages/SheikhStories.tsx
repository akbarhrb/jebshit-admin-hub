import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContentCard from '@/components/ui/ContentCard';
import Modal from '@/components/ui/Modal';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation';
import ImageUpload from '@/components/ui/ImageUpload';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SheikhStory, ContentStatus } from '@/types/content';

const SheikhStories: React.FC = () => {
  const [stories, setStories] = useLocalStorage<SheikhStory[]>('jebshit_stories', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SheikhStory | null>(null);
  const [deleteItem, setDeleteItem] = useState<SheikhStory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    const now = new Date().toISOString();

    if (editingItem) {
      setStories((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...formData, updatedAt: now }
            : item
        )
      );
      toast.success('Story updated successfully');
    } else {
      const newItem: SheikhStory = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setStories((prev) => [newItem, ...prev]);
      toast.success('Story created successfully');
    }

    closeModal();
  };

  const handleDelete = (item: SheikhStory) => {
    setStories((prev) => prev.filter((s) => s.id !== item.id));
    toast.success('Story deleted successfully');
  };

  const handleImageChange = (url: string | undefined) => {
    if (url) {
      setFormData({ ...formData, images: [url, ...formData.images.slice(0, 3)] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

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
                image={item.images[0]}
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
                <ImageUpload onChange={handleImageChange} />
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
          title="Delete Story"
          message="Are you sure you want to delete this story? This action cannot be undone."
        />
      </div>
    </DashboardLayout>
  );
};

export default SheikhStories;
