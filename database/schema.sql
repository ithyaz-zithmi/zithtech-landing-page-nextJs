-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255),
    phone_number VARCHAR(50),
    company_email VARCHAR(255),
    industry VARCHAR(255),
    subject TEXT,
    is_partial BOOLEAN DEFAULT FALSE,
    session_id VARCHAR(255),
    status VARCHAR(50),
    action_made VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(company_email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_session_id ON contact_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_partial ON contact_submissions(is_partial);

-- Create unique constraint for upsert on partial submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_submissions_partial_session 
ON contact_submissions(session_id) 
WHERE is_partial = TRUE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create email_clicks table for tracking footer email clicks
CREATE TABLE IF NOT EXISTS email_clicks (
    id SERIAL PRIMARY KEY,
    email_address VARCHAR(255) NOT NULL,
    click_source VARCHAR(100) DEFAULT 'footer',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_clicks_email ON email_clicks(email_address);
CREATE INDEX IF NOT EXISTS idx_email_clicks_created_at ON email_clicks(created_at);

-- Create newsletter_subscriptions table for footer newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    subscription_source VARCHAR(100) DEFAULT 'footer',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email_address);
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscriptions(created_at);


