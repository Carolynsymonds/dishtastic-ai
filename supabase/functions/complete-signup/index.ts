import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, utmParams, referrerUrl, landingPagePath, leadId } = await req.json()

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Generate a secure random password
    const generateSecurePassword = () => {
      const length = 16;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let password = "";
      
      // Ensure at least one character from each required category
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const special = "!@#$%^&*";
      
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];
      
      // Fill the rest randomly
      for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const generatedPassword = generateSecurePassword();

    // Create the Supabase auth account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true, // Auto-confirm email for smoother UX
    });

    if (authError) {
      console.error('Auth account creation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'No user ID returned from auth creation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update or create lead record with user_id
    if (leadId) {
      const { error: leadUpdateError } = await supabaseAdmin
        .from('leads')
        .update({ 
          user_id: userId,
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (leadUpdateError) {
        console.error('Failed to update lead record:', leadUpdateError);
      }
    } else {
      // Create new lead record
      const { error: leadCreateError } = await supabaseAdmin
        .from('leads')
        .insert({
          email,
          user_id: userId,
          utm_source: utmParams?.utm_source || null,
          utm_medium: utmParams?.utm_medium || null,
          utm_campaign: utmParams?.utm_campaign || null,
          utm_term: utmParams?.utm_term || null,
          utm_content: utmParams?.utm_content || null,
          referrer_url: referrerUrl,
          landing_page_path: landingPagePath,
          status: 'converted',
          converted_at: new Date().toISOString()
        });

      if (leadCreateError) {
        console.error('Failed to create lead record:', leadCreateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Account created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in complete-signup function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})