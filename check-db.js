const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dppqqundggnieolusvtx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcHFxdW5kZ2duaWVvbHVzdnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQ2MzgsImV4cCI6MjA5MzcxMDYzOH0.PXrtRmylaa-saGmxl7LxORCohwNXc6kReiJCBsizBVw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('blogs').select('*');
  if (error) {
    console.error('Error fetching blogs:', error);
    return;
  }
  console.log('Found blogs:', data.length);
  data.forEach((blog) => {
    console.log('ID:', blog.id);
    console.log('Title:', blog.title);
    console.log('Content Format & Preview:', typeof blog.content, JSON.stringify(blog.content).substring(0, 1000));
  });
}

check();
