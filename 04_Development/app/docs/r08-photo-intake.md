# R08 progress: photo reference intake

Date: October 18, 2026

Added a real image selection flow to manual grocery entry. From Scan groceries, choose **Add from a real photo**, then take or choose a JPEG, PNG, or WebP image. Supported mobile browsers can offer the rear camera through the native file picker. A preview supports retaking, replacing, and removing the image. Files above 10 MB and unsupported formats display an error; undecodable images display a recovery message.

The user enters the item details and adds the item to the existing batch. After review and confirmation, the batch is saved to browser inventory. The photo is a temporary reference and is neither uploaded nor persisted. Object URLs are released when replaced or when leaving the form. Automatic recognition remains simulated elsewhere in the app.

Validation: production build and lint; 27 unit tests; automated browser checks at 390px and 1440px covering invalid file rejection, preview, removal, replacement, batch confirmation, and inventory persistence after refresh. Existing browser checks also cover the landing page, responsive layouts, accessibility, and PWA shell. Physical phone camera capture still needs a user check. Automated image selection does not prove hardware camera behavior.

Internal testing uses a repository grocery image, not participant data. No recognition accuracy or food waste outcomes were measured.
