import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('es');

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('thaii-language') as Language;
    if (savedLanguage && ['es', 'en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('thaii-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations object
const translations = {
  es: {
    // Header
    'cart': 'Carrito',
    'phone': '951 40 19 37',
    'address': 'Plaza de la Solidaridad, 9 - Málaga',
    
    // Hero
    'prepare_to_taste': 'PREPÁRALO',
    'to_your_liking': 'AL GUSTO',
    'choose_what_you_like': 'Escoge lo que más te guste y...',
    'take_it_home': '¡llévátelo a casa!',
    'order_online': 'HACER PEDIDO ONLINE',
    'call_us': 'LLAMAR: 951 40 19 37',
    
    // Main Categories
    'entrantes': 'Entrantes',
    'arroz': 'Arroz', 
    'tallarines': 'Tallarines',
    'sopas': 'Sopas',
    'pokes': 'Pokes',
    'postres': 'Postres',
    'ensaladas': 'Ensaladas',
    'bebidas': 'Bebidas',
    
    // Proteins
    'chicken': 'Pollo',
    'beef': 'Ternera', 
    'pork': 'Cerdo',
    'shrimp': 'Gambas',
    'vegetables': 'Verduras',
    'select_protein': 'Selecciona tu proteína',
    'protein_tab': 'Proteína',
    
    // Sauces
    'teriyaki': 'Teriyaki',
    'sweet_sour': 'Agridulce',
    'curry_sauce': 'Curry',
    'soy_sauce': 'Soja',
    'spicy_sauce': 'Picante',
    'select_sauce': 'Selecciona tu salsa',
    'sauce_tab': 'Salsa',
    'spicy_level': 'Nivel de picante',
    
    // Rice Customizer
    'customize_rice': 'Personaliza tu arroz',
    'selected_items': 'Elementos seleccionados',
    
    // Subcategories
    'classic': 'Classic',
    'yellow_curry': 'Curry Amarillo',
    'green_curry': 'Curry Verde',
    'red_curry': 'Curry Rojo',
    
    // Common
    'price': 'Precio',
    'add_to_cart': 'Añadir al carrito',
    'vegetarian': 'Vegetariano',
    'spicy': 'Picante',
    
    // Cart
    'your_cart': 'Tu carrito',
    'empty_cart': 'Tu carrito está vacío',
    'quantity': 'Cantidad',
    'remove': 'Eliminar',
    'subtotal': 'Subtotal',
    'delivery_fee': 'Gastos de envío',
    'total': 'Total',
    'customer_info': 'Información del cliente',
    'name': 'Nombre',
    'phone_number': 'Teléfono',
    'address_full': 'Dirección completa',
    'notes': 'Notas (opcional)',
    'send_order_whatsapp': 'ENVIAR PEDIDO POR WHATSAPP',
    
    // Dialog
    'doubts_about_dishes': '¿Tienes dudas sobre nuestros platos?',
    'khopi_greeting': '¡Hola! Soy Khopi, la mascota de Thaii Express. Si tienes dudas sobre los ingredientes de algún plato o necesitas ayuda para elegir, ¡llámanos!',
    'see_full_menu': 'VER MENÚ COMPLETO',
    
    // Footer
    'restaurant_description': 'Comida asiática auténtica para llevar. Prepáralo al gusto y llévátelo a casa.',
    'contact_title': 'CONTACTO',
    'hours_title': 'HORARIOS',
    'monday_sunday': 'Lunes - Domingo',
    'hours_time': '12:00 - 23:00',
    'online_orders_available': 'Pedidos online disponibles durante todo el horario de apertura',
    'all_rights_reserved': '© 2024 Thaii Express Málaga. Todos los derechos reservados.',
    'top_sales': 'Lo más vendido',
    
    // Loading and Error states
    'loading_products': 'Cargando productos...',
    'error_loading': 'Error',
    'retry': 'Reintentar',
    'coming_soon': 'Próximamente disponible...',
    
    // Category descriptions
    'starters_description': 'Deliciosos entrantes para comenzar tu experiencia culinaria',
    'noodles_description': 'Tallarines tradicionales asiáticos salteados con verduras frescas',
    'soups_description': 'Sopas reconfortantes con sabores auténticos de la cocina asiática',
    'pokes_description': 'Pokes frescos y saludables con ingredientes de calidad',
    'desserts_description': 'Deliciosos postres para endulzar tu experiencia',
    'salads_description': 'Ensaladas frescas y nutritivas con ingredientes de temporada',
    'drinks_description': 'Refrescantes bebidas para acompañar tu comida',
    
    // Rice Customizer Proteins
    'chicken_protein': 'Pollo',
    'beef_protein': 'Ternera',
    'shrimp_protein': 'Gambas',
    'chicken_beef': 'Pollo y Ternera',
    'chicken_shrimp': 'Pollo y Gambas',
    'beef_shrimp': 'Ternera y Gambas',
    'mix_three': 'Pollo, Ternera y Gambas',
    
    // Rice Customizer Protein Descriptions
    'chicken_desc': 'Tierno pollo marinado',
    'beef_desc': 'Jugosa ternera salteada',
    'shrimp_desc': 'Gambas frescas del mar',
    'chicken_beef_desc': 'Combinación de pollo y ternera',
    'chicken_shrimp_desc': 'Pollo con gambas frescas',
    'beef_shrimp_desc': 'Ternera con gambas del mar',
    'mix_three_desc': 'Combinación completa de proteínas',
    
    // Rice Customizer Sauces
    'classic_sauce': 'Salsa Classic',
    'original_sauce': 'Salsa Original',
    'teriyaki_sauce': 'Salsa Teriyaki',
    'yellow_curry_sauce': 'Curry Amarillo',
    'green_curry_sauce': 'Curry Verde',
    'red_curry_sauce': 'Curry Rojo',
    
    // Rice Customizer Sauce Descriptions
    'classic_sauce_desc': 'Salsa tradicional asiática',
    'original_sauce_desc': 'Nuestra receta especial',
    'teriyaki_sauce_desc': 'Dulce y sabrosa salsa japonesa',
    'yellow_curry_sauce_desc': 'Suave curry amarillo',
    'green_curry_sauce_desc': 'Curry verde medio picante',
    'red_curry_sauce_desc': 'Intenso curry rojo picante',
    
    // Spicy levels
    'medium_spicy': 'Medio picante',
    'spicy_level_high': 'Picante',
    
    // Custom rice creation
    'custom_rice_with': 'Arroz frito con',
    'custom_rice_and': 'y',
    'custom_rice_desc': 'Arroz frito personalizado con'
  },
  
  en: {
    // Header
    'cart': 'Cart',
    'phone': '951 40 19 37',
    'address': 'Plaza de la Solidaridad, 9 - Málaga',
    
    // Hero
    'prepare_to_taste': 'PREPARE IT',
    'to_your_liking': 'TO YOUR TASTE',
    'choose_what_you_like': 'Choose what you like most and...',
    'take_it_home': 'take it home!',
    'order_online': 'ORDER ONLINE',
    'call_us': 'CALL: 951 40 19 37',
    
    // Main Categories
    'entrantes': 'Starters',
    'arroz': 'Rice',
    'tallarines': 'Noodles', 
    'sopas': 'Soups',
    'pokes': 'Pokes',
    'postres': 'Desserts',
    'ensaladas': 'Salads',
    'bebidas': 'Drinks',
    
    // Proteins
    'chicken': 'Chicken',
    'beef': 'Beef',
    'pork': 'Pork', 
    'shrimp': 'Shrimp',
    'vegetables': 'Vegetables',
    'select_protein': 'Select your protein',
    'protein_tab': 'Protein',
    
    // Sauces
    'teriyaki': 'Teriyaki',
    'sweet_sour': 'Sweet & Sour',
    'curry_sauce': 'Curry',
    'soy_sauce': 'Soy Sauce',
    'spicy_sauce': 'Spicy',
    'select_sauce': 'Select your sauce',
    'sauce_tab': 'Sauce',
    'spicy_level': 'Spicy level',
    
    // Rice Customizer
    'customize_rice': 'Customize your rice',
    'selected_items': 'Selected items',
    
    // Subcategories
    'classic': 'Classic',
    'yellow_curry': 'Yellow Curry',
    'green_curry': 'Green Curry',
    'red_curry': 'Red Curry',
    
    // Common
    'price': 'Price',
    'add_to_cart': 'Add to cart',
    'vegetarian': 'Vegetarian',
    'spicy': 'Spicy',
    
    // Cart
    'your_cart': 'Your cart',
    'empty_cart': 'Your cart is empty',
    'quantity': 'Quantity',
    'remove': 'Remove',
    'subtotal': 'Subtotal',
    'delivery_fee': 'Delivery fee',
    'total': 'Total',
    'customer_info': 'Customer information',
    'name': 'Name',
    'phone_number': 'Phone',
    'address_full': 'Full address',
    'notes': 'Notes (optional)',
    'send_order_whatsapp': 'SEND ORDER VIA WHATSAPP',
    
    // Dialog
    'doubts_about_dishes': 'Have questions about our dishes?',
    'khopi_greeting': 'Hello! I\'m Khopi, the Thaii Express mascot. If you have questions about ingredients or need help choosing, call us!',
    'see_full_menu': 'SEE FULL MENU',
    
    // Footer
    'restaurant_description': 'Authentic Asian takeaway food. Prepare it to your taste and take it home.',
    'contact_title': 'CONTACT',
    'hours_title': 'OPENING HOURS',
    'monday_sunday': 'Monday - Sunday',
    'hours_time': '12:00 - 23:00',
    'online_orders_available': 'Online orders available during all opening hours',
    'all_rights_reserved': '© 2024 Thaii Express Málaga. All rights reserved.',
    'top_sales': 'Top Sales',
    
    // Loading and Error states
    'loading_products': 'Loading products...',
    'error_loading': 'Error',
    'retry': 'Retry',
    'coming_soon': 'Coming soon...',
    
    // Category descriptions
    'starters_description': 'Delicious starters to begin your culinary experience',
    'noodles_description': 'Traditional Asian noodles stir-fried with fresh vegetables',
    'soups_description': 'Comforting soups with authentic Asian cuisine flavors',
    'pokes_description': 'Fresh and healthy pokes with quality ingredients',
    'desserts_description': 'Delicious desserts to sweeten your experience',
    'salads_description': 'Fresh and nutritious salads with seasonal ingredients',
    'drinks_description': 'Refreshing drinks to accompany your meal',
    
    // Rice Customizer Proteins
    'chicken_protein': 'Chicken',
    'beef_protein': 'Beef',
    'shrimp_protein': 'Shrimp',
    'chicken_beef': 'Chicken & Beef',
    'chicken_shrimp': 'Chicken & Shrimp',
    'beef_shrimp': 'Beef & Shrimp',
    'mix_three': 'Chicken, Beef & Shrimp',
    
    // Rice Customizer Protein Descriptions
    'chicken_desc': 'Tender marinated chicken',
    'beef_desc': 'Juicy stir-fried beef',
    'shrimp_desc': 'Fresh sea shrimp',
    'chicken_beef_desc': 'Combination of chicken and beef',
    'chicken_shrimp_desc': 'Chicken with fresh shrimp',
    'beef_shrimp_desc': 'Beef with sea shrimp',
    'mix_three_desc': 'Complete protein combination',
    
    // Rice Customizer Sauces
    'classic_sauce': 'Classic Sauce',
    'original_sauce': 'Original Sauce',
    'teriyaki_sauce': 'Teriyaki Sauce',
    'yellow_curry_sauce': 'Yellow Curry',
    'green_curry_sauce': 'Green Curry',
    'red_curry_sauce': 'Red Curry',
    
    // Rice Customizer Sauce Descriptions
    'classic_sauce_desc': 'Traditional Asian sauce',
    'original_sauce_desc': 'Our special recipe',
    'teriyaki_sauce_desc': 'Sweet and savory Japanese sauce',
    'yellow_curry_sauce_desc': 'Mild yellow curry',
    'green_curry_sauce_desc': 'Medium spicy green curry',
    'red_curry_sauce_desc': 'Intense spicy red curry',
    
    // Spicy levels
    'medium_spicy': 'Medium spicy',
    'spicy_level_high': 'Spicy',
    
    // Custom rice creation
    'custom_rice_with': 'Fried rice with',
    'custom_rice_and': 'and',
    'custom_rice_desc': 'Custom fried rice with'
  },
  
  fr: {
    // Header
    'cart': 'Panier',
    'phone': '951 40 19 37',
    'address': 'Plaza de la Solidaridad, 9 - Málaga',
    
    // Hero
    'prepare_to_taste': 'PRÉPAREZ-LE',
    'to_your_liking': 'À VOTRE GOÛT',
    'choose_what_you_like': 'Choisissez ce que vous aimez le plus et...',
    'take_it_home': 'emportez-le chez vous!',
    'order_online': 'COMMANDER EN LIGNE',
    'call_us': 'APPELER: 951 40 19 37',
    
    // Main Categories
    'entrantes': 'Entrées',
    'arroz': 'Riz',
    'tallarines': 'Nouilles',
    'sopas': 'Soupes', 
    'pokes': 'Pokes',
    'postres': 'Desserts',
    'ensaladas': 'Salades',
    'bebidas': 'Boissons',
    
    // Proteins
    'chicken': 'Poulet',
    'beef': 'Bœuf',
    'pork': 'Porc',
    'shrimp': 'Crevettes', 
    'vegetables': 'Légumes',
    'select_protein': 'Sélectionnez votre protéine',
    'protein_tab': 'Protéine',
    
    // Sauces
    'teriyaki': 'Teriyaki',
    'sweet_sour': 'Aigre-douce',
    'curry_sauce': 'Curry',
    'soy_sauce': 'Sauce soja',
    'spicy_sauce': 'Épicée',
    'select_sauce': 'Sélectionnez votre sauce',
    'sauce_tab': 'Sauce',
    'spicy_level': 'Niveau épicé',
    
    // Rice Customizer
    'customize_rice': 'Personnalisez votre riz',
    'selected_items': 'Éléments sélectionnés',
    
    // Subcategories
    'classic': 'Classique',
    'yellow_curry': 'Curry Jaune',
    'green_curry': 'Curry Vert',
    'red_curry': 'Curry Rouge',
    
    // Common
    'price': 'Prix',
    'add_to_cart': 'Ajouter au panier',
    'vegetarian': 'Végétarien',
    'spicy': 'Épicé',
    
    // Cart
    'your_cart': 'Votre panier',
    'empty_cart': 'Votre panier est vide',
    'quantity': 'Quantité',
    'remove': 'Supprimer',
    'subtotal': 'Sous-total',
    'delivery_fee': 'Frais de livraison',
    'total': 'Total',
    'customer_info': 'Informations client',
    'name': 'Nom',
    'phone_number': 'Téléphone',
    'address_full': 'Adresse complète',
    'notes': 'Notes (optionnel)',
    'send_order_whatsapp': 'ENVOYER LA COMMANDE PAR WHATSAPP',
    
    // Dialog
    'doubts_about_dishes': 'Vous avez des questions sur nos plats?',
    'khopi_greeting': 'Bonjour! Je suis Khopi, la mascotte de Thaii Express. Si vous avez des questions sur les ingrédients ou besoin d\'aide pour choisir, appelez-nous!',
    'see_full_menu': 'VOIR LE MENU COMPLET',
    
    // Footer
    'restaurant_description': 'Cuisine asiatique authentique à emporter. Préparez-la à votre goût et emportez-la chez vous.',
    'contact_title': 'CONTACT',
    'hours_title': 'HORAIRES',
    'monday_sunday': 'Lundi - Dimanche',
    'hours_time': '12:00 - 23:00',
    'online_orders_available': 'Commandes en ligne disponibles pendant toutes les heures d\'ouverture',
    'all_rights_reserved': '© 2024 Thaii Express Málaga. Tous droits réservés.',
    'top_sales': 'Meilleures ventes',
    
    // Loading and Error states
    'loading_products': 'Chargement des produits...',
    'error_loading': 'Erreur',
    'retry': 'Réessayer',
    'coming_soon': 'Bientôt disponible...',
    
    // Category descriptions
    'starters_description': 'Délicieuses entrées pour commencer votre expérience culinaire',
    'noodles_description': 'Nouilles asiatiques traditionnelles sautées avec des légumes frais',
    'soups_description': 'Soupes réconfortantes aux saveurs authentiques de la cuisine asiatique',
    'pokes_description': 'Pokes frais et sains avec des ingrédients de qualité',
    'desserts_description': 'Délicieux desserts pour adoucir votre expérience',
    'salads_description': 'Salades fraîches et nutritives avec des ingrédients de saison',
    'drinks_description': 'Boissons rafraîchissantes pour accompagner votre repas',
    
    // Rice Customizer Proteins
    'chicken_protein': 'Poulet',
    'beef_protein': 'Bœuf',
    'shrimp_protein': 'Crevettes',
    'chicken_beef': 'Poulet et Bœuf',
    'chicken_shrimp': 'Poulet et Crevettes',
    'beef_shrimp': 'Bœuf et Crevettes',
    'mix_three': 'Poulet, Bœuf et Crevettes',
    
    // Rice Customizer Protein Descriptions
    'chicken_desc': 'Poulet tendre mariné',
    'beef_desc': 'Bœuf juteux sauté',
    'shrimp_desc': 'Crevettes fraîches de mer',
    'chicken_beef_desc': 'Combinaison de poulet et bœuf',
    'chicken_shrimp_desc': 'Poulet avec crevettes fraîches',
    'beef_shrimp_desc': 'Bœuf avec crevettes de mer',
    'mix_three_desc': 'Combinaison complète de protéines',
    
    // Rice Customizer Sauces
    'classic_sauce': 'Sauce Classique',
    'original_sauce': 'Sauce Originale',
    'teriyaki_sauce': 'Sauce Teriyaki',
    'yellow_curry_sauce': 'Curry Jaune',
    'green_curry_sauce': 'Curry Vert',
    'red_curry_sauce': 'Curry Rouge',
    
    // Rice Customizer Sauce Descriptions
    'classic_sauce_desc': 'Sauce asiatique traditionnelle',
    'original_sauce_desc': 'Notre recette spéciale',
    'teriyaki_sauce_desc': 'Sauce japonaise douce et savoureuse',
    'yellow_curry_sauce_desc': 'Curry jaune doux',
    'green_curry_sauce_desc': 'Curry vert moyennement épicé',
    'red_curry_sauce_desc': 'Curry rouge intense et épicé',
    
    // Spicy levels
    'medium_spicy': 'Moyennement épicé',
    'spicy_level_high': 'Épicé',
    
    // Custom rice creation
    'custom_rice_with': 'Riz frit avec',
    'custom_rice_and': 'et',
    'custom_rice_desc': 'Riz frit personnalisé avec'
  }
};