/* KOINA Supabase Config */
const SUPABASE_URL = 'https://gwwkrkfwbbqziobxremq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-Neb-DYAunyqn780-Qo0Hw_boljiq1-'; // ← paste your sb_publis... key here

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getCurrentUser() {
  const { data: { user } } = await _supabase.auth.getUser();
  return user;
}
async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}
async function signOutUser() {
  await _supabase.auth.signOut();
  window.location.href = 'login.html';
}
    