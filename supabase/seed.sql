-- LocalBzz Agency OS - Test Seed Data
-- Run this in Supabase SQL Editor to populate test data

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM tasks;
-- DELETE FROM clients;

-- ==========================================
-- CLIENTS (6 test clients with various statuses)
-- ==========================================

INSERT INTO clients (id, name, status, package_tier, notes) VALUES
  -- Active clients
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunrise Bakery', 'active', 'Premium', 'Local bakery chain, 3 locations. Monthly content for all stores.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Peak Fitness Studio', 'active', 'Standard', 'Boutique gym. Focus on transformation stories and class promos.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Verde Garden Center', 'active', 'Premium', 'Garden center with seasonal campaigns. Heavy Q2/Q3.'),

  -- Lead (potential client)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Coastal Realty Group', 'lead', NULL, 'Real estate agency interested in property video tours.'),

  -- Paused client
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Brew Brothers Coffee', 'paused', 'Standard', 'Paused for renovation. Resuming March 2025.'),

  -- Churned client
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'TechStart Inc', 'churned', 'Basic', 'Moved in-house. Good relationship, may return.');


-- ==========================================
-- TASKS - Sunrise Bakery (Active, healthy client)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes) VALUES
  -- Completed tasks
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'November Content Shoot', 'shoot', 'done', 'normal',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '32 days', 'Main Street Location', 'Holiday prep shots completed'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'November Content Edit', 'deliverable', 'done', 'normal',
   NOW() - INTERVAL '25 days', NULL, NULL, 'Delivered 45 assets'),

  -- Current month tasks
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'December Content Shoot', 'shoot', 'scheduled', 'normal',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', 'All 3 Locations', 'Holiday season shoot - need extra coverage'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'December Content Edit', 'deliverable', 'todo', 'normal',
   NOW() + INTERVAL '12 days', NULL, NULL, NULL),

  -- Future task
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'January Strategy Meeting', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '35 days', NOW() + INTERVAL '35 days', 'Zoom', 'Q1 planning session');


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
   NOW() + INTERVAL '1 day', NULL, NULL, 'Waiting for client approval', NULL),

  -- Normal upcoming
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Member Spotlight Interview', 'meeting', 'scheduled', 'normal',
   NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days', 'Peak Fitness - Room B', 'Interview John D. for testimonial');


-- ==========================================
-- TASKS - Verde Garden Center (Seasonal, some gaps)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, location, notes) VALUES
  -- Past completed
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fall Planting Guide Shoot', 'shoot', 'done', 'normal',
   NOW() - INTERVAL '45 days', NOW() - INTERVAL '47 days', 'Outdoor Nursery', 'Great weather, got extra B-roll'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fall Planting Guide Edit', 'deliverable', 'done', 'normal',
   NOW() - INTERVAL '40 days', NULL, NULL, 'Delivered video + 30 stills'),

  -- Note: No shoots scheduled for 40+ days = will trigger Ghost Monitor!

  -- Future milestone
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Spring Campaign Kickoff', 'milestone', 'todo', 'normal',
   NOW() + INTERVAL '60 days', NULL, NULL, 'Plan spring content calendar');


-- ==========================================
-- TASKS - Coastal Realty (Lead - opportunity tracking)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, start_time, notes) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Discovery Call', 'meeting', 'done', 'normal',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'Great call, interested in video tours'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Send Proposal', 'opportunity', 'in_progress', 'high',
   NOW() + INTERVAL '2 days', NULL, 'Prepare property video package proposal'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Follow-up Call', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', 'Discuss proposal and close deal');


-- ==========================================
-- TASKS - Brew Brothers (Paused - minimal activity)
-- ==========================================

INSERT INTO tasks (client_id, title, task_type, status, priority, due_date, notes) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Renovation Complete Check-in', 'meeting', 'todo', 'normal',
   NOW() + INTERVAL '90 days', 'Call to discuss resuming services after renovation');


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
-- Timeline sorting (ascending) should show:
-- - Overdue items at top
-- - This week's items next
-- - Future items below
