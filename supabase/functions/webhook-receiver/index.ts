
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const expectedSignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expectedHex = 'sha256=' + Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  
  return signature === expectedHex
}

async function processWebhookEvent(eventType: string, payload: any, supabase: any) {
  console.log(`Processing webhook event: ${eventType}`)
  
  switch (eventType) {
    case 'student.enrolled':
      // Processar matrícula de estudante
      if (payload.student_id && payload.course_id) {
        await supabase
          .from('course_enrollments')
          .insert({
            user_id: payload.student_id,
            course_id: payload.course_id,
            enrollment_status: 'ativo',
            payment_method: payload.payment_method || 'external',
            amount_paid: payload.amount_paid || 0
          })
      }
      break
      
    case 'student.completed':
      // Marcar curso como concluído
      if (payload.student_id && payload.course_id) {
        await supabase
          .from('course_enrollments')
          .update({
            enrollment_status: 'concluido',
            completed_at: new Date().toISOString()
          })
          .eq('user_id', payload.student_id)
          .eq('course_id', payload.course_id)
      }
      break
      
    case 'payment.confirmed':
      // Confirmar pagamento
      if (payload.enrollment_id) {
        await supabase
          .from('course_enrollments')
          .update({
            enrollment_status: 'ativo',
            amount_paid: payload.amount_paid
          })
          .eq('id', payload.enrollment_id)
      }
      break
      
    case 'user.created':
      // Criar perfil de usuário
      if (payload.user) {
        await supabase
          .from('profiles')
          .insert({
            id: payload.user.id,
            name: payload.user.name,
            email: payload.user.email,
            role: payload.user.role || 'student'
          })
      }
      break
      
    default:
      console.log(`Unhandled event type: ${eventType}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get webhook config based on source or default
    const source = req.headers.get('x-webhook-source') || 'default'
    const payloadText = await req.text()
    const payload = JSON.parse(payloadText)
    
    // Get webhook configuration
    const { data: webhookConfig } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('name', source)
      .eq('is_active', true)
      .single()
    
    // Verify signature if secret is configured
    if (webhookConfig?.secret_token) {
      const signature = req.headers.get('x-webhook-signature') || req.headers.get('x-hub-signature-256')
      
      if (!signature) {
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const isValid = await verifyWebhookSignature(payloadText, signature, webhookConfig.secret_token)
      
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }
    
    // Process the webhook event
    const eventType = payload.event_type || payload.type || 'unknown'
    
    // Log the webhook
    await supabase.from('webhook_logs').insert({
      webhook_config_id: webhookConfig?.id,
      event_type: eventType,
      payload: payload,
      status_code: 200
    })
    
    // Process the event
    await processWebhookEvent(eventType, payload, supabase)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type: eventType
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook Error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process webhook',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
