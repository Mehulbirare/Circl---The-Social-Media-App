import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dkgyscayctzelxrnwgyr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ3lzY2F5Y3R6ZWx4cm53Z3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTUzMjMsImV4cCI6MjA5NTI5MTMyM30.D8OT2JqbLFcdsM1Trlyy07BWxMbCKl_WVH8Ic6e7EMM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
