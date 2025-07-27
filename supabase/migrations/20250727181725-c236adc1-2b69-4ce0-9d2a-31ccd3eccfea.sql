-- Fix infinite recursion - Step 1: Clean up all existing problematic policies
-- Drop ALL existing policies first to avoid conflicts

-- Drop all user_roles policies completely
DO $$ 
DECLARE 
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_roles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
    END LOOP;
END $$;

-- Drop all leads policies
DO $$ 
DECLARE 
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'leads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
    END LOOP;
END $$;

-- Drop all companies policies
DO $$ 
DECLARE 
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
    END LOOP;
END $$;

-- Drop all buying_mandates policies
DO $$ 
DECLARE 
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'buying_mandates'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
    END LOOP;
END $$;