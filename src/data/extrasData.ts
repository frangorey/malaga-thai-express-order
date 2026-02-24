export interface ExtraItem {
  id: string;
  nameKey: string;
  price: number;
  category: 'sauce' | 'complement';
}

export const extraSauces: ExtraItem[] = [
  { id: "extra-soja", nameKey: "extra_soja", price: 1.30, category: "sauce" },
  { id: "extra-ostra", nameKey: "extra_ostra", price: 1.30, category: "sauce" },
  { id: "extra-tamarindo", nameKey: "extra_tamarindo", price: 1.30, category: "sauce" },
  { id: "extra-cacahuete", nameKey: "extra_cacahuete", price: 1.30, category: "sauce" },
  { id: "extra-teriyaki", nameKey: "extra_teriyaki", price: 1.30, category: "sauce" },
  { id: "extra-agridulce", nameKey: "extra_agridulce", price: 1.30, category: "sauce" },
  { id: "extra-siracha", nameKey: "extra_siracha", price: 1.30, category: "sauce" },
  { id: "extra-vinagreta", nameKey: "extra_vinagreta", price: 1.30, category: "sauce" },
  { id: "extra-cesar", nameKey: "extra_cesar", price: 1.30, category: "sauce" },
  { id: "extra-rosa", nameKey: "extra_rosa", price: 1.30, category: "sauce" },
  { id: "extra-fruta", nameKey: "extra_fruta", price: 1.30, category: "sauce" },
  { id: "extra-mayonesa", nameKey: "extra_mayonesa", price: 1.30, category: "sauce" },
  { id: "extra-ketchup", nameKey: "extra_ketchup", price: 1.30, category: "sauce" },
];

export const extraComplements: ExtraItem[] = [
  { id: "extra-arroz-vapor", nameKey: "extra_arroz_vapor", price: 3.30, category: "complement" },
  { id: "extra-arroz-frito-huevo", nameKey: "extra_arroz_frito_huevo", price: 4.30, category: "complement" },
  { id: "extra-arroz-curry-pina", nameKey: "extra_arroz_curry_pina", price: 8.50, category: "complement" },
  { id: "extra-arroz-japones", nameKey: "extra_arroz_japones", price: 4.10, category: "complement" },
  { id: "extra-fruta-variada", nameKey: "extra_fruta_variada", price: 7.50, category: "complement" },
  { id: "extra-mochi", nameKey: "extra_mochi", price: 1.95, category: "complement" },
  { id: "extra-noodles-frito-huevo", nameKey: "extra_noodles_frito_huevo", price: 4.30, category: "complement" },
  { id: "extra-patatas-fritas", nameKey: "extra_patatas_fritas", price: 3.50, category: "complement" },
];

export const allExtras: ExtraItem[] = [...extraSauces, ...extraComplements];
