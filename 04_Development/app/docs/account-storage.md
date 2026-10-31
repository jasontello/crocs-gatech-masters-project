# Account storage pilot, October 30, 2026

The prototype offers a separate Supabase account mode alongside browser inventory.
Each account owns a single atomic inventory snapshot, including all fridges and item metadata.
The database uses row level security and only grants authenticated users access to their own row.
The frontend contains only the publishable key. No database password or service role key is used.

Use Create account in the prototype, confirm the email, and sign in. The Supabase dashboard login is separate.
The current default Supabase email service only delivers to project team addresses. Public signup requires a custom SMTP service before launch.
Do not turn off email confirmation to work around this restriction.

Save to account explicitly uploads the current inventory. Refresh from account downloads the latest saved version.
Updates compare the loaded revision so an older browser cannot silently overwrite a newer save.
A conflicting draft stays visible, but must be manually reconciled before refreshing; there is no merge tool.
Account edits are held in memory until saved and are not an offline queue. Browser inventory is never overwritten by account data.
Import is explicit, only offered for a new empty account, and may include demo groceries. Review before saving.
Photos are not uploaded. Household sharing, automatic realtime updates and password recovery UI are future work.

Database setup: supabase/001_inventory.sql. Privacy assertions: supabase/verify_rls.sql.
The assertions use isolated temporary users in a rolled back transaction and check owner access, cross account denial,
anonymous denial and stale revision matching. They are not a substitute for the final real account and two device walkthrough.

Owner walkthrough:
1. Create a CROCS account using the email that owns the Supabase project and a new password.
2. Confirm the email and return to the prototype.
3. Add an item with a date and select Save to account.
4. Sign in on a second device and confirm that the item appears.
5. Edit on one device, save, and refresh on the other.
6. With two older copies, save one then attempt saving the other to check the conflict warning.
