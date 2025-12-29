#!/usr/bin/env node
/**
 * Seed script for LocalBzz Agency OS
 * Run with: node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nzicdxgizdnnvmoixfey.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56aWNkeGdpemRubnZtb2l4ZmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjYxNzUsImV4cCI6MjA4MjYwMjE3NX0.PqwCABc_q4PBWTE-yUa22giowHUITeZHXCef-eWPnTA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper for date offsets
const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

async function seed() {
  console.log('🌱 Seeding LocalBzz database...\n')

  // 1. Insert Clients
  console.log('📁 Creating clients...')
  const clients = [
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Sunrise Bakery', status: 'active', client_phase: 'monthly', notes: 'Local bakery chain, 3 locations. Monthly content for all stores.', auto_workflow_enabled: true, default_template_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Peak Fitness Studio', status: 'active', client_phase: 'foundations', notes: 'Boutique gym. Focus on transformation stories and class promos.', auto_workflow_enabled: true, default_template_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Verde Garden Center', status: 'active', client_phase: 'monthly', notes: 'Garden center with seasonal campaigns. Heavy Q2/Q3.', auto_workflow_enabled: false, default_template_id: null },
    { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Coastal Realty Group', status: 'lead', client_phase: 'project', notes: 'Real estate agency interested in property video tours.', auto_workflow_enabled: false, default_template_id: null },
    { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Brew Brothers Coffee', status: 'paused', client_phase: 'monthly', notes: 'Paused for renovation. Resuming March 2025.', auto_workflow_enabled: false, default_template_id: null },
    { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', name: 'TechStart Inc', status: 'churned', client_phase: 'monthly', notes: 'Moved in-house. Good relationship, may return.', auto_workflow_enabled: false, default_template_id: null },
  ]

  const { error: clientError } = await supabase.from('clients').upsert(clients, { onConflict: 'id' })
  if (clientError) {
    console.error('  ❌ Client error:', clientError.message)
  } else {
    console.log(`  ✅ ${clients.length} clients created`)
  }

  // 2. Insert Tasks
  console.log('\n📋 Creating tasks...')
  const tasks = [
    // Sunrise Bakery - healthy client
    { client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'November Content Shoot', task_type: 'shoot', status: 'done', priority: 'normal', due_date: daysFromNow(-30), start_time: daysFromNow(-32), location: 'Main Street Location', notes: 'Holiday prep shots completed' },
    { client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'November Content Edit', task_type: 'deliverable', status: 'done', priority: 'normal', due_date: daysFromNow(-25), notes: 'Delivered 45 assets' },
    { client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'December Content Shoot', task_type: 'shoot', status: 'scheduled', priority: 'normal', due_date: daysFromNow(5), start_time: daysFromNow(5), location: 'All 3 Locations', notes: 'Holiday season shoot - need extra coverage' },
    { client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'December Content Edit', task_type: 'deliverable', status: 'todo', priority: 'normal', due_date: daysFromNow(12) },
    { client_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'January Strategy Meeting', task_type: 'meeting', status: 'todo', priority: 'normal', due_date: daysFromNow(35), start_time: daysFromNow(35), location: 'Zoom', notes: 'Q1 planning session' },

    // Peak Fitness - has critical items
    { client_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Transformation Tuesday Edit', task_type: 'deliverable', status: 'in_progress', priority: 'high', due_date: daysFromNow(-3), notes: 'Client waiting on final edits' },
    { client_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'New Year Promo Shoot', task_type: 'shoot', status: 'todo', priority: 'critical', due_date: daysFromNow(10), start_time: daysFromNow(10), location: 'Main Studio', notes: 'Need to assign photographer ASAP' },
    { client_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Weekly Class Schedule Post', task_type: 'deliverable', status: 'review', priority: 'normal', due_date: daysFromNow(1), notes: 'Waiting for client approval' },
    { client_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'Member Spotlight Interview', task_type: 'meeting', status: 'scheduled', priority: 'normal', due_date: daysFromNow(7), start_time: daysFromNow(7), location: 'Peak Fitness - Room B', notes: 'Interview John D. for testimonial' },

    // Verde Garden Center - ghost client (no recent shoots)
    { client_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Fall Planting Guide Shoot', task_type: 'shoot', status: 'done', priority: 'normal', due_date: daysFromNow(-45), start_time: daysFromNow(-47), location: 'Outdoor Nursery', notes: 'Great weather, got extra B-roll' },
    { client_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Fall Planting Guide Edit', task_type: 'deliverable', status: 'done', priority: 'normal', due_date: daysFromNow(-40), notes: 'Delivered video + 30 stills' },
    { client_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', title: 'Spring Campaign Kickoff', task_type: 'milestone', status: 'todo', priority: 'normal', due_date: daysFromNow(60), notes: 'Plan spring content calendar' },

    // Coastal Realty - lead with opportunity
    { client_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', title: 'Discovery Call', task_type: 'meeting', status: 'done', priority: 'normal', due_date: daysFromNow(-7), start_time: daysFromNow(-7), notes: 'Great call, interested in video tours' },
    { client_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', title: 'Send Proposal', task_type: 'opportunity', status: 'in_progress', priority: 'high', due_date: daysFromNow(2), notes: 'Prepare property video package proposal' },
    { client_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', title: 'Follow-up Call', task_type: 'meeting', status: 'todo', priority: 'normal', due_date: daysFromNow(5), start_time: daysFromNow(5), notes: 'Discuss proposal and close deal' },

    // Brew Brothers - paused
    { client_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', title: 'Renovation Complete Check-in', task_type: 'meeting', status: 'todo', priority: 'normal', due_date: daysFromNow(90), notes: 'Call to discuss resuming services after renovation' },
  ]

  const { error: taskError } = await supabase.from('tasks').insert(tasks)
  if (taskError) {
    console.error('  ❌ Task error:', taskError.message)
  } else {
    console.log(`  ✅ ${tasks.length} tasks created`)
  }

  // Summary
  console.log('\n✨ Seeding complete!\n')
  console.log('Test scenarios ready:')
  console.log('  🚨 Red Flags: 3 items (overdue, unassigned, due soon)')
  console.log('  👻 Ghost Monitor: Verde Garden Center (no shoots in 45+ days)')
  console.log('  🔄 Auto-workflow: Sunrise Bakery, Peak Fitness (Monthly Retainer)')
  console.log('\nRun `npm run dev` to test the app.')
}

seed().catch(console.error)
