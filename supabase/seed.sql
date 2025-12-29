-- LocalBzz Agency OS - Test Seed Data
-- Run this in Supabase SQL Editor to populate test data

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM tasks;
-- DELETE FROM clients;

-- ==========================================
-- CLIENTS (6 test clients with various statuses)
-- ==========================================

INSERT INTO clients (id, name, status, client_phase, notes, auto_workflow_enabled, default_template_id) VALUES
  -- Active clients (with auto-workflow enabled)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunrise Bakery', 'active', 'monthly', 'Local bakery chain, 3 locations. Monthly content for all stores.', true, '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Peak Fitness Studio', 'active', 'foundations', 'Boutique gym. Focus on transformation stories and class promos.', true, '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Verde Garden Center', 'active', 'monthly', 'Garden center with seasonal campaigns. Heavy Q2/Q3.', false, NULL),

  -- Lead (potential client)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Coastal Realty Group', 'lead', 'project', 'Real estate agency interested in property video tours.', false, NULL),

  -- Paused client
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Brew Brothers Coffee', 'paused', 'monthly', 'Paused for renovation. Resuming March 2025.', false, NULL),

  -- Churned client
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'TechStart Inc', 'churned', 'monthly', 'Moved in-house. Good relationship, may return.', false, NULL);


-- ==========================================
-- TASKS - Sunrise Bakery (Active, healthy client)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes, assigned_to) VALUES
  -- Completed tasks
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'November Content Shoot', 'shoot', 'done', 'normal',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '32 days', 'Main Street Location', 'Holiday prep shots completed', 'placeholder-photographer-id'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'November Content Edit', 'deliverable', 'done', 'normal',
   NOW() - INTERVAL '25 days', NULL, NULL, 'Delivered 45 assets', 'placeholder-editor-id'),

  -- Current month tasks
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'December Content Shoot', 'shoot', 'scheduled', 'normal',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', 'All 3 Locations', 'Holiday season shoot - need extra coverage', 'placeholder-photographer-id'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'December Content Edit', 'deliverable', 'todo', 'normal',
   NOW() + INTERVAL '12 days', NULL, NULL, NULL, 'placeholder-editor-id'),

  -- Future task
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'January Strategy Meeting', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '35 days', NOW() + INTERVAL '35 days', 'Zoom', 'Q1 planning session', 'REPLACE_WITH_YOUR_REAL_USER_ID');


-- ==========================================
-- TASKS - Peak Fitness (Has overdue & critical items)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes, assigned_to) VALUES
  -- OVERDUE! (Critical - will show in Red Flags)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Transformation Tuesday Edit', 'deliverable', 'in_progress', 'high',
   NOW() - INTERVAL '3 days', NULL, NULL, 'Client waiting on final edits', NULL),

  -- UNASSIGNED! (Critical - will show in Red Flags)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'New Year Promo Shoot', 'shoot', 'todo', 'critical',
   NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days', 'Main Studio', 'Need to assign photographer ASAP', NULL),

  -- Due soon (Risk - within 48 hours)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Weekly Class Schedule Post', 'deliverable', 'review', 'normal',
   NOW() + INTERVAL '1 day', NULL, NULL, 'Waiting for client approval', 'placeholder-editor-id'),

  -- Normal upcoming
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Member Spotlight Interview', 'meeting', 'scheduled', 'normal',
   NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', 'Peak Fitness - Room B', 'Interview John D. for testimonial', 'REPLACE_WITH_YOUR_REAL_USER_ID');


-- ==========================================
-- TASKS - Verde Garden Center (Seasonal, some gaps)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes, assigned_to) VALUES
  -- Past completed
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fall Planting Guide Shoot', 'shoot', 'done', 'normal',
   NOW() - INTERVAL '45 days', NOW() - INTERVAL '47 days', 'Outdoor Nursery', 'Great weather, got extra B-roll', 'placeholder-photographer-id'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fall Planting Guide Edit', 'deliverable', 'done', 'normal',
   NOW() - INTERVAL '40 days', NULL, NULL, 'Delivered video + 30 stills', 'placeholder-editor-id'),

  -- Note: No shoots scheduled for 40+ days = will trigger Ghost Monitor!

  -- Future milestone
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Spring Campaign Kickoff', 'milestone', 'todo', 'normal',
   NOW() + INTERVAL '60 days', NULL, NULL, 'Plan spring content calendar', 'REPLACE_WITH_YOUR_REAL_USER_ID');


-- ==========================================
-- TASKS - Coastal Realty (Lead - opportunity tracking)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes, assigned_to) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Discovery Call', 'meeting', 'done', 'normal',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NULL, 'Great call, interested in video tours', 'REPLACE_WITH_YOUR_REAL_USER_ID'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Send Proposal', 'opportunity', 'in_progress', 'high',
   NOW() + INTERVAL '2 days', NULL, NULL, 'Prepare property video package proposal', 'REPLACE_WITH_YOUR_REAL_USER_ID'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Follow-up Call', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', NULL, 'Discuss proposal and close deal', 'REPLACE_WITH_YOUR_REAL_USER_ID');


-- ==========================================
-- TASKS - Brew Brothers (Paused - minimal activity)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes, assigned_to) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Renovation Complete Check-in', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '90 days', NULL, NULL, 'Call to discuss resuming services after renovation', 'REPLACE_WITH_YOUR_REAL_USER_ID');


-- ==========================================
-- SUMMARY OF TEST SCENARIOS
-- ==========================================
--
-- RED FLAGS (Dashboard) should show:
-- 1. "Transformation Tuesday Edit" - OVERDUE (3 days past due)
-- 2. "New Year Promo Shoot" - UNASSIGNED (critical priority, no assigned_to)
-- 3. "Weekly Class Schedule Post" - DUE SOON (within 48 hours)
--
-- GHOST MONITOR should show:
-- 1. Verde Garden Center - No shoots in 45+ days, none scheduled
--
-- AUTO-WORKFLOW enabled for:
-- 1. Sunrise Bakery - Monthly Retainer template
-- 2. Peak Fitness Studio - Monthly Retainer template
--
-- Timeline sorting (ascending) should show:
-- - Overdue items at top
-- - This week's items next
-- - Future items below
