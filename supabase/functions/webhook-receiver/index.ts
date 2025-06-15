
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-kwify-signature',
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

async function processKwifyWebhook(eventType: string, payload: any, supabase: any) {
  console.log(`💰 Processing Kwify webhook event: ${eventType}`)
  console.log('💰 Payload:', JSON.stringify(payload, null, 2))
  
  try {
    const { data: productMapping } = await supabase
      .from('kwify_product_mappings')
      .select('course_id')
      .eq('kwify_product_id', payload.data?.product_id)
      .eq('is_active', true)
      .single()

    if (!productMapping) {
      console.log(`❌ No course mapping found for Kwify product: ${payload.data?.product_id}`)
      return
    }

    const courseId = productMapping.course_id
    const customerData = payload.data?.customer || {}
    const saleData = payload.data || {}

    console.log(`✅ Found course mapping: ${courseId} for product: ${payload.data?.product_id}`)

    switch (eventType) {
      case 'sale.completed':
      case 'payment.approved':
        console.log('💰 Processing sale/payment event...')
        
        // Criar ou buscar usuário
        let userId = null
        
        // Primeiro verificar se já existe um usuário com este email
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerData.email)
          .single()

        if (existingUser) {
          userId = existingUser.id
          console.log(`👤 Found existing user: ${userId}`)
        } else {
          console.log(`👤 Creating new user for: ${customerData.email}`)
          
          // Criar novo usuário através da função de criação
          const { data: newUser, error: userError } = await supabase.functions.invoke('create-user', {
            body: {
              email: customerData.email,
              name: customerData.name || customerData.email.split('@')[0],
              password: Math.random().toString(36).slice(-12), // Senha temporária
              role: 'student'
            }
          })

          if (userError || !newUser) {
            console.error('❌ Error creating user:', userError)
            throw new Error('Failed to create user')
          }
          
          userId = newUser.user.id
          console.log(`✅ Created new user: ${userId}`)
        }

        // Verificar se já existe matrícula
        const { data: existingEnrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .single()

        if (!existingEnrollment) {
          console.log('📝 Creating new enrollment...')
          
          // Criar nova matrícula
          const { error: enrollmentError } = await supabase
            .from('course_enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              enrollment_status: 'ativo',
              payment_method: 'external',
              amount_paid: saleData.amount || 0,
              enrollment_source: 'kwify',
              external_reference: saleData.sale_id || saleData.id,
              enrolled_at: new Date().toISOString()
            })

          if (enrollmentError) {
            console.error('❌ Error creating enrollment:', enrollmentError)
            throw enrollmentError
          }

          console.log(`✅ Successfully enrolled user ${userId} in course ${courseId}`)
        } else {
          console.log('📝 Updating existing enrollment...')
          
          // Atualizar matrícula existente se necessário
          await supabase
            .from('course_enrollments')
            .update({
              enrollment_status: 'ativo',
              amount_paid: saleData.amount || 0,
              external_reference: saleData.sale_id || saleData.id
            })
            .eq('id', existingEnrollment.id)
          
          console.log(`✅ Updated existing enrollment for user ${userId}`)
        }
        break
        
      case 'sale.refunded':
      case 'payment.refunded':
        console.log('🔄 Processing refund event...')
        
        // Cancelar matrícula
        await supabase
          .from('course_enrollments')
          .update({
            enrollment_status: 'cancelado'
          })
          .eq('external_reference', saleData.sale_id || saleData.id)
        
        console.log(`✅ Canceled enrollment for sale: ${saleData.sale_id || saleData.id}`)
        break
        
      default:
        console.log(`❓ Unhandled Kwify event type: ${eventType}`)
    }
  } catch (error) {
    console.error('❌ Error processing Kwify webhook:', error)
    throw error
  }
}

async function processWebhookEvent(eventType: string, payload: any, supabase: any) {
  console.log(`🔄 Processing webhook event: ${eventType}`)
  
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
      console.log(`❓ Unhandled event type: ${eventType}`)
  }
}

serve(async (req) => {
  console.log(`🪝 Webhook received: ${req.method} ${req.url}`)
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const source = req.headers.get('x-webhook-source') || 'default'
    const payloadText = await req.text()
    const payload = JSON.parse(payloadText)
    
    console.log('🪝 Webhook details:', {
      source,
      headers: Object.fromEntries(req.headers.entries()),
      payloadSize: payloadText.length
    })
    console.log('🪝 Payload:', JSON.stringify(payload, null, 2))
    
    // Detectar se é um webhook do Kwify
    const isKwifyWebhook = source === 'kwify' || 
                          req.headers.get('x-kwify-signature') || 
                          payload.source === 'kwify' ||
                          payload.event_type?.startsWith('sale.') ||
                          payload.event_type?.startsWith('payment.')
    
    console.log('💰 Is Kwify webhook?', isKwifyWebhook)
    
    let webhookConfig = null
    
    if (isKwifyWebhook) {
      console.log('🔍 Looking for Kwify webhook config...')
      
      // Buscar configuração específica do Kwify
      const { data } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('name', 'kwify')
        .eq('is_active', true)
        .single()
      
      webhookConfig = data
      console.log('🔍 Kwify config found:', !!webhookConfig)
    } else {
      console.log(`🔍 Looking for webhook config: ${source}`)
      
      // Buscar configuração padrão
      const { data } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('name', source)
        .eq('is_active', true)
        .single()
      
      webhookConfig = data
      console.log('🔍 Config found:', !!webhookConfig)
    }
    
    // Verificar assinatura se configurada
    if (webhookConfig?.secret_token) {
      console.log('🔐 Verifying webhook signature...')
      
      const signature = req.headers.get('x-webhook-signature') || 
                       req.headers.get('x-hub-signature-256') ||
                       req.headers.get('x-kwify-signature')
      
      if (!signature) {
        console.log('❌ Missing signature')
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const isValid = await verifyWebhookSignature(payloadText, signature, webhookConfig.secret_token)
      
      if (!isValid) {
        console.log('❌ Invalid signature')
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      console.log('✅ Signature verified')
    }
    
    const eventType = payload.event_type || payload.type || 'unknown'
    console.log('📝 Event type:', eventType)
    
    // Log do webhook
    console.log('📝 Logging webhook to database...')
    const { data: logData, error: logError } = await supabase.from('webhook_logs').insert({
      webhook_config_id: webhookConfig?.id,
      event_type: eventType,
      payload: payload,
      status_code: 200
    }).select().single()
    
    if (logError) {
      console.error('❌ Error logging webhook:', logError)
    } else {
      console.log('✅ Webhook logged with ID:', logData?.id)
    }
    
    // Processar o evento
    if (isKwifyWebhook) {
      console.log('💰 Processing as Kwify webhook...')
      await processKwifyWebhook(eventType, payload, supabase)
    } else {
      console.log('🔄 Processing as generic webhook...')
      await processWebhookEvent(eventType, payload, supabase)
    }
    
    console.log('✅ Webhook processed successfully')
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      event_type: eventType,
      source: isKwifyWebhook ? 'kwify' : source
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Webhook Error:', error)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Log do erro
    await supabase.from('webhook_logs').insert({
      webhook_config_id: null,
      event_type: 'error',
      payload: { error: error.message },
      status_code: 500,
      error_message: error.message
    })
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process webhook',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
