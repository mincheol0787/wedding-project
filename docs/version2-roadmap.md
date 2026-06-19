# MC Page Version 2 Improvement Plan

## Reference Signals

- The Knot and Zola both keep the public wedding site flow simple: choose a design, add wedding details, publish, then manage RSVP and guest information.
- Modern guest-photo tools such as WedUploader focus on QR/URL based uploads without app installation, which is a strong fit for wedding-day operations.
- MC Page already covers invitation editing, RSVP, guestbook, response management, and async video production. The weak point before V2 was that the video editor still felt like arranging slides, not directing a short wedding film.

## V2 Direction

1. Make the pre-wedding video editor feel like a guided storyboarding tool.
2. Keep invitation editing fast and operational, with response management and public-page sharing as first-class workflows.
3. Prepare for guest photo/video collection through QR codes and public upload links.
4. Keep rendering asynchronous so the SaaS app never blocks while a video is being produced.

## Implemented In This Pass

- Added scene roles to the video editing data model: opening, couple, detail, family, ending.
- Added a V2 director board to the video editor with production readiness, story guidance, and quick navigation.
- Added quality checks for music mood, required photos, story shape, emotional detail, subtitles, and runtime.
- Added scene-role selection in the photo arrangement step.
- Connected scene roles to the Remotion renderer so the generated video copy follows a more intentional film structure.

## Next V2 Priorities

1. Guest photo drop
   - Create a QR/public URL where guests can upload photos and videos without logging in.
   - Add moderation before public display or download.
   - Provide bride/groom download bundles after the event.

2. Invitation operations
   - Add RSVP reminders and segmented guest messages.
   - Add meal, bus, party-side, and memo exports for wedding operations.
   - Add duplicate RSVP detection by phone number.

3. Video quality
   - Add more cinematic templates: documentary, garden film, black-tie editorial.
   - Add beat-based pacing presets.
   - Add safe stock transition assets and title cards.

4. Monetization
   - Free trial watermark and paid export removal.
   - Paid templates and premium guest photo storage.
   - Admin dashboard for template publishing and usage analytics.

## Notes

- Commercial music and copyrighted lyrics must not be bundled. The current presets only use mood-safe demo text and expect user-provided audio when needed.
- SMS and Kakao notifications are planned but not implemented in this pass.
