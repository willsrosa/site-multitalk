/*
  # [Structural] Create Contacts Table
  This migration creates a new table `contacts` to store messages from the website's contact form.

  ## Query Description:
  - This operation is safe and does not affect existing data.
  - It adds a new table for a new feature.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (by dropping the table)

  ## Structure Details:
  - Table: contacts
  - Columns: id, created_at, name, email, company, message

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (new policies for the `contacts` table)
  - Auth Requirements: Public can insert, authenticated users (service_role) can read.
*/
CREATE TABLE public.contacts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name character varying NOT NULL,
    email character varying NOT NULL,
    company character varying,
    message text NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);

-- Policies for contacts table
CREATE POLICY "Public can insert contact messages" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contacts FOR SELECT USING (auth.role() = 'service_role');
