import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

// Create a client with ANON key (simulating public/client access)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyRLS() {
    console.log('🔒 Starting RLS Verification...');

    // 1. Test Public Access (Should be restricted)
    console.log('\n1. Testing Public Access (Unauthenticated)...');
    const { data: publicData, error: publicError } = await supabase
        .from('clients')
        .select('count');

    if (publicError) {
        console.log('✅ Public access restricted:', publicError.message);
    } else {
        console.warn('⚠️ Public access allowed (Count):', publicData);
    }

    // Note: To fully test RLS for a specific client, we would need to sign in as that client.
    // Since we don't have a programmatic way to generate a client session easily without a password/magic link flow here,
    // we will rely on the fact that public access is blocked as a baseline.
    // The browser test will cover the authenticated client view.

    // 2. Test Documents Bucket Access
    console.log('\n2. Testing Documents Bucket Access (Unauthenticated)...');
    const { data: bucketData, error: bucketError } = await supabase
        .storage
        .from('documents')
        .list();

    if (bucketError) {
        console.log('✅ Bucket access restricted:', bucketError.message);
    } else if (bucketData.length === 0) {
        console.log('✅ Bucket access restricted (Empty list returned, likely RLS policy on select)');
    } else {
        console.warn('⚠️ Bucket access allowed:', bucketData);
    }

    console.log('\n🏁 RLS Verification Complete (Baseline)');
}

verifyRLS();
