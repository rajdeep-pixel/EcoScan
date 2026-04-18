export const SEED_REPORTS = [
  { 
    id: 1, lat: 12.8231, lng: 80.0444, severity: 'high', status: 'reported', 
    desc: 'Large illegal dump near main gate', 
    image_data: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400',
    reporter_name: 'Rajdeep Shaw'
  },
  { 
    id: 2, lat: 12.8255, lng: 80.0460, severity: 'medium', status: 'reported', 
    desc: 'Scattered litter on footpath',
    image_data: 'https://images.unsplash.com/photo-1595273670150-db0c2047b582?auto=format&fit=crop&q=80&w=400',
    reporter_name: 'Anonymous'
  },
  { 
    id: 3, lat: 12.8210, lng: 80.0420, severity: 'low', status: 'cleaned', 
    desc: 'Old trash bags cleared yesterday', 
    image_data: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400',
    after_image_data: 'https://images.unsplash.com/photo-1582213713374-2c5f1c3df42d?auto=format&fit=crop&q=80&w=400',
    reporter_name: 'Tulsi',
    volunteer_name: 'Rajdeep Shaw'
  },
  { 
    id: 4, lat: 12.8245, lng: 80.0400, severity: 'high', status: 'in-progress', 
    desc: 'Construction waste blocking drain', 
    image_data: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94?auto=format&fit=crop&q=80&w=400',
    reporter_name: 'Shreyas'
  },
  { 
    id: 5, lat: 12.8198, lng: 80.0470, severity: 'medium', status: 'reported', 
    desc: 'Overflowing bin near bus stop', 
    image_data: 'https://images.unsplash.com/photo-1526951966947-8682c6fe82c8?auto=format&fit=crop&q=80&w=400',
    reporter_name: 'Rajdeep Shaw'
  },
];

export const DEFAULT_CENTER = [12.8231, 80.0444];
export const DEFAULT_ZOOM   = 15;

export const SEVERITY_COLOR = { 
  low: '#00ff44',    // Neon Green
  medium: '#ffcc00', // Bright Amber
  high: '#ff0033'    // Vivid Neon Red
};
