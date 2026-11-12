# Avatar Studio artwork production — six-milestone implementation

The application now supports a **versioned image-turnaround manifest**, with the existing procedural renderer retained as a safe fallback. This is infrastructure, not completed AAA artwork.

## Artwork production contract

Create neutral, featureless anatomical turnarounds for each of the six existing body builds. Use the user-provided human turnaround photos for proportional reference only; do not copy identifiable people or redistribute the reference images. Keep the same skeletal proportions, camera height, lighting and framing through all angles. Build the neutral pose first, then confident, guarded and relaxed. The manifest requires 48 angles per pose (7.5-degree increments), yielding 1,152 full-body frames.

Place each image under `assets/avatar-art/<build>/<pose>/<angle>.webp`, where angle is zero-padded 00–47. Add `assets/avatar-art/manifest.json` with `{ "version": 1, "frames": { "male-athletic/neutral/00": { "base": "assets/avatar-art/male-athletic/neutral/00.webp" } } }`. An optional `portrait` field on each frame points to a matching crop of the *same character and angle*. Do not fabricate missing angles by copying a neighboring view.

## Quality gates

1. Anatomy reference: verify height, shoulder, waist, hip, knee, elbow, hand and foot landmarks against front, back and both profiles.
2. Pose transfer: preserve limb length, proportions and consistent camera orientation between pose sets.
3. Turnaround: check all 48 images for feature drift, perspective flips, missing limbs and foot contact.
4. Cyberware: until fitted implant overlays exist for the selected build, pose and angle, retain the procedural renderer so installed left/right implants never disappear.
5. Portrait: use the same frame as the full-body image; do not generate an unrelated portrait.
6. Integration: require a complete manifest, browser screenshot comparisons, keyboard and button rotation, mobile memory checks, and clean CI before claiming visual completion.

## Current limitations

No production turnaround image set has been committed. The manifest loader activates only when artwork exists. The current fallback remains the procedural SVG renderer. Existing real-time 3D remains optional in Cyberware Manager; the image pipeline is intended as the eventual primary visual system. An art completeness check must fail for an empty manifest. Do not report 90/100 until visual and browser verification is actually complete.
