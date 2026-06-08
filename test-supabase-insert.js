const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://mmrcsbpklcekilsoopql.supabase.co";
const supabaseAnonKey = "sb_publishable_Vypkw4AotfPqmAvyR8W0zQ_8ttwoxlO";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing Supabase Insert...');
  const { data, error } = await supabase
    .from('passenger_survey')
    .insert([{
      satisfaction: 5,
      helpful: 'yes',
      comment: 'test comment',
      ship: 'test ship',
      easy_to_find: null,
      checked: null
    }]);

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert successful!', data);
  }
}

testInsert();
