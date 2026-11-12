-- 0015 — Position-specific overlay ratings (§6 Position-specific overlays).
--
-- Goalkeepers are assessed on a different parameter set from outfield players
-- (shot-stopping, handling, command of area, distribution) rather than on
-- dribbling/finishing/sprinting. We reuse the existing report_position_notes
-- table — intended for overlay attributes — and give each attribute an optional
-- 1–10 rating plus stable keys, so the overlay can be rendered and compared
-- without distorting the seven weighted base categories.

alter table public.report_position_notes
  add column if not exists attribute_key  text,
  add column if not exists group_key      text,
  add column if not exists rating_1_to_10 integer
    check (rating_1_to_10 is null or rating_1_to_10 between 1 and 10);

comment on column public.report_position_notes.attribute_key is
  'Stable key for the overlay attribute, e.g. shot_stopping (goalkeeper).';
comment on column public.report_position_notes.group_key is
  'Overlay group this attribute belongs to: goalkeeper | defender | midfielder | winger | striker.';
comment on column public.report_position_notes.rating_1_to_10 is
  'Optional 1–10 overlay rating; does NOT feed the weighted 0–100 score (§6).';

create index if not exists report_position_notes_report_idx
  on public.report_position_notes (report_id);
