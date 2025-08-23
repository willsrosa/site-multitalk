import { createClient } from '@supabase/supabase-js';
import { fakerPT_BR as faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key for client-side script

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or service key is missing. Make sure it is in your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

async function seed() {
  console.log('🌱 Starting database seeding...');

  // 0. Delete all existing posts to ensure a fresh start with Portuguese content
  console.log('🗑️ Deleting all existing posts...');
  const { error: deleteError } = await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
  if (deleteError) {
    console.error('❌ Error deleting existing posts:', deleteError.message);
    return; // Stop if we can't delete
  }
  console.log('✅ Existing posts deleted successfully.');

  // 1. Get existing authors and categories
  const { data: authors } = await supabase.from('authors').select('id');
  const { data: categories } = await supabase.from('categories').select('id');

  if (!authors || !categories) {
    console.error('❌ Could not fetch authors or categories. Please ensure they exist.');
    return;
  }
  
  if (authors.length === 0 || categories.length === 0) {
    console.error('❌ No authors or categories found in the database. Please create them first in your Supabase dashboard or run the initial migration.');
    return;
  }

  console.log(`Found ${authors.length} authors and ${categories.length} categories.`);

  // 2. Generate 40 posts in Portuguese
  const posts = [];
  for (let i = 0; i < 40; i++) {
    const title = faker.lorem.sentence({ min: 5, max: 10 });
    const content = Array.from({ length: faker.number.int({ min: 8, max: 15 }) }, () =>
      faker.lorem.paragraph({ min: 4, max: 7 })
    ).join('\n\n');

    const post = {
      title,
      slug: slugify(title),
      excerpt: faker.lorem.paragraph({ min: 2, max: 3 }),
      content,
      featured_image: `https://picsum.photos/seed/${faker.string.uuid()}/800/600`,
      author_id: faker.helpers.arrayElement(authors).id,
      category_id: faker.helpers.arrayElement(categories).id,
      status: 'published' as const,
      featured: faker.datatype.boolean(0.1), // 10% chance of being featured
      read_time: faker.number.int({ min: 3, max: 15 }),
      published_at: faker.date.past({ years: 1 }),
    };
    posts.push(post);
  }

  console.log(`📝 Generated ${posts.length} posts in Portuguese.`);

  // 3. Insert posts into the database
  const { error } = await supabase.from('posts').insert(posts);

  if (error) {
    console.error('❌ Error inserting posts:', error.message);
  } else {
    console.log('✅ Successfully seeded 40 new posts in Portuguese!');
  }

  console.log('🌱 Seeding finished.');
}

seed().catch(console.error);
