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
    
    // Categories
    'rice': 'Arroces',
    'noodles': 'Fideos',
    'curries': 'Currys',
    'salads': 'Ensaladas',
    'soups': 'Sopas',
    'desserts': 'Postres',
    'drinks': 'Bebidas',
    'extras': 'Extras',
    
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
    'follow_us': 'Síguenos',
    'contact': 'Contacto',
    'opening_hours': 'Horarios',
    'monday_friday': 'Lunes - Viernes: 12:00 - 15:30, 19:00 - 23:00',
    'saturday_sunday': 'Sábados y Domingos: 12:00 - 23:00',
    'all_rights_reserved': 'Todos los derechos reservados'
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
    
    // Categories
    'rice': 'Rice',
    'noodles': 'Noodles',
    'curries': 'Curries',
    'salads': 'Salads',
    'soups': 'Soups',
    'desserts': 'Desserts',
    'drinks': 'Drinks',
    'extras': 'Extras',
    
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
    'follow_us': 'Follow us',
    'contact': 'Contact',
    'opening_hours': 'Opening hours',
    'monday_friday': 'Monday - Friday: 12:00 - 15:30, 19:00 - 23:00',
    'saturday_sunday': 'Saturday & Sunday: 12:00 - 23:00',
    'all_rights_reserved': 'All rights reserved'
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
    
    // Categories
    'rice': 'Riz',
    'noodles': 'Nouilles',
    'curries': 'Currys',
    'salads': 'Salades',
    'soups': 'Soupes',
    'desserts': 'Desserts',
    'drinks': 'Boissons',
    'extras': 'Extras',
    
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
    'follow_us': 'Suivez-nous',
    'contact': 'Contact',
    'opening_hours': 'Horaires',
    'monday_friday': 'Lundi - Vendredi: 12:00 - 15:30, 19:00 - 23:00',
    'saturday_sunday': 'Samedi et Dimanche: 12:00 - 23:00',
    'all_rights_reserved': 'Tous droits réservés'
  }
};