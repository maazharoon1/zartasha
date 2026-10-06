# Zartasha portrait assets

## Cyan and charcoal update

Edited with the built-in `image_gen` tool. Updated production assets: `public/images/zartasha-hero.webp` and `public/images/zartasha-about.webp`. Existing component imports use these assets on the homepage and About page. The generated PNG originals remain in the image tool's output directory. WebP conversion preserves proportions and hero transparency.

### Hero edit prompt

Use case: identity-preserve. Edit the supplied existing website hero cutout. Keep the exact same woman, face, facial features, expression, smile, head tilt, skin tone and texture, hair, jewelry, pose, body proportions, subject size and placement. Do not retouch or reinterpret her face. Change ONLY the cream knitted sweater color to a refined muted cyan matching #6CD0D0, preserving the knit texture, neckline, sleeve details and realistic folds. Preserve natural warm skin with no cyan tint on the face. Clean the cutout edges of colored artifacts. Asset: tall 3:4 transparent website hero portrait, same framing as input, head entirely visible and torso extending to bottom edge. Genuine transparent alpha background, no background scenery or graphic shapes, no text, no logos. This will sit on a cool charcoal #17252B website; use natural photographic lighting. No changes to face or hairstyle.

### About edit prompt

Use case: identity-preserve / compositing. Edit image 1 (existing square About portrait) to match a charcoal and cyan designer portfolio. Image 2 is the newly edited cyan hero portrait, provided for exact matching outfit color. Preserve image 1's exact woman, face, smile, expression, head tilt, facial details, skin tone, hair, jewelry, body pose, photographic texture, size and square crop. Do not redraw or beautify her face. Change ONLY cream sweater to the same muted cyan #6CD0D0 knit as image 2, retaining all knit and sleeve details. Recolor the existing background geometry: off-white base becomes cool charcoal #17252B, olive rectangular panel becomes subdued dark teal #2D4C56, broad ivory foreground arc becomes cyan #6CD0D0, right curved shape becomes #29434D, thin olive curve becomes restrained cyan. Keep existing shapes, their layout, existing portrait framing and margins. Natural warm skin, no cyan cast on face. Photoreal subject, flat editorial graphic background, square image with square corners. No text, no logos, no scenery, no new objects. Face must stay identical to the supplied portrait.

Created with the built-in `image_gen` tool from `ChatGPT Image Oct 6, 2026, 11_58_56 AM.jpg`. These are portrait edits, not portfolio project examples. Original source and generated PNG outputs are preserved. Production WebP copies are optimized without stretching; hero alpha is preserved.

## Hero

Saved asset: `public/images/zartasha-hero.webp` (1000 × 1333, transparent).

Prompt:

> Use case: background-extraction / identity-preserve. Create a production-ready website HERO PORTRAIT asset from this exact supplied photograph of Zartasha Khan. Remove ONLY the room background, desk, plants, picture frames and chair, yielding a genuine transparent alpha background. Keep this exact woman's identity, facial features, natural smile, skin tone, head angle, long dark hair, cream knit sweater, jewelry, body proportions and original pose unchanged. Do not substitute a different woman, change clothing, beautify her face, or invent hands. Preserve realistic hair edges and sweater detail. The reference Arsal hero uses an isolated person layered over typography; this is that same cutout asset treatment using the supplied woman. Composition: a tall centered portrait showing the whole visible subject from the top of her hair to the existing bottom of the sweater, with modest transparent margins around the sides and above her head. No room background, no solid background, no fake checkerboard, no text, no logo, no added objects. Photorealistic, clean natural edges, preserve the original photograph's appearance.

## About

Saved asset: `public/images/zartasha-about.webp` (800 × 800).

Inputs: the original photograph and generated hero cutout.

Prompt:

> Use case: compositing / identity-preserve. Produce ONE square ABOUT portrait asset for Zartasha Khan's warm editorial design portfolio. Image 1 is the original photo and identity source; Image 2 is its isolated portrait cutout to composite. Keep the actual woman's exact face, natural smile, head angle, skin tone, hair and cream knit sweater; use the supplied photographic portrait without reinterpreting or beautifying the face. Crop to a natural chest-up portrait centered in the square, top of her hair entirely visible, shoulders visible, bottom cut at the mid chest. Match the structure of an editorial designer About headshot with layered graphic background: warm ivory #f7f4ed full background, a large muted sage/olive rectangular panel behind her, one broad soft ivory curved arc across the lower left, a second subtle sage curved shape on the right. Clean understated geometry with a very fine restrained curved olive line at the left, similar to a premium designer portfolio portrait. Background entirely studio graphic, no room, no chair, no plants, no desk. Keep image corners square; rounded corners will be applied in the website. Keep the photographic subject in full natural color and realistic texture. No name, no typography, no logos, no experience numbers or badges. Person must match the input exactly; do not change outfit or create a different face. High quality, square composition.
