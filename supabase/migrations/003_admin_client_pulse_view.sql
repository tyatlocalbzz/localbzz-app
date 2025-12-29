-- Admin Client Pulse View
-- Shows active clients and their shoot status for the Ghost Monitor widget

CREATE OR REPLACE VIEW admin_client_pulse AS
SELECT
    c.id,
    c.name,
    c.status,
    c.package_tier,
    -- Get the last shoot date
    MAX(t.start_time) as last_shoot_date,
    -- Check if they need a future shoot (True if NO shoot > Now)
    NOT EXISTS (
        SELECT 1 FROM tasks t2
        WHERE t2.client_id = c.id
        AND t2.task_type = 'shoot'
        AND t2.status != 'skipped'
        AND t2.start_time > NOW()
    ) as needs_shoot
FROM clients c
LEFT JOIN tasks t ON c.id = t.client_id AND t.task_type = 'shoot'
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.status, c.package_tier;
