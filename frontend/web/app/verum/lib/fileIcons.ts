/**
 * Inline SVG data URIs for file icons - ensures they always load without path/network issues.
 * Icons are relevant to file topics but abstract and non-graphic.
 */
const svgs = {
  // Pain Management: descending relief curve with soothing gradient feel
  painManagement: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="pm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4559A7" stop-opacity="0.15"/><stop offset="1" stop-color="#3BB272" stop-opacity="0.25"/></linearGradient></defs><rect width="200" height="200" rx="16" fill="url(#pm)"/><path d="M45 85 C70 100 95 65 130 80 C155 90 165 75 155 95" stroke="#4559A7" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/><path d="M50 110 C90 95 130 105 155 100" stroke="#3BB272" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/><circle cx="135" cy="85" r="6" fill="#4559A7" opacity="0.6"/></svg>`,
  // Feline Endocrine: polished cat face with rounded ears
  felineEndocrine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="fe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F47721" stop-opacity="0.2"/><stop offset="1" stop-color="#F47721" stop-opacity="0.05"/></linearGradient></defs><rect width="200" height="200" rx="16" fill="url(#fe)"/><ellipse cx="100" cy="105" rx="48" ry="42" fill="#F47721" opacity="0.15" stroke="#F47721" stroke-width="2" stroke-opacity="0.4"/><path d="M70 75 Q80 45 95 72 M105 72 Q120 45 130 75" stroke="#F47721" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="88" cy="108" rx="5" ry="7" fill="#F47721" opacity="0.7"/><ellipse cx="112" cy="108" rx="5" ry="7" fill="#F47721" opacity="0.7"/><path d="M85 130 Q100 135 115 130" stroke="#F47721" stroke-width="2" fill="none" opacity="0.5"/><path d="M65 118 Q70 115 75 118 M125 118 Q130 115 135 118" stroke="#F47721" stroke-width="2" fill="none" opacity="0.4"/></svg>`,
  // NSAID Safety: clear capsule with soft glow
  nsaidSafety: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3BB272" stop-opacity="0.2"/><stop offset="1" stop-color="#3BB272" stop-opacity="0.05"/></linearGradient></defs><rect width="200" height="200" rx="16" fill="url(#ns)"/><rect x="60" y="70" width="80" height="60" rx="30" fill="#3BB272" fill-opacity="0.35" stroke="#3BB272" stroke-width="3" stroke-opacity="0.6"/><line x1="75" y1="100" x2="125" y2="100" stroke="#3BB272" stroke-width="2" opacity="0.5"/><ellipse cx="100" cy="100" rx="35" ry="25" fill="none" stroke="#3BB272" stroke-width="2" opacity="0.25"/></svg>`,
  // Renal Guidelines: refined kidney shapes with gradient
  renalGuidelines: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4559A7" stop-opacity="0.2"/><stop offset="1" stop-color="#4559A7" stop-opacity="0.05"/></linearGradient></defs><rect width="200" height="200" rx="16" fill="url(#rg)"/><path d="M75 85 Q50 95 60 125 Q75 115 75 85" fill="#4559A7" fill-opacity="0.25" stroke="#4559A7" stroke-width="2" stroke-opacity="0.5"/><path d="M125 85 Q150 95 140 125 Q125 115 125 85" fill="#4559A7" fill-opacity="0.25" stroke="#4559A7" stroke-width="2" stroke-opacity="0.5"/><path d="M70 95 Q55 105 65 120 M130 95 Q145 105 135 120" stroke="#4559A7" stroke-width="2.5" fill="none" opacity="0.5"/></svg>`,
  // Critical Care: clean heartbeat line with subtle accent
  criticalCare: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="cc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DC2626" stop-opacity="0.15"/><stop offset="1" stop-color="#DC2626" stop-opacity="0.03"/></linearGradient></defs><rect width="200" height="200" rx="16" fill="url(#cc)"/><path d="M35 100 H55 L65 75 L75 100 H95 L105 90 L115 110 L125 100 H160" stroke="#DC2626" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/><circle cx="105" cy="100" r="4" fill="#DC2626" opacity="0.6"/><circle cx="115" cy="100" r="4" fill="#DC2626" opacity="0.6"/></svg>`,
};

function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const FILE_ICONS = {
  painManagement: toDataUri(svgs.painManagement),
  felineEndocrine: toDataUri(svgs.felineEndocrine),
  nsaidSafety: toDataUri(svgs.nsaidSafety),
  renalGuidelines: toDataUri(svgs.renalGuidelines),
  criticalCare: toDataUri(svgs.criticalCare),
};
