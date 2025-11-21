-- CreateTable: Add navigation menu relationships to Footer
-- This migration safely adds two new many-to-many relationships for Footer navigation

-- Create join table for Footer column3Menus (many-to-many with NavigationMenu)
CREATE TABLE IF NOT EXISTS "_Footer_column3Menus" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Create join table for Footer column4Menus (many-to-many with NavigationMenu)
CREATE TABLE IF NOT EXISTS "_Footer_column4Menus" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Create unique indexes for the join tables
CREATE UNIQUE INDEX IF NOT EXISTS "_Footer_column3Menus_AB_unique" ON "_Footer_column3Menus"("A", "B");
CREATE INDEX IF NOT EXISTS "_Footer_column3Menus_B_index" ON "_Footer_column3Menus"("B");

CREATE UNIQUE INDEX IF NOT EXISTS "_Footer_column4Menus_AB_unique" ON "_Footer_column4Menus"("A", "B");
CREATE INDEX IF NOT EXISTS "_Footer_column4Menus_B_index" ON "_Footer_column4Menus"("B");

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_Footer_column3Menus_A_fkey'
    ) THEN
        ALTER TABLE "_Footer_column3Menus" ADD CONSTRAINT "_Footer_column3Menus_A_fkey"
            FOREIGN KEY ("A") REFERENCES "Footer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_Footer_column3Menus_B_fkey'
    ) THEN
        ALTER TABLE "_Footer_column3Menus" ADD CONSTRAINT "_Footer_column3Menus_B_fkey"
            FOREIGN KEY ("B") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_Footer_column4Menus_A_fkey'
    ) THEN
        ALTER TABLE "_Footer_column4Menus" ADD CONSTRAINT "_Footer_column4Menus_A_fkey"
            FOREIGN KEY ("A") REFERENCES "Footer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_Footer_column4Menus_B_fkey'
    ) THEN
        ALTER TABLE "_Footer_column4Menus" ADD CONSTRAINT "_Footer_column4Menus_B_fkey"
            FOREIGN KEY ("B") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE "_Footer_column3Menus" IS 'Join table for Footer third column navigation menus';
COMMENT ON TABLE "_Footer_column4Menus" IS 'Join table for Footer fourth column navigation menus';
