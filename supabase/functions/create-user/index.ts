
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the requesting user is an admin
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await userSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.error('Not admin:', profileError);
      throw new Error('Insufficient permissions');
    }

    // Parse request body
    const { email, name, role } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Creating user:', { email, name: name || 'Not provided', role });

    // Create user with service role permissions
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: '12345',
      email_confirm: true,
      user_metadata: {
        name: name || email,
      },
    });

    if (createError) {
      console.error('Create user error:', createError);
      if (createError.message.includes('already registered')) {
        throw new Error('Este email já está registrado no sistema');
      }
      throw createError;
    }

    console.log('User created successfully:', authData.user.id);

    // Update profile with additional information
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        name: name || null,
        role: role || 'student',
        must_change_password: true,
        first_login: true,
      })
      .eq('id', authData.user.id);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      // Don't throw here, user was created successfully
    }

    console.log('Profile updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${role === 'professor' ? 'Professor' : 'Aluno'} criado com sucesso`,
        user: authData.user 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
