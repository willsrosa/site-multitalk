import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import AboutSection from '../components/AboutSection';
import BlogSection from '../components/BlogSection';
import ContactSection from '../components/ContactSection';
import { Loader2 } from 'lucide-react';

const AffiliatePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [affiliate, setAffiliate] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAffiliate = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', slug)
          .single();

        if (error || !data) {
          throw new Error('Affiliate not found');
        }
        setAffiliate(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliate();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <BlogSection />
      <ContactSection affiliateId={affiliate?.id} />
    </>
  );
};

export default AffiliatePage;
