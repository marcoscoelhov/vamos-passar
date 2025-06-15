
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function createSignature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return 'sha256=' + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendWebhook(config: any, eventType: string, payload: any, supabase: any) {
  const webhookPayload = {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    data: payload
  }
  
  const payloadString = JSON.stringify(webhookPayload)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'LMS-Webhook/1.0',
    'X-Webhook-Event': eventType,
    'X-Webhook-Source': 'lms-system'
  }
  
  // Add custom headers
  if (config.headers) {
    Object.assign(headers, config.headers)
  }
  
  // Add signature if secret is configured
  if (config.secret_token) {
    headers['X-Webhook-Signature'] = await createSignature(payloadString, config.secret_token)
  }
  
  let attempt = 0
  let lastError = null
  
  while (attempt <= config.retry_count) {
    try {
      console.log(`Sending webhook to ${config.url} (attempt ${attempt + 1})`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), (config.timeout_seconds || 30) * 1000)
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const responseBody = await response.text().catch(() => '')
      
      // Log the webhook attempt
      await supabase.from('webhook_logs').insert({
        webhook_config_id: config.id,
        event_type: eventType,
        payload: webhookPayload,
        status_code: response.status,
        response_body: responseBody,
        retry_attempt: attempt
      })
      
      if (response.ok) {
        console.log(`Webhook sent successfully to ${config.url}`)
        return { success: true, status: response.status }
      } else {
        lastError = `HTTP ${response.status}: ${responseBody}`
        console.error(`Webhook failed with status ${response.status}:`, responseBody)
      }
      
    } catch (error) {
      lastError = error.message
      console.error(`Webhook attempt ${attempt + 1} failed:`, error.message)
      
      // Log the failed attempt
      await supabase.from('webhook_logs').insert({
        webhook_config_id: config.id,
        event_type: eventType,
        payload: webhookPayload,
        status_code: 0,
        error_message: error.message,
        retry_attempt: attempt
      })
    }
    
    attempt++
    
    // Wait before retry (exponential backoff)
    if (attempt <= config.retry_count) {
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s...
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return { success: false, error: lastError }
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
    const { event_type, data, webhook_configs } = await req.json()
    
    if (!event_type || !data) {
      return new Response(JSON.stringify({ error: 'Missing event_type or data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Get active webhook configurations for this event type
    let configs = webhook_configs
    
    if (!configs) {
      const { data: activeConfigs } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('is_active', true)
        .contains('events', [event_type])
      
      configs = activeConfigs || []
    }
    
    if (configs.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active webhooks configured for this event type',
        event_type 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Send webhooks to all configured endpoints
    const results = await Promise.allSettled(
      configs.map((config: any) => sendWebhook(config, event_type, data, supabase))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful
    
    return new Response(JSON.stringify({
      success: true,
      message: `Webhooks sent: ${successful} successful, ${failed} failed`,
      event_type,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook Sender Error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Failed to send webhooks',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
