-- trigger queue

CREATE TYPE public.trigger as ENUM ('onApplicationCreate', 'onApplicationRestart', 'onApplicationSubmit', 'onApplicationSave', 'onApplicationWithdraw', 'onReviewCreate', 'onReviewSubmit', 'onReviewRestart','onReviewStart', 'onReviewAssign', 'onReviewSelfAssign', 'onApprovalSubmit', 'onScheduleTime', 'Processing', 'Error');

CREATE TYPE public.trigger_queue_status as ENUM ('Triggered', 'Actions Dispatched', 'Error');

CREATE TABLE public.trigger_queue (
    id serial primary key,
    trigger_type public.trigger,
    "table" varchar,
    record_id int,
    timestamp timestamptz,
    status public.trigger_queue_status,
    log jsonb
);

-- Function to add triggers to queue
CREATE OR REPLACE FUNCTION public.add_event_to_trigger_queue()
RETURNS trigger as $trigger_queue$
BEGIN
	INSERT INTO trigger_queue (trigger_type, "table", record_id, timestamp, status)
		VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, current_timestamp, 'Triggered');
	EXECUTE format('UPDATE %s SET trigger = ''Processing'' WHERE id = %s', TG_TABLE_NAME, NEW.id);	
RETURN NULL;
END;
$trigger_queue$ LANGUAGE plpgsql;

-- Function to Notify Trigger service of TriggerQueue insert
CREATE OR REPLACE FUNCTION public.notify_trigger_queue()
RETURNS trigger as $trigger_event$
BEGIN
PERFORM pg_notify('trigger_notifications', json_build_object(
	'trigger_id', NEW.id,
	'trigger', NEW.trigger_type,
	'table', NEW.table,
	'record_id', NEW.record_id
	)::text
);	
RETURN NULL;
END;
$trigger_event$ LANGUAGE plpgsql;

-- TRIGGERS for trigger_queue

CREATE TRIGGER trigger_queue AFTER INSERT ON public.trigger_queue
FOR EACH ROW
EXECUTE FUNCTION public.notify_trigger_queue();
