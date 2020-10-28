-- action queue

CREATE TYPE public.action_queue_status as ENUM ('Scheduled', 'Queued', 'Processing', 'Success', 'Fail');

CREATE TABLE public.action_queue (
    id serial primary key,
    trigger_event integer references public.trigger_queue(id),
    template_id integer references public.template(id),
    sequence integer,
    action_code varchar,
    trigger_payload jsonb,
    parameter_queries jsonb,
    parameters_evaluated jsonb,
    status public.action_queue_status,
    output jsonb,
    time_queued timestamp,
    time_completed timestamp,
    error_log varchar
);

-- Function to Notify Action service of ActionQueue insert
CREATE OR REPLACE FUNCTION public.notify_action_queue()
RETURNS trigger as $action_event$
BEGIN
-- IF NEW.status = 'Queued' THEN
PERFORM pg_notify('action_notifications', json_build_object(
	'id', NEW.id,
	'code', NEW.action_code,
	'trigger_payload', NEW.trigger_payload,
	'parameter_queries', NEW.parameter_queries
	)::text
);
-- END IF;
RETURN NULL;
END;
$action_event$ LANGUAGE plpgsql;


-- TRIGGERS for action_queue 
CREATE TRIGGER action_queue AFTER INSERT ON public.action_queue
FOR EACH ROW
WHEN (NEW.status <> 'Processing')
EXECUTE FUNCTION public.notify_action_queue();


-- TRIGGER (Listener) on application table
-- Note: couldn't put this in application file as it requires the trigger_queue table and function to be defined first
CREATE TRIGGER application_trigger AFTER INSERT OR UPDATE OF trigger ON public.application
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'Processing')
EXECUTE FUNCTION public.add_event_to_trigger_queue();