-- ============================================================================
-- FIND BACK WITH AI - SEED DATA FOR TESTING & DEMONSTRATION
-- ============================================================================

INSERT INTO public.items (
    id, type, title, category, description, image_url, latitude, longitude, location_name, contact_email, contact_phone, status
) VALUES 
(
    'a1111111-1111-4111-a111-111111111111',
    'lost',
    'Brass Keyring with 3 Keys and Blue Tag',
    'Keys',
    'Set of 3 Yale keys attached to a circular brass keyring. Includes one blue engraved plastic tag with the number 402 and a small silver bottle opener attachment.',
    '/items/keys.png',
    37.7749,
    -122.4194,
    'Market Street Subway Station, San Francisco',
    'user.lost1@example.com',
    '+1 (555) 234-5678',
    'active'
),
(
    'a2222222-2222-4222-a222-222222222222',
    'found',
    'Brass Ring with Three Keys and Blue Fob',
    'Keys',
    'Found on the platform bench near the central escalator. Brass ring containing three keys: two house keys, one padlock key, with an azure plastic room tag marked 402.',
    '/items/keys.png',
    37.7752,
    -122.4188,
    'Platform B, Market St Station, San Francisco',
    'finder.station@example.com',
    '+1 (555) 987-6543',
    'active'
),
(
    'b1111111-1111-4111-b111-111111111111',
    'lost',
    'Matte Black Titanium Eyeglasses',
    'Eyewear',
    'Prescription spectacles with rectangular matte titanium frames, thin acetate temples, and anti-reflective coated lenses. Brand etching Oliver Peoples on inner arm.',
    '/items/glasses.png',
    37.7891,
    -122.4014,
    'Ferry Building Coffee Plaza, San Francisco',
    'user.lost2@example.com',
    '+1 (555) 345-6789',
    'active'
),
(
    'b2222222-2222-4222-b222-222222222222',
    'found',
    'Dark Metal Frame Reading Spectacles',
    'Eyewear',
    'Turned in at the information desk. Lightweight dark titanium frame glasses with rectangular shape. High index lenses intact with microfiber pouch.',
    '/items/glasses.png',
    37.7889,
    -122.4018,
    'Ferry Building South Concourse, San Francisco',
    'ferry.lostfound@example.com',
    '+1 (555) 876-5432',
    'active'
),
(
    'c1111111-1111-4111-c111-111111111111',
    'lost',
    'Brown Saddle Leather Bifold Wallet',
    'Wallets',
    'Full grain vegetable tanned leather bifold wallet with contrast cream stitching. Has California driver license and subway transit card inside slot.',
    '/items/wallet.png',
    37.7694,
    -122.4467,
    'Buena Vista Park North Trail, San Francisco',
    'user.lost3@example.com',
    '+1 (555) 456-7890',
    'active'
),
(
    'd1111111-1111-4111-d111-111111111111',
    'found',
    'Midnight Black Series 8 Smartwatch',
    'Electronics',
    'Found on bench near park trail. Aluminum casing with black sports loop band. Screen locked with PIN keypad, battery still charged.',
    '/items/smartwatch.png',
    37.7688,
    -122.4471,
    'Haight & Lyon intersection bench, San Francisco',
    'jogger.alex@example.com',
    '+1 (555) 765-4321',
    'active'
);
