import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { Mail, MessageCircle, Star, CheckCircle, ArrowRight, Loader2, Play, Zap, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import PartnerWhatsAppButton from '../components/PartnerWhatsAppButton';

interface SalesPageProps {}

const SalesPage: React.FC<SalesPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const [affiliate, setAffiliate] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  useEffect(() => {
    const fetchAffiliate = async () => {
      if (!slug) {
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
        console.error('Error fetching affiliate:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAffiliate();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
          profile_id: affiliate.id,
          status: 'Nova Lead'
        }]);

      if (error) throw error;

      toast.success('Lead cadastrada com sucesso! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao cadastrar lead. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (affiliate?.whatsapp) {
      const message = encodeURIComponent('Olá! Vim através da sua página de vendas e gostaria de saber mais sobre seus serviços.');
      window.open(`https://wa.me/${affiliate.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
          <p className="text-gray-600">O afiliado solicitado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, value: '500+', label: 'Clientes Atendidos' },
    { icon: MessageCircle, value: '95%', label: 'Taxa de Sucesso' },
    { icon: TrendingUp, value: '150%', label: 'ROI Médio' },
    { icon: Zap, value: '24h', label: 'Tempo de Resposta' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-purple-900/90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-1">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header with Logo */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo />
            {affiliate.whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-full text-sm transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-white"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
            >
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              <span className="font-semibold">A Melhor Plataforma Omnichannel do Brasil</span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 font-heading leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Transforme seu{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                negócio
              </span>
              <span className="block text-yellow-300">hoje mesmo</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Soluções personalizadas que geram resultados reais para empresas que querem crescer de forma sustentável e eficiente.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-xs font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <button
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25"
              >
                <span>Quero Uma Proposta Gratuita</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center justify-center space-x-3 text-white hover:text-cyan-400 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="font-semibold">Ver Demo</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
            id="contact-form"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Receba uma Proposta Personalizada
              </h2>
              <p className="text-gray-200">
                Preencha o formulário e receba uma análise gratuita em até 24 horas
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Seu nome completo *"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="seu@email.com *"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Nome da sua empresa"
                />
              </div>
              
              <div>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Conte-nos sobre seu projeto ou necessidade... *"
                />
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Proposta Gratuita
                    <Mail className="inline-block ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-300 text-sm mt-4">
              🔒 Seus dados estão seguros conosco
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por Que Escolher Nossos Serviços?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mais de 500 empresas já transformaram seus resultados conosco
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                title: "Resultados Garantidos",
                description: "Metodologia comprovada com mais de 95% de taxa de sucesso em projetos entregues."
              },
              {
                icon: <Star className="w-12 h-12 text-yellow-500" />,
                title: "Atendimento Premium",
                description: "Suporte dedicado e personalizado para cada cliente, com acompanhamento contínuo."
              },
              {
                icon: <ArrowRight className="w-12 h-12 text-blue-500" />,
                title: "Implementação Rápida",
                description: "Começamos a trabalhar imediatamente, com primeiros resultados em até 30 dias."
              }
            ].map((benefit, index) => (
              <motion.div 
                key={index} 
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-6 flex justify-center">{benefit.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Números Que Falam Por Si
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Clientes Atendidos" },
              { number: "95%", label: "Taxa de Sucesso" },
              { number: "24h", label: "Tempo de Resposta" },
              { number: "5 Anos", label: "de Experiência" }
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* WhatsApp CTA Section */}
      {affiliate.whatsapp && (
        <section className="py-20 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Prefere Falar Diretamente?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Clique no botão abaixo e fale conosco agora mesmo pelo WhatsApp. Resposta garantida em minutos!
              </p>
              <motion.button
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white hover:bg-gray-100 text-green-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-2xl flex items-center justify-center mx-auto group"
              >
                <MessageCircle className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                Falar no WhatsApp Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Partner WhatsApp Button */}
      <PartnerWhatsAppButton 
        whatsapp={affiliate.whatsapp || ''} 
        partnerName={affiliate.full_name || undefined}
      />
    </div>
  );
};

export default SalesPage;