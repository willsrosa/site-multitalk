import React from 'react';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import AboutSection from '../components/AboutSection';
import BlogSection from '../components/BlogSection';
import ContactSection from '../components/ContactSection';

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <BlogSection />
      <ContactSection />
    </>
  );
};

export default Home;
