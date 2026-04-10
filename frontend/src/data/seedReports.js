// Dummy seed reports — centred around SRMIST Kattankulathur (12.8231, 80.0444)
export const SEED_REPORTS = [
  { id: 1, lat: 12.8231, lng: 80.0444, severity: 'high',   status: 'reported',    desc: 'Large illegal dump near main gate', photo: null },
  { id: 2, lat: 12.8255, lng: 80.0460, severity: 'medium', status: 'reported',    desc: 'Scattered litter on footpath',       photo: null },
  { id: 3, lat: 12.8210, lng: 80.0420, severity: 'low',    status: 'cleaned',     desc: 'Old trash bags cleared yesterday',   photo: null },
  { id: 4, lat: 12.8245, lng: 80.0400, severity: 'high',   status: 'in-progress', desc: 'Construction waste blocking drain',  photo: null },
  { id: 5, lat: 12.8198, lng: 80.0470, severity: 'medium', status: 'reported',    desc: 'Overflowing bin near bus stop',      photo: null },
];

export const DEFAULT_CENTER = [12.8231, 80.0444];
export const DEFAULT_ZOOM   = 15;

export const SEVERITY_COLOR = { low: '#22c55e', medium: '#f97316', high: '#ef4444' };
