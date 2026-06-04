export const HOSPITAL = {
  name: "Dr. Keshav's Skin Hair & Aesthetics Hospital",
  tagline: 'Quick, Effective Treatments — Best Care, Best Service',
  experience: '25+ years',
  rating: 4.8,
  reviewCount: 3336,
  phone: '080 2360 3146',
  address:
    '134, 13th A Main Rd, 1st Stage, Gokula 1st Stage, HMT Layout, Mathikere, Bengaluru, Karnataka 560054',
  website: 'drkeshavsskin.com',
  timings: {
    weekdays: '8:45 AM – 2:00 PM | 4:00 PM – 8:00 PM',
    sunday: 'Closed (emergency contact only)',
  },
} as const;

export const DOCTOR = {
  name: 'Dr. Keshav M',
  title: 'Cosmetologist, Dermatologist & Trichologist',
  experience: '25 years',
  qualifications: 'DNB (Vydehi Institute of Medical Sciences, Bangalore)',
  award: 'Best Dermatologist in Bangalore — Merit Awards 2017',
} as const;

export const SERVICES = {
  skin: [
    'Acne & Acne Scar Treatment',
    'Pigmentation / Melasma / Freckles',
    'Chemical Peels & Microdermabrasion',
    'HydraFacial & Oxygen Jet',
    'Skin Polishing',
    'Q-Switch Laser / Picosecond Laser',
    'Fractional CO2 Laser',
    'Eczema, Psoriasis, Fungal Infections',
    'Warts, Moles, DPN, Skin Tags',
    'Vitiligo (Excimer Laser)',
    'Sun Damage / Dull Skin',
    'Stretch Marks & Skin Tightening',
    'Fine Lines & Wrinkles',
    'Pediatric Dermatology',
  ],
  hair: [
    'Hair Loss / Hair Fall Treatment',
    'PRP (Platelet Rich Plasma)',
    'GFC (Growth Factor Concentrate)',
    'LLLT (Low Level Laser Therapy)',
    'Hair Transplant (FUE & FUT)',
    'Hair Bonding',
    'Keratin & Hair Spa',
    'Dandruff / Seborrheic Dermatitis',
    'Male & Female Pattern Baldness',
    'Premature Hair Graying',
  ],
  aesthetic: [
    'Botox & Dermal Fillers',
    'Thread Lift (Non-surgical Facelift)',
    'HIFU',
    'RF Skin Tightening (Microneedling RF)',
    'Microblading',
    'Laser Hair Removal (FDA approved)',
    'Body Contouring',
  ],
  surgery: [
    'Cyst Removal',
    'Ear Lobe Repair',
    'Incision & Excision',
    'Scar Revision',
  ],
} as const;

export const APPOINTMENT_SLOTS = {
  morning: [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
  ],
  afternoon: [
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
  ],
} as const;
