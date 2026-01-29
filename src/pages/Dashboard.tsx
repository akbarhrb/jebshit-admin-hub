import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFirestore } from '@/hooks/useFirestore';
import { NewsItem, Martyr, SheikhStory, MosqueActivity, ReligiousTopic, JobOpportunity, VillageMemory } from '@/types/content';
import { Newspaper, Users, BookOpen, Calendar, BookMarked, Briefcase, Camera, ArrowRight, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: news } = useFirestore<NewsItem>('news');
  const { data: martyrs } = useFirestore<Martyr>('martyrs');
  const { data: stories } = useFirestore<SheikhStory>('stories');
  const { data: activities } = useFirestore<MosqueActivity>('activities');
  const { data: topics } = useFirestore<ReligiousTopic>('topics');
  const { data: jobs } = useFirestore<JobOpportunity>('jobs');
  const { data: memories } = useFirestore<VillageMemory>('memories');

  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const stats = [
    {
      label: t('dashboard.newsArticles'),
      count: news.length,
      published: news.filter((n) => n.status === 'published').length,
      icon: Newspaper,
      path: '/news',
      color: 'bg-primary/10 text-primary',
    },
    {
      label: t('dashboard.martyrsCount'),
      count: martyrs.length,
      published: martyrs.filter((m) => m.status === 'published').length,
      icon: Users,
      path: '/martyrs',
      color: 'bg-warning/10 text-warning',
    },
    {
      label: t('dashboard.sheikhStoriesCount'),
      count: stories.length,
      published: stories.filter((s) => s.status === 'published').length,
      icon: BookOpen,
      path: '/sheikh-stories',
      color: 'bg-success/10 text-success',
    },
    {
      label: t('dashboard.activitiesCount'),
      count: activities.length,
      published: activities.filter((a) => a.status === 'published').length,
      icon: Calendar,
      path: '/activities',
      color: 'bg-info/10 text-info',
    },
    {
      label: t('dashboard.topicsCount'),
      count: topics.length,
      published: topics.filter((t) => t.status === 'published').length,
      icon: BookMarked,
      path: '/topics',
      color: 'bg-accent/10 text-accent-foreground',
    },
    {
      label: t('dashboard.jobsCount'),
      count: jobs.length,
      published: jobs.filter((j) => j.status === 'published').length,
      icon: Briefcase,
      path: '/jobs',
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      label: t('dashboard.memoriesCount'),
      count: memories.length,
      published: memories.filter((m) => m.status === 'published').length,
      icon: Camera,
      path: '/memories',
      color: 'bg-pink-500/10 text-pink-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="page-header">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
                  <ArrowIcon className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
                <h3 className="text-3xl font-bold text-card-foreground mb-1">{stat.count}</h3>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.published} {t('dashboard.published')}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link to="/news" className="btn-secondary text-center">
              {t('dashboard.addNewsArticle')}
            </Link>
            <Link to="/martyrs" className="btn-secondary text-center">
              {t('dashboard.addMartyr')}
            </Link>
            <Link to="/sheikh-stories" className="btn-secondary text-center">
              {t('dashboard.addSheikhStory')}
            </Link>
            <Link to="/activities" className="btn-secondary text-center">
              {t('dashboard.addActivity')}
            </Link>
            <Link to="/topics" className="btn-secondary text-center">
              {t('dashboard.addTopic')}
            </Link>
            <Link to="/jobs" className="btn-secondary text-center">
              {t('dashboard.addJob')}
            </Link>
            <Link to="/memories" className="btn-secondary text-center">
              {t('dashboard.addMemory')}
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
