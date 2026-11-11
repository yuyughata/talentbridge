-- ===========================================================================
-- 0014  Player portrait
-- ===========================================================================
-- Player cards and profiles show a portrait (§4 Player cards). Store a reference
-- to the image (a signed Storage URL or provider link); the UI falls back to an
-- initials monogram when absent. Permission-cleared photography only (§4, §2).
-- ===========================================================================

alter table players add column if not exists portrait_url text;
