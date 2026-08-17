import React, { useState, useEffect } from 'react';
import { HealthArticle } from '../types';
import { api } from '../services/api';
import { ArrowLeft, Clock, Calendar, User, PhoneCall, Share2 } from 'lucide-react';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (view: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, onNavigate }) => {
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getArticle(slug);
        setArticle(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 bg-slate-200 rounded-md w-3/4 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Article not found</h2>
        <button
          onClick={() => onNavigate('articles')}
          className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      <button
        onClick={() => onNavigate('articles')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Health Articles</span>
      </button>

      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {article.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.publishedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>
      </div>

      <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="whitespace-pre-line text-base font-normal">
          {article.content}
        </div>

        {/* Doctor Hotline Callout */}
        <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Have personal medication questions?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Consult our clinical team at Gods Favor Pharmacy along Kijana Wamalwa Road, Kitale.
            </p>
          </div>

          <a
            href="tel:07417758578"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 transition-colors shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 07417758578</span>
          </a>
        </div>
      </div>
    </article>
  );
};
