
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface Database {
  public: {
    Tables: {
      courses: any
      api_keys: any
      api_logs: any
    }
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function validateApiKey(apiKey: string, supabase: any) {
  if (!apiKey) return null
  
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
  const hashHex = Array.from(new Uint8Array(keyHash))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hashHex)
    .eq('is_active', true)
    .single()
  
  if (keyData && (!keyData.expires_at || new Date(keyData.expires_at) > new Date())) {
    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)
    
    return keyData
  }
  
  return null
}

async function logApiCall(supabase: any, apiKeyId: string | null, endpoint: string, method: string, statusCode: number, responseTime: number, req: Request) {
  const userAgent = req.headers.get('user-agent')
  const contentLength = req.headers.get('content-length')
  
  await supabase.from('api_logs').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTime,
    request_size: contentLength ? parseInt(contentLength) : null,
    user_agent: userAgent,
    ip_address: req.headers.get('x-forwarded-for') || 'unknown'
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const url = new URL(req.url)
  const method = req.method
  const endpoint = url.pathname
  
  let statusCode = 200
  let response: any

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)
    
    // Validate API Key
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
    const keyData = await validateApiKey(apiKey || '', supabase)
    
    if (!keyData) {
      statusCode = 401
      response = { error: 'Invalid or missing API key' }
      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check permissions
    const permissions = keyData.permissions || []
    if (!permissions.includes('courses:read') && !permissions.includes('courses:write')) {
      statusCode = 403
      response = { error: 'Insufficient permissions' }
      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const courseId = url.pathname.split('/').pop()
    
    switch (method) {
      case 'GET':
        if (courseId && courseId !== 'api-courses') {
          // Get single course
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()
          
          if (error) {
            statusCode = 404
            response = { error: 'Course not found' }
          } else {
            response = { data }
          }
        } else {
          // Get all courses with pagination
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '10')
          const offset = (page - 1) * limit
          
          const { data, error, count } = await supabase
            .from('courses')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
          
          if (error) {
            statusCode = 500
            response = { error: error.message }
          } else {
            response = {
              data,
              pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil((count || 0) / limit)
              }
            }
          }
        }
        break

      case 'POST':
        if (!permissions.includes('courses:write')) {
          statusCode = 403
          response = { error: 'Write permission required' }
          break
        }
        
        const createData = await req.json()
        const { data: newCourse, error: createError } = await supabase
          .from('courses')
          .insert(createData)
          .select()
          .single()
        
        if (createError) {
          statusCode = 400
          response = { error: createError.message }
        } else {
          statusCode = 201
          response = { data: newCourse }
        }
        break

      case 'PUT':
        if (!permissions.includes('courses:write')) {
          statusCode = 403
          response = { error: 'Write permission required' }
          break
        }
        
        if (!courseId || courseId === 'api-courses') {
          statusCode = 400
          response = { error: 'Course ID required' }
          break
        }
        
        const updateData = await req.json()
        const { data: updatedCourse, error: updateError } = await supabase
          .from('courses')
          .update(updateData)
          .eq('id', courseId)
          .select()
          .single()
        
        if (updateError) {
          statusCode = 400
          response = { error: updateError.message }
        } else {
          response = { data: updatedCourse }
        }
        break

      case 'DELETE':
        if (!permissions.includes('courses:write')) {
          statusCode = 403
          response = { error: 'Write permission required' }
          break
        }
        
        if (!courseId || courseId === 'api-courses') {
          statusCode = 400
          response = { error: 'Course ID required' }
          break
        }
        
        const { error: deleteError } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId)
        
        if (deleteError) {
          statusCode = 400
          response = { error: deleteError.message }
        } else {
          statusCode = 204
          response = null
        }
        break

      default:
        statusCode = 405
        response = { error: 'Method not allowed' }
    }

    // Log the API call
    const responseTime = Date.now() - startTime
    await logApiCall(supabase, keyData.id, endpoint, method, statusCode, responseTime, req)

    return new Response(statusCode === 204 ? null : JSON.stringify(response), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('API Error:', error)
    statusCode = 500
    response = { error: 'Internal server error' }
    
    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
