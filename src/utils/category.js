export const categoryIcons = {
  tlac: '🖨️',
  jedlo: '🍴',
  IT: '💻',
  ine: '📦',
  'Kancelárske potreby': '📎',
  'Technické vybavenie': '💻',
};

export const categoryLabels = {
  tlac: 'Tlač',
  jedlo: 'Jedlo',
  IT: 'IT',
  ine: 'Iné',
  'Kancelárske potreby': 'Kancelárske potreby',
  'Technické vybavenie': 'Technické vybavenie',
};

export function getCategoryIcon(key) {
  return categoryIcons[key] ?? '📦';
}

export function getCategoryLabel(key) {
  return categoryLabels[key] ?? key;
}
