import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Create a new storage bucket for logos if it doesn't exist
const { data: buckets } = await supabase.storage.listBuckets();
const logosBucketExists = buckets?.some(bucket => bucket.name === 'logos');

if (!logosBucketExists) {
  const { error } = await supabase.storage.createBucket('logos', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
  });

  if (error) {
    console.error('Error creating logos bucket:', error);
  } else {
    console.log('Logos bucket created successfully');
  }
}