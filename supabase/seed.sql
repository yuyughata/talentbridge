-- ===========================================================================
-- Seed data — reference / configuration rows only.
-- ===========================================================================
-- Does NOT create users (those come from auth sign-up / invitation flows).
-- Safe to run repeatedly: uses stable UUIDs + ON CONFLICT DO NOTHING.
-- ===========================================================================

-- TBA operating organisation (§8, §15 Abuja-based operations).
insert into organisations (id, name, type, country, city, verification_status)
values ('00000000-0000-0000-0000-0000000000ba'::uuid, 'Talent Bridge Africa', 'tba', 'Nigeria', 'Abuja', 'verified')
on conflict (id) do nothing;

-- Position-specific development libraries (§5A C).
insert into position_training_templates (position_group, name, focus_points) values
  ('goalkeeper', 'Goalkeeper core library',
    array['handling','footwork','positioning','distribution','communication','decision-making']),
  ('defender', 'Defender core library',
    array['body shape','positioning','scanning','1v1 defending','tackling technique','recovery runs','aerial timing','build-up decisions']),
  ('midfielder', 'Midfielder core library',
    array['scanning','receiving on the half-turn','passing range','press resistance','support angles','transitions','game control']),
  ('winger', 'Winger / wide forward core library',
    array['acceleration','1v1 actions','ball manipulation','crossing/cutbacks','combination play','off-ball movement']),
  ('striker', 'Striker core library',
    array['finishing variety','first touch','movement to create separation','penalty-area positioning','link play','pressing cues'])
on conflict do nothing;

-- Global age-band curriculum templates (§5A A). Academies clone + adapt these.
insert into curriculum_templates (academy_id, name, age_band, focus_summary, is_global) values
  (null, 'Foundation (6–9)', 'u6_9',
    'Enjoyment, ball familiarity, coordination, balance, dribbling, simple passing, movement games and small-sided football. Keep sessions playful, varied and short.', true),
  (null, 'Development (10–12)', 'u10_12',
    'First touch, passing with both feet, dribbling under pressure, receiving and scanning, basic tactical awareness, introductory acceleration mechanics. Game-based learning.', true),
  (null, 'Advanced foundation (13–15)', 'u13_15',
    'Technical execution at speed, scanning and decision-making, positional principles, agility, acceleration, safe movement mechanics and supervised strength foundations.', true),
  (null, 'Performance preparation (16–18)', 'u16_18',
    'Advanced tactical understanding, high-speed technical execution, position-specific demands, progressive supervised S&C, match analysis, recovery, nutrition and professionalism.', true)
on conflict do nothing;
