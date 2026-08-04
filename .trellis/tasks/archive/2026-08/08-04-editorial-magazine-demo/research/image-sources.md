# Magazine image source research

## Decision

Use fixed Unsplash image renditions as research inputs, then embed the downloaded JPEG bytes as `data:image/jpeg;base64,...` in the template. The output document must not retain any remote image URL because the Foliq output renderer intentionally blocks remote resources.

## Selected candidates

1. **Historic bookshelves / dark warm palette**
   - Image rendition: `https://images.unsplash.com/photo-1521587760476-6c12a4b040da`
   - Local research copy: `assets/bookshelves.jpg`
   - Intended use: Page 1 full-width opening image.

2. **Reader portrait / editorial anchor**
   - Image rendition: `https://images.unsplash.com/photo-1544717305-2782549b5136`
   - Local research copy: `assets/reader-portrait.jpg`
   - Intended use: Page 2 portrait feature panel if the file completes and decodes successfully.

3. **Books with large negative space**
   - Image rendition: `https://images.unsplash.com/photo-1516979187457-637abb4f9353`
   - Local research copy: `assets/books-coffee.jpg`
   - Intended use: Page 3 asymmetric full-bleed/caption composition.

4. **Bright modular bookshelf**
   - Image rendition: `https://images.unsplash.com/photo-1524578271613-d550eacf6090`
   - Local research copy: `assets/reading-window.jpg`
   - Intended use: Page 4 recommended-reading strip.

5. **Book stack detail**
   - Image rendition: `https://images.unsplash.com/photo-1512820790803-83ca734da794`
   - Local research copy: `assets/book-detail.jpg`
   - Intended use: optional supporting crop; exclude if the visible English business titles weaken the literary theme.

## Usage and attribution

- Images are sourced from Unsplash and used as embedded editorial demonstration material.
- The template captions should identify `UNSPLASH / EDITORIAL DEMO` and include the fixed rendition identifier.
- Article prose is original and does not reproduce external articles.

## Output constraints discovered

- `packages/export/src/renderer.ts` rejects remote `RoyImage` sources with `REMOTE_RESOURCE_BLOCKED`.
- Every final `RoyImage.propValue.src` therefore needs to begin with `data:image/`.
- Each downloaded candidate must be decoded visually before inclusion; partial network downloads must never enter the final JSON.
