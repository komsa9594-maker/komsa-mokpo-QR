const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://mmrcsbpklcekilsoopql.supabase.co', 'sb_publishable_Vypkw4AotfPqmAvyR8W0zQ_8ttwoxlO');

(async () => {
  const { data, error } = await s.from('passenger_survey').delete().eq('ship', 'test ship');
  if (error) console.error('삭제 실패:', error);
  else console.log('test ship 데이터 삭제 완료!');
})();
