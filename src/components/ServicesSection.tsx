import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Bot, Mail, BarChart3, Users, Smartphone, Headphones, ArrowRight } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Business API',
      description: 'Integração completa com WhatsApp Business para atendimento profissional e disparo de mensagens em massa.',
      features: ['Mensagens automatizadas', 'Templates certificados', 'Catálogo de produtos'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Bot,
      title: 'IA Conversacional',
      description: 'Chatbots inteligentes que entendem contexto e oferecem respostas personalizadas 24/7.',
      features: ['Processamento de linguagem natural', 'Aprendizado contínuo', 'Integração com CRM'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Phone,
      title: 'Ligações Inteligentes',
      description: 'Sistema de chamadas com IA para qualificação de leads e atendimento automatizado.',
      features: ['Discador automático', 'Gravação de chamadas', 'Análise de sentimento'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Smartphone,
      title: 'SMS Marketing',
      description: 'Envio massivo de SMS com alta taxa de entrega e personalização avançada.',
      features: ['Templates personalizados', 'Agendamento', 'Relatórios detalhados'],
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Mail,
      title: 'E-mail Marketing',
      description: 'Campanhas de e-mail profissionais com automação e segmentação inteligente.',
      features: ['Design responsivo', 'A/B Testing', 'Automação de fluxos'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Dashboards completos com métricas de performance e ROI em tempo real.',
      features: ['Relatórios personalizados', 'KPIs em tempo real', 'Integração com BI'],
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6"
          >
            <Headphones className="w-5 h-5 mr-2" />
            <span className="font-semibold">Soluções Completas</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-heading">
            Nossos{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Serviços
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Soluções completas para comunicação omnichannel que transformam a experiência do cliente
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + featureIndex * 0.1 }}
                      className="flex items-center text-gray-600 dark:text-gray-400"
                    >
                      <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3 group-hover:scale-125 transition-transform duration-300`}></div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <button className="group/btn flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-all duration-300">
                  Saiba mais
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="group bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center mx-auto space-x-3">
            <span>Ver Todos os Serviços</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
