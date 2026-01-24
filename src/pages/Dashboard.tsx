import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NewsItem, Martyr, SheikhStory } from '@/types/content';
import { Newspaper, Users, BookOpen, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const [news] = useLocalStorage<NewsItem[]>('jebshit_news', []);
  const [martyrs] = useLocalStorage<Martyr[]>('jebshit_martyrs', []);
  const [stories] = useLocalStorage<SheikhStory[]>('jebshit_stories', []);

  const stats = [
    {
      label: 'News Articles',
      count: news.length,
      published: news.filter((n) => n.status === 'published').length,
      icon: Newspaper,
      path: '/news',
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Martyrs',
      count: martyrs.length,
      published: martyrs.filter((m) => m.status === 'published').length,
      icon: Users,
      path: '/martyrs',
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Sheikh Stories',
      count: stories.length,
      published: stories.filter((s) => s.status === 'published').length,
      icon: BookOpen,
      path: '/sheikh-stories',
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="page-header">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your content</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.path}
                className="bg-card rounded-xl border border-border p-6 card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-3xl font-bold text-card-foreground mb-1">{stat.count}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {stat.published} published
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/news" className="btn-secondary text-center">
              Add News Article
            </Link>
            <Link to="/martyrs" className="btn-secondary text-center">
              Add Martyr
            </Link>
            <Link to="/sheikh-stories" className="btn-secondary text-center">
              Add Sheikh Story
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
