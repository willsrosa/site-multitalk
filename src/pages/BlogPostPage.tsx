import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase, BlogPost } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Loader2, ServerCrash } from 'lucide-react';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('Post não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, category:categories(*), author:authors(*)')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error || !data) {
          throw new Error('Post não encontrado ou não publicado.');
        }
        setPost(data);
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao carregar o post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-32 min-h-screen text-center px-4">
        <ServerCrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Post não encontrado</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
        <Link 
          to="/blog"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para o Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-white dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <Link 
            to="/blog"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Link>
        </div>

        <article>
          <header className="mb-12 text-center">
            {post.category && (
              <Link to="/blog" className="text-lg font-semibold" style={{ color: post.category.color }}>
                {post.category.name}
              </Link>
            )}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white my-4 font-heading leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{post.author?.name || 'Equipe Multi Talk'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </header>

          <motion.img
            src={post.featured_image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop'}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />

          <div className="prose prose-lg dark:prose-invert max-w-none prose-blue 
                          prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                          prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
                          prose-img:rounded-xl">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </motion.div>
    </div>
  );
};

export default BlogPostPage;
