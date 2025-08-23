/*
          # [Operation Name]
          Create Contacts Table

          ## Query Description: [This operation creates a new table named 'contacts' to store messages submitted through the website's contact form. It includes columns for the sender's name, email, company, the message content, and timestamps. This change is non-destructive and does not affect existing data.]

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Table: contacts
          - Columns: id, name, email, company, message, created_at

          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Public insertion is allowed.

          ## Performance Impact:
          - Indexes: Primary key on 'id'.
          - Triggers: None.
          - Estimated Impact: Low.
          */

-- Create the contacts table
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

-- Add policies for the contacts table
CREATE POLICY "Allow public insert" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read access" ON public.contacts FOR SELECT USING (auth.role() = 'service_role');
