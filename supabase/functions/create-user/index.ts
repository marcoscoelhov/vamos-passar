
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function invoked:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autenticação não fornecido' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client to verify the requesting user
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the requesting user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth verification failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autenticação inválido' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user is admin using service role client
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('is_admin, name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao verificar permissões do usuário' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!profile || !profile.is_admin) {
      console.error('User is not admin:', user.id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não possui permissões de administrador' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    console.log('Admin verified:', profile.name || user.email);

    // Parse request body
    const body = await req.json();
    const { email, name, role } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email provided:', email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email válido é obrigatório' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (role && !['student', 'professor'].includes(role)) {
      console.error('Invalid role provided:', role);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Tipo de usuário inválido' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Creating user:', { email, name: name || 'Not provided', role: role || 'student' });

    // Create user with service role permissions
    const { data: authData, error: createError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password: '12345',
      email_confirm: true,
      user_metadata: {
        name: name || null,
      },
    });

    if (createError) {
      console.error('Create user error:', createError);
      if (createError.message?.includes('already registered') || createError.message?.includes('User already registered')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Este email já está registrado no sistema' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError.message || 'Erro ao criar usuário' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    if (!authData.user) {
      console.error('User creation failed - no user returned');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro interno: usuário não foi criado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('User created successfully:', authData.user.id);

    // Update profile with additional information using service role
    const profileUpdate = {
      name: name || null,
      role: role || 'student',
      must_change_password: true,
      first_login: true,
    };

    const { error: profileUpdateError } = await supabaseServiceRole
      .from('profiles')
      .update(profileUpdate)
      .eq('id', authData.user.id);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      // Don't fail the entire operation if profile update fails
      console.log('User created but profile update failed - user can still login');
    } else {
      console.log('Profile updated successfully');
    }

    const userType = role === 'professor' ? 'Professor' : 'Aluno';
    console.log(`${userType} created successfully:`, authData.user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${userType} criado com sucesso! Senha padrão: 12345`,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role || 'student'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Unexpected error in function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
