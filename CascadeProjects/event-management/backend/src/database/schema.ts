import { sql } from 'slonik';

export const schema = sql`
  -- Base events table with core fields
  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    capacity INTEGER,
    price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    custom_fields JSONB DEFAULT '{}'
  );

  -- Custom fields metadata table
  CREATE TABLE IF NOT EXISTS event_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    field_name VARCHAR(50) NOT NULL,
    field_type VARCHAR(20) NOT NULL,
    required BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, field_name)
  );

  -- Registrations table with custom fields
  CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Custom fields values for registrations
  CREATE TABLE IF NOT EXISTS registration_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id),
    field_name VARCHAR(50) NOT NULL,
    field_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_id, field_name)
  );

  -- Create function to update event custom fields
  CREATE OR REPLACE FUNCTION update_event_custom_fields(
    p_event_id UUID,
    p_custom_fields JSONB
  ) RETURNS VOID AS $$
  BEGIN
    UPDATE events
    SET custom_fields = p_custom_fields,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_event_id;
  END;
  $$ LANGUAGE plpgsql;

  -- Create function to update registration custom fields
  CREATE OR REPLACE FUNCTION update_registration_custom_fields(
    p_registration_id UUID,
    p_custom_fields JSONB
  ) RETURNS VOID AS $$
  BEGIN
    UPDATE registrations
    SET custom_fields = p_custom_fields,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_registration_id;
  END;
  $$ LANGUAGE plpgsql;

  -- Create function to add new custom field
  CREATE OR REPLACE FUNCTION add_custom_field(
    p_event_id UUID,
    p_field_name VARCHAR(50),
    p_field_type VARCHAR(20),
    p_required BOOLEAN,
    p_description TEXT
  ) RETURNS VOID AS $$
  BEGIN
    INSERT INTO event_custom_fields (event_id, field_name, field_type, required, description)
    VALUES (p_event_id, p_field_name, p_field_type, p_required, p_description);
  END;
  $$ LANGUAGE plpgsql;

  -- Create function to validate custom fields
  CREATE OR REPLACE FUNCTION validate_custom_fields(
    p_event_id UUID,
    p_custom_fields JSONB
  ) RETURNS BOOLEAN AS $$
  DECLARE
    v_required_fields RECORD;
    v_field_value JSONB;
  BEGIN
    FOR v_required_fields IN
      SELECT field_name, field_type
      FROM event_custom_fields
      WHERE event_id = p_event_id AND required = true
    LOOP
      v_field_value := p_custom_fields->>v_required_fields.field_name;
      IF v_field_value IS NULL OR v_field_value = '' THEN
        RETURN false;
      END IF;
    END LOOP;
    RETURN true;
  END;
  $$ LANGUAGE plpgsql;
`;
