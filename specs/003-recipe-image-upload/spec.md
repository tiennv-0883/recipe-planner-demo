# Feature Specification: Recipe Image Upload

**Feature Branch**: `003-recipe-image-upload`  
**Created**: 2026-03-17  
**Status**: Draft  
**Input**: User description: "Allow users to upload images when creating or editing recipes. Images stored in Supabase Storage. Seed recipes updated with real images from Unsplash."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Upload Image When Creating a Recipe (Priority: P1)

When a user creates a new recipe, they can optionally attach an image by selecting a JPEG or PNG file from their device. A preview appears immediately after selection. After saving, the image displays on the recipe card and detail page.

**Why this priority**: This is the core upload flow. Without it, the entire feature delivers no value. All other stories depend on the storage infrastructure this establishes.

**Independent Test**: Create a new recipe, attach a JPEG image under 5 MB, submit the form. Verify the recipe detail page displays the uploaded image. Reload the page — image still shows.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Create Recipe page, **When** they select a valid JPEG or PNG file under 5 MB, **Then** a preview of the image appears in the form before submitting.
2. **Given** a user has selected an image and filled in all required recipe fields, **When** they submit the form, **Then** the recipe is saved and the uploaded image is shown on the recipe detail page.
3. **Given** a recipe with an uploaded image exists, **When** the user reloads the page, **Then** the same image is still displayed.
4. **Given** a user submits the form without selecting any image, **When** the recipe is saved, **Then** the recipe saves successfully and a placeholder image is shown.

---

### User Story 2 — Edit or Replace Image on an Existing Recipe (Priority: P2)

When a user opens the Edit Recipe page, the current image is shown as the active preview. They can replace it with a new file. After saving, the new image is displayed everywhere the recipe appears.

**Why this priority**: Without this, users cannot correct a wrong image after creation.

**Independent Test**: Open Edit Recipe for a recipe that already has an image. Upload a different image. Save. Verify the new image appears on the detail page and the old one is gone.

**Acceptance Scenarios**:

1. **Given** a recipe has an existing image, **When** the user opens the Edit Recipe page, **Then** the current image is displayed as the preview.
2. **Given** a user is editing a recipe, **When** they select a new image file, **Then** the preview updates to the new file before saving.
3. **Given** a user replaces the image and saves, **When** they return to the recipe detail page, **Then** the new image is shown.

---

### User Story 3 — Fallback Placeholder for Recipes Without Images (Priority: P2)

Recipes that have no image display a consistent placeholder graphic so the UI never shows a broken image element.

**Why this priority**: Affects visual quality immediately for all existing recipes in the system.

**Independent Test**: View a recipe that has no `imageUrl` in both the recipe list and detail page. Confirm a placeholder graphic appears in the image area with the same dimensions as a real image.

**Acceptance Scenarios**:

1. **Given** a recipe has no image, **When** it appears in the recipe list, **Then** a placeholder image is shown in the image slot.
2. **Given** a recipe has no image, **When** the recipe detail page is opened, **Then** the placeholder is displayed with consistent dimensions.

---

### User Story 4 — Seed Recipes Display Real Food Photographs (Priority: P3)

The 20 seed recipes that every new user receives are updated with real food photographs sourced from a public image provider, replacing empty or broken `imageUrl` values.

**Why this priority**: Improves first-run visual quality but does not affect core functionality. Deliverable independently by updating URLs in seed data.

**Independent Test**: Register a new account. Verify 20 seed recipes load. Verify each recipe displays a real food photograph without authentication errors.

**Acceptance Scenarios**:

1. **Given** a new user registers and seed recipes are created, **When** they open the recipe list, **Then** every seed recipe shows a real food photograph.
2. **Given** seed recipe images use public URLs, **When** the app loads in any browser, **Then** all images load without CORS or authentication errors.

---

### Edge Cases

- What happens when a user uploads a file larger than 5 MB? → Upload is rejected before any network request; user sees a clear error message stating the 5 MB limit.
- What happens when a user uploads a non-image file (PDF, GIF, HEIC)? → File is rejected; user sees a message stating only JPEG and PNG are accepted.
- What happens if the image uploads successfully but the recipe save fails? → Recipe is not saved; user sees an error and can retry; the uploaded file may be treated as an orphan (cleanup is out of scope for this iteration).
- What happens when the user's connection drops mid-upload? → Upload fails gracefully; user sees an error message; the form stays editable.
- What happens when a previously saved image URL becomes unreachable? → The placeholder is shown automatically.
- What happens when a user deletes a recipe that has an image? → The associated image is removed from storage (handled server-side).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to select a JPEG or PNG image file from their device within the Create Recipe and Edit Recipe forms.
- **FR-002**: A preview of the selected image MUST be displayed within the form immediately after selection, before the recipe is submitted.
- **FR-003**: Files larger than 5 MB MUST be rejected before upload; the user MUST see a clear error message.
- **FR-004**: Files that are not JPEG or PNG MUST be rejected; the user MUST see a clear error message stating accepted formats.
- **FR-005**: On successful recipe save, the image MUST be stored in persistent cloud storage and permanently associated with that recipe.
- **FR-006**: The recipe detail page and recipe card MUST display the uploaded image after the recipe is saved.
- **FR-007**: When a recipe has no image, a placeholder graphic MUST be shown in every location where an image would appear.
- **FR-008**: When editing a recipe that already has an image, the current image MUST be shown as the default preview in the upload area.
- **FR-009**: A user MUST be able to replace an existing recipe image by selecting a new file; after saving, only the new image is shown.
- **FR-010**: Each of the 20 seed recipes MUST have a real food photograph URL assigned; no seed recipe may display a missing or broken image.
- **FR-011**: Image storage MUST be isolated per user — users cannot read or modify images belonging to other users' recipes.

### Key Entities

- **Recipe Image**: A food photograph associated with exactly one recipe. Stored in cloud storage under a path scoped to the owning user. Referenced by URL in the recipe record. Each recipe has at most one image.
- **Recipe**: Existing entity (from spec 001/002). The `imageUrl` field holds either an empty string (no image) or a URL pointing to cloud storage or a public image source.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select, preview, and save a recipe image in under 30 seconds on a standard broadband connection.
- **SC-002**: 100% of the 20 seed recipes display a real food photograph for every newly registered user.
- **SC-003**: 0% of recipe cards or detail pages display a broken image element — all missing images fall back to the placeholder without exception.
- **SC-004**: Files exceeding the size or format constraints are rejected 100% of the time before any upload attempt is made.
- **SC-005**: Uploaded images persist across browser sessions and across devices for the same user account.
- **SC-006**: No user can view or modify another user's recipe images (verified by attempting cross-user storage access).

---

## Assumptions

- Images are stored per-user in a path-scoped cloud storage bucket, with access policies enforced at the storage layer.
- Seed recipe images use stable, publicly accessible URLs from Unsplash — no file upload is needed for seed data; URL assignment is sufficient.
- GIF, HEIC, and WebP formats are out of scope; only JPEG and PNG are supported in this iteration.
- Image resizing or compression is out of scope; the original file is stored as-is within the 5 MB limit.
- Deleting a recipe triggers server-side cleanup of its associated image.
- The `imageUrl` column already exists on the `recipes` table from spec 002; no schema column change is required.
- A new cloud storage bucket (`recipe-images`) and its access policies must be created as part of this feature.
