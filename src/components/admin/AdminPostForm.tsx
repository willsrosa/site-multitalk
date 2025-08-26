import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase, Category, Author } from '../../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  featured_image?: string | null;
  read_time: number;
  featured: boolean;
};

const schema: yup.ObjectSchema<FormData> = yup.object().shape({
  title: yup.string().required('O título é obrigatório'),
  slug: yup.string().required('O slug é obrigatório').matches(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hifens'),
  excerpt: yup.string().required('O resumo é obrigatório').max(300, 'Máximo de 300 caracteres'),
  content: yup.string().required('O conteúdo é obrigatório'),
  category_id: yup.string().required('A categoria é obrigatória'),
  author_id: yup.string().required('O autor é obrigatório'),
  status: yup.mixed<'draft' | 'published' | 'archived'>().oneOf(['draft', 'published', 'archived']).required('O status é obrigatório'),
  featured_image: yup.string().nullable().notRequired().transform((value) => value === '' ? null : value),
  read_time: yup.number().required('O tempo de leitura é obrigatório').min(1, 'Deve ser no mínimo 1'),
  featured: yup.boolean().required(),
}) as yup.ObjectSchema<FormData>;

const AdminPostForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { control, handleSubmit, register, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category_id: '',
      author_id: '',
      status: 'draft' as const,
      featured_image: null,
      read_time: 5,
      featured: false,
    }
  });

  const titleValue = watch('title');

  useEffect(() => {
    if (titleValue && !id) {
      const newSlug = titleValue
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setValue('slug', newSlug);
    }
  }, [titleValue, id, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('authors').select('*')
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (authorsRes.error) throw authorsRes.error;

        setCategories(categoriesRes.data || []);
        setAuthors(authorsRes.data || []);

        if (id) {
          const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

          if (postError) throw postError;

          if (postData) {
            Object.keys(postData).forEach((key) => {
              // @ts-ignore
              if (key in control._defaultValues) {
                // @ts-ignore
                setValue(key, postData[key]);
              }
            });
            setImagePreview(postData.featured_image || '');
          }
        }
      } catch (error) {
        toast.error('Erro ao carregar dados para o formulário.');
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [id, setValue, control]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingImage(true);
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      // Upload para o bucket 'arquivos'
      const { error } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file);

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath);

      // Atualizar o formulário e preview
      setValue('featured_image', publicUrl);
      setImagePreview(publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setValue('featured_image', null);
    setImagePreview('');
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const postData = {
        ...data,
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditMode) {
        const { error } = await supabase.from('posts').update(postData).eq('id', id!);
        if (error) throw error;
        toast.success('Post atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('posts').insert([postData]);
        if (error) throw error;
        toast.success('Post criado com sucesso!');
      }
      navigate('/admin/posts');
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando formulário...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200";

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/admin/posts" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Posts
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
              {isEditMode ? 'Editar Post' : 'Criar Novo Post'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título</label>
                <input {...register('title')} id="title" className={inputClass} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                <input {...register('slug')} id="slug" className={`${inputClass} bg-gray-100 dark:bg-gray-900`} readOnly />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resumo</label>
              <textarea {...register('excerpt')} id="excerpt" rows={3} className={inputClass}></textarea>
              {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Conteúdo (Markdown)</label>
              <textarea {...register('content')} id="content" rows={10} className={`${inputClass} font-mono`}></textarea>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Imagem de Destaque</label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-2 ${uploadingImage ? 'opacity-50' : ''}`}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage ? 'Enviando...' : 'Clique para enviar uma imagem'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF até 5MB
                    </span>
                  </label>
                </div>
              )}

              {errors.featured_image && <p className="text-red-500 text-sm mt-1">{errors.featured_image.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                <select {...register('category_id')} id="category_id" className={inputClass}>
                  <option value="">Selecione...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
              </div>
              <div>
                <label htmlFor="author_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Autor</label>
                <select {...register('author_id')} id="author_id" className={inputClass}>
                  <option value="">Selecione...</option>
                  {authors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}
                </select>
                {errors.author_id && <p className="text-red-500 text-sm mt-1">{errors.author_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select {...register('status')} id="status" className={inputClass}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
              </div>
              <div>
                <label htmlFor="read_time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tempo de Leitura (min)</label>
                <input {...register('read_time')} id="read_time" type="number" className={inputClass} />
                {errors.read_time && <p className="text-red-500 text-sm mt-1">{errors.read_time.message}</p>}
              </div>
              <div className="flex items-center pb-2">
                <label htmlFor="featured" className="flex items-center space-x-2 cursor-pointer">
                  <input {...register('featured')} id="featured" type="checkbox" className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Destaque?</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                {isEditMode ? 'Salvar Alterações' : 'Publicar Post'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPostForm;
