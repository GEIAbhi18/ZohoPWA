import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load environment variables from .env manually
const envFile = fs.readFileSync('.env', 'utf-8')
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    process.env[match[1]] = match[2].trim()
  }
})

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  console.log('Fetching recent approved POs with empty signature_url...')
  
  // Find approved POs
  const { data, error } = await supabase
    .from('purchase_orders_for_approval')
    .select('id, order_id, status, updated_at')
    .eq('status', 'Approved')
    .is('signature_url', null)
    .order('updated_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error('Error fetching data:', error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('No recent approved requests found with empty signature.')
    return
  }
  
  console.log('Found the following requests to reset:')
  console.log(data)
  
  const ids = data.map(row => row.id)
  
  console.log('Resetting these requests to Pending...')
  
  const { error: updateError } = await supabase
    .from('purchase_orders_for_approval')
    .update({
      status: 'Pending',
      reference_number: null,
      billing_address: null,
      advance_amount: null,
      approval_comments: null,
      approval_terms_conditions: null,
      attachment_url: null,
      signature_url: null,
      approved_by: null,
      approved_at: null
    })
    .in('id', ids)
    
  if (updateError) {
    console.error('Error updating records:', updateError)
  } else {
    console.log('Successfully reset the records!')
  }
}

run()
