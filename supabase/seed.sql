-- ═══════════════════════════════════════════════════════════
-- LeveeUp Seed Data — Shop Inventory
-- ═══════════════════════════════════════════════════════════

insert into public.shop_inventory (theme_id, item_name, item_type, cost_xp, asset_reference) values
  -- Hats (head slot)
  ('cryptid', 'Explorer Hat',           'hat',        500,  '/assets/shop/hat-explorer.svg'),
  ('cryptid', 'Detective Cap',          'hat',        1500, '/assets/shop/hat-explorer.svg'),
  ('cryptid', 'Cryptid Crown',          'hat',        6000, '/assets/shop/hat-explorer.svg'),
  ('cryptid', 'Swamp Tracker Cap',      'hat',        800,  '/assets/shop/hat-explorer.svg'),

  -- Binoculars / Optics (eyes slot)
  ('cryptid', 'Field Binoculars',       'binoculars', 600,  '/assets/shop/binoculars.svg'),
  ('cryptid', 'Night Vision Goggles',   'binoculars', 2500, '/assets/shop/binoculars.svg'),
  ('cryptid', 'Thermal Scope',          'binoculars', 5000, '/assets/shop/binoculars.svg'),

  -- Vests (body slot)
  ('cryptid', 'Field Vest',             'vest',       700,  '/assets/shop/vest-field.svg'),
  ('cryptid', 'Camo Vest',              'vest',       2000, '/assets/shop/vest-field.svg'),
  ('cryptid', 'Master Investigator Coat','vest',      8000, '/assets/shop/vest-field.svg'),

  -- Flashlights (hand slot)
  ('cryptid', 'Trusty Flashlight',      'flashlight', 500,  '/assets/shop/flashlight.svg'),
  ('cryptid', 'UV Blacklight',          'flashlight', 1800, '/assets/shop/flashlight.svg'),
  ('cryptid', 'Cryptid Lantern',        'flashlight', 4500, '/assets/shop/flashlight.svg'),

  -- Journals (no equip slot)
  ('cryptid', 'Leather Journal',        'journal',    600,  '/assets/shop/journal-cover.svg'),
  ('cryptid', 'Ancient Tome',           'journal',    4000, '/assets/shop/journal-cover.svg'),
  ('cryptid', 'Waterproof Notebook',    'journal',    1200, '/assets/shop/journal-cover.svg'),

  -- Stickers (no equip slot)
  ('cryptid', 'Paw Print Sticker',      'sticker',    500,  '/assets/shop/sticker-paw.svg'),
  ('cryptid', 'Glowing Eye Sticker',    'sticker',    750,  '/assets/shop/sticker-paw.svg'),
  ('cryptid', 'Nessie Scale Sticker',   'sticker',    1500, '/assets/shop/sticker-paw.svg'),
  ('cryptid', 'Thunderbird Feather',    'sticker',    4000, '/assets/shop/sticker-paw.svg'),

  -- Accessories / Badges (accessory slot)
  ('cryptid', 'Junior Investigator Badge',  'accessory', 500,  '/assets/shop/sticker-paw.svg'),
  ('cryptid', 'Senior Investigator Badge',  'accessory', 2000, '/assets/shop/sticker-paw.svg'),
  ('cryptid', 'Master Investigator Badge',  'accessory', 7000, '/assets/shop/sticker-paw.svg');
