---
name: portrait-prompting
description: "Write and check image-model prompts that put a specific person's face into a picture: face swaps onto a pose or outfit photo, selfies or portraits of a fixed character, and identity reference sheets. Use before calling an image generation or edit tool for any image of a recognisable person."
---

# Portrait prompting

Image models keep a face only as well as the prompt and references let them. Most failed portraits trace back to the same few causes: the model is unsure which image is which, the reference sheet bakes in an expression, the prompt asks for too many things at once, or nobody looked closely at the result. Run the four steps below for every portrait.

## 1. Pick the job

- **Recreate**: a source photo supplies pose, outfit, framing and light; the identity reference supplies the face. Most requests are this.
- **Compose**: no source photo; the prompt describes the scene and the identity reference supplies the face (and a full-body reference supplies height and build when the whole body shows).
- **Fix**: one specific flaw in a finished image (head size, a hand, stray hair).

Done when you can name the job and every image you will send.

## 2. Prepare the inputs

- **Start from the original.** Recreate and compose always start from the untouched source photo. Fix starts from the image being fixed, and only for that single flaw; when a fix fails twice, regenerate from the original instead of stacking edits, since each pass softens detail and lets the face drift.
- **Identity reference.** The best reference is a sheet of one person from the front, three-quarter and profile, with a neutral resting face (lips softly closed, mouth corners level, eyes calmly open), even light and neutral colour. The model copies whatever the sheet shows, including a smile or a pink cast, into every result, so fix the sheet once rather than fighting it in every prompt.
- **Order.** Know the exact order the tool sends images in, including any reference it attaches automatically (often first). The prompt names images by that order.
- **Size.** Match the output aspect ratio to the source photo: portrait for tall photos, landscape for wide ones, square otherwise.
- **Fidelity.** When the edit endpoint offers a high input-fidelity option, turn it on for recreate and fix.

Done when each image has a role and the size matches the source.

## 3. Write the prompt

Fill the slots below, in this order, in plain sentences. Each slot is one or two sentences; skip a slot only when it truly does not apply. Write the target as a positive description of what you want to see. A list of things to avoid pulls those things into the image, so describe the look you want instead ("natural separate hair strands", "skin lit by the warm window light").

1. **Roles.** Which image is edited and which supplies identity. "Image 1 is the photo to edit. Image 2 is an identity reference sheet of one woman; use it for her facial features and eye colour."
2. **Identity.** What to take from the reference: face shape, eyes and eye colour, nose, lips, signature accessories. Say whether hair comes from the reference or stays from the source.
3. **Expression.** Describe the target expression concretely: where the eyes look, how open they are, brows, mouth. "Eyes wide and glancing to the left, lips relaxed and gently pursed, a curious look." Take it from the source photo or from the request, and make it natural for the scene; the reference is for features only.
4. **Head and skeleton.** Lock the source geometry: head position, tilt and turn, jaw and skull in that perspective, neck joining the shoulders naturally, realistic adult head-to-body ratio, hands with five fingers.
5. **Camera.** Viewpoint and lens: eye-level, high or low angle, foreshortening, distance. For compose, choose one and state it.
6. **Light and skin.** Skin follows the scene's light and colour grade (warm film, cool daylight, studio grey), at the brightness the scene implies.
7. **Keep.** Everything else that stays: outfit, props, background, composition, colour grading.
8. **Clean-up.** Remove watermarks or text when needed.

Keep the whole prompt short. One job per call; when colour and face both need work, get the face right first, then correct colour in a separate pass.

Example (recreate):

> Image 1 is the photo to edit. Image 2 is an identity reference sheet of one woman (front, three-quarter, profile); use it for her facial features and green eyes. Replace the face in image 1 with her face and give her long dark brown wavy hair. Her expression: eyes wide and glancing to the left, lips relaxed and gently pursed, a curious innocent look. Keep image 1's head tilt and turn, jaw and skull in perspective, and natural neck and shoulders. Skin follows image 1's warm studio light. Keep the red knitted hood, scarf, cream sweater, raised hands, cheek stickers, background and composition. Remove the watermark.

Done when every applicable slot is filled and the prompt reads as one short paragraph.

## 4. Inspect the result

Generate once, then look before reporting. Crop the face and place it side by side with the source photo and the identity reference, at a size where eyes and lips are clearly visible. Check each item:

- **Likeness**: eye shape and colour, nose, lips and face shape match the reference.
- **Expression**: matches the target from slot 3, and differs from the reference sheet's face.
- **Geometry**: head size against the shoulders, head tilt and turn match the source, neck and jaw look natural.
- **Hands and accessories**: five fingers each, earrings and props in place.
- **Hair**: strands flow in one natural direction from the scalp.
- **Skin and light**: tone matches the scene's light and grade.
- **Whole image**: one consistent style; outfit, background and framing kept.

For each failed item, change the one slot that controls it and regenerate from the original. When the same item fails across prompts, look at the inputs (step 2): a reference sheet that carries the unwanted trait, or the wrong image order.

Done when every item passes, or when you report the specific items that still fail alongside the image.
