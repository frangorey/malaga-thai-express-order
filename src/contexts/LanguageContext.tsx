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
     
     // Auth
     'auth_title': 'Iniciar Sesión en Thaii Express',
     'login': 'Iniciar Sesión',
     'signup': 'Registrarse',
     'email': 'Correo Electrónico',
     'password': 'Contraseña',
     'loading': 'Cargando...',
     'login_success': '¡Inicio de Sesión Exitoso!',
     'signup_success': '¡Cuenta Creada!',
     'check_email_confirmation': 'Por favor revisa tu correo para confirmar tu cuenta.',
     'logout': 'Cerrar Sesión',
     
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
    'rice_customizer_title': 'Personaliza tu Arroz',
    'rice_customizer_description': 'Selecciona tu proteína y salsa favorita para crear tu plato perfecto',
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
    'custom_rice_desc': 'Arroz frito personalizado con',

    // Noodle types
    'noodle_finos': 'Finos (Noodles)',
    'noodle_anchos': 'Anchos (Pad Thai)',
    'noodle_glass': 'Glass',
    'noodle_udon': 'Udon',
    'noodle_finos_desc': 'Tallarines finos tradicionales',
    'noodle_anchos_desc': 'Tallarines anchos estilo Pad Thai',
    'noodle_glass_desc': 'Tallarines transparentes de arroz',
    'noodle_udon_desc': 'Tallarines gruesos japoneses',

    // Noodle customizer
    'noodle_customizer_title': 'PERSONALIZA TUS TALLARINES',
    'noodle_customizer_description': 'Elige el tipo de tallarín, tu proteína favorita y la salsa perfecta',
    'step_noodle_type': 'Tipo de Tallarín',
    'step_protein': 'Proteína',
    'step_sauce': 'Salsa',
    'noodle_type': 'Tipo de tallarín',
    'custom_noodles_with': 'Tallarines personalizados con',
    'custom_noodles_and': 'y',
    'custom_noodles_desc': 'Tallarines salteados al wok con',
    'custom_noodles_with_sauce': 'con salsa',
    'order_summary': 'Resumen del pedido',
    'protein': 'Proteína',
    'sauce': 'Salsa',
    
    // Extra vegetables
    'extra_vegetables': 'Verduras Adicionales',
    'extra_vegetables_optional': 'Verduras Adicionales (Opcional)',
    'extra_vegetables_desc': 'Selecciona las verduras extra que desees añadir a tu plato',
    'extra_vegetables_label': 'Verduras extra',
    'step_vegetables': 'Verduras Extra',
    
    // Vegetable names
    'veg_egg': 'Huevo',
    'veg_cilantro': 'Cilantro',
    'veg_basil': 'Albahaca',
    'veg_bean_sprouts': 'Brotes de Soja',
    'veg_red_onion': 'Cebolla roja',
    'veg_corn': 'Maíz',
    'veg_green_beans': 'Judía Verde',
    'veg_carrot': 'Zanahoria',
    'veg_peanut': 'Cacahuete',
    'veg_broccoli': 'Brócoli',
    'veg_scallion': 'Cebolleta',
    'veg_mushroom': 'Champiñones',
    'veg_pepper': 'Pimiento',

    // Enhanced protein translations
    'protein_chicken': 'Pollo',
    'protein_beef': 'Ternera',
    'protein_shrimp': 'Gambas',
    'protein_chicken_desc': 'Pechuga de pollo fresca y tierna',
    'protein_beef_desc': 'Tierna ternera de primera calidad',
    'protein_shrimp_desc': 'Gambas frescas del mar',
    'protein_chicken_beef': 'Pollo y Ternera',
    'protein_chicken_shrimp': 'Pollo y Gambas',
    'protein_beef_shrimp': 'Ternera y Gambas',
    'protein_chicken_beef_shrimp': 'Pollo, Ternera y Gambas',
    'protein_chicken_beef_desc': 'Combinación perfecta de pollo y ternera',
    'protein_chicken_shrimp_desc': 'Deliciosa mezcla de pollo y gambas',
    'protein_beef_shrimp_desc': 'Exquisita combinación de ternera y gambas',
    'protein_chicken_beef_shrimp_desc': 'Triple proteína: pollo, ternera y gambas',

    // Enhanced sauce translations
    'sauce_classic': 'Classic',
    'sauce_original': 'Original',
    'sauce_teriyaki': 'Teriyaki',
    'sauce_classic_desc': 'Salsa soja y ostras',
    'sauce_original_desc': 'Cilantro, brotes de soja, zanahoria, cacahuete, salsa tamarindo y lima',
    'sauce_teriyaki_desc': 'Salsa teriyaki tradicional',
    
    // Entrantes translations - Spanish (names and descriptions)
    'panko_chicken': 'Panko pollo (5 unidades)',
    'panko_chicken_desc': 'Crujientes trozos de pollo empanados en panko japonés',
    'panko_shrimp': 'Panko langostino (5 unidades)',
    'panko_shrimp_desc': 'Langostinos empanados en panko crujiente',
    'chicken_skewer_1': 'Pinchito de pollo (1 unidad)',
    'chicken_skewer_1_desc': 'Pincho de pollo marinado a la plancha',
    'chicken_skewer_2': 'Pinchito de pollo (2 unidades)',
    'chicken_skewer_2_desc': 'Dos pinchos de pollo marinado a la plancha',
    'shrimp_skewer_1': 'Pinchito de langostino (1 unidad)',
    'shrimp_skewer_1_desc': 'Pincho de langostino fresco a la plancha',
    'shrimp_skewer_2': 'Pinchito de langostino (2 unidades)',
    'shrimp_skewer_2_desc': 'Dos pinchos de langostino fresco a la plancha',
    'mushroom_skewer_1': 'Pinchito de champiñones (1 unidad)',
    'mushroom_skewer_1_desc': 'Pincho de champiñones frescos a la plancha',
    'mushroom_skewer_2': 'Pinchito de champiñones (2 unidades)',
    'mushroom_skewer_2_desc': 'Dos pinchos de champiñones frescos a la plancha',
    'grilled_salmon': 'Salmón a la plancha con salsa fruta',
    'grilled_salmon_desc': 'Filete de salmón a la plancha con nuestra salsa de fruta especial',
    'spring_rolls': 'Rollito de primavera (2 unidades)',
    'spring_rolls_desc': 'Rollitos crujientes rellenos de verduras frescas',
    'shrimp_rolls': 'Rollito de gambas (8 unidades)',
    'shrimp_rolls_desc': 'Rollitos crujientes rellenos de gambas frescas',
    'chicken_wings': 'Alitas (6 unidades)',
    'chicken_wings_desc': 'Alitas de pollo marinadas y especiadas',
    'gyoza_fried': 'Gyozas con gambas fritas (6 unidades)',
    'gyoza_fried_desc': 'Empanadillas japonesas rellenas de gambas, preparadas fritas',
    'gyoza_grilled': 'Gyozas con gambas plancha (6 unidades)',
    'gyoza_grilled_desc': 'Empanadillas japonesas rellenas de gambas, preparadas a la plancha',
    'bao_chicken': 'Bao Pollo (2 unidades)',
    'bao_chicken_desc': 'Pan al vapor asiático relleno de pollo tierno',
    'bao_shrimp': 'Bao Langostinos (2 unidades)',
    'bao_shrimp_desc': 'Pan al vapor asiático relleno de langostinos frescos',
    'edamame': 'Edamame',
    'edamame_desc': 'Vainas de soja hervidas con sal marina',
    'edamame_spicy': 'Edamame picante',
    'edamame_spicy_desc': 'Vainas de soja hervidas con especias picantes',

    // Soup Customizer
    'soup_customizer_title': 'Personaliza tu Sopa',
    'soup_customizer_description': 'Elige tu tipo de sopa favorita y la proteína que más te guste',
    'step_soup_type': 'Elige tu tipo de sopa',
    'soup_type': 'Tipo de sopa',
    'soup_miso': 'Sopa Miso',
    'soup_miso_desc': 'Tofu, Wakame, Cebolleta y salsa de mariscos',
    'soup_tom_yam': 'Sopa Tom Yam',
    'soup_tom_yam_desc': 'Champiñones, zanahoria, brócoli, tomates cherry, salsa de marisco, medio picante',
    'custom_soup_with': 'Sopa personalizada con',
    'custom_soup_desc': 'y tus ingredientes favoritos',
    'prawn': 'Langostino',
    'veggie': 'Veggie',

    // Poke customizer
    'poke_customizer_title': 'Personaliza tu Poke',
    'poke_customizer_description': 'Elige tu poke bowl favorito con ingredientes frescos',
    'step_poke_type': 'Tipo de Poke',
    'choose_your_poke': 'Selecciona tu poke preferido',
    'poke_type': 'Tipo de Poke',
    'selected': 'Seleccionado',

    // Poke products
    'poke_korean_name': 'Poke Coreano',
    'poke_korean_desc': 'Base de arroz japonés avinagrado con salsa soja, Pollo Crispy, Kimchi, Kiwi, Tofu, langostino, alga, cebolla frita, sésamo, salsa soja y salsa kimchi',
    'poke_japanese_name': 'Poke Japonés', 
    'poke_japanese_desc': 'Base de arroz japonés avinagrado con salsa soja, Wakame, aguacate, sésamo, Tomates cherry, kiwi, Salmón, gambas, salsa japonesa y salsa soja',
    'poke_indonesia_name': 'Poke Indonesia',
    'poke_indonesia_desc': 'Base de arroz japonés avinagrado con salsa soja, Aguacate, sésamo, mango, piña, kiwi, Tomates cherry, pepino, salsa soja y salsa fruta',
    'poke_thailand_name': 'Poke Thailandia',
    'poke_thailand_desc': 'Base de arroz japonés avinagrado con salsa soja, Aguacate, piña, kiwi, gambas, sésamo, cebolla frita, pollo, salsa pimienta y salsa de fruta',
    'poke_basic_name': 'Poke Básico',
    'poke_basic_desc': 'Elección al gusto, elige 150gr de pollo o 2 pollo Crispy, Sésamo y 3 verduras/frutas a elegir entre (wakame, kimchi, tofu, alga, pepino, aguacate, kiwi, tomates cherry, piña, fresa, mango), además tendrá que elegir una de nuestras salsas (Kimchi, soja, Rosa, fruta, Japonesa, César, agridulce)',
    'poke_premium_name': 'Poke Premium',
    'poke_premium_desc': 'Elección al gusto, elige 100gr de Salmón o 150gr de pollo o 2 pollo Crispy, Sésamo y gambas, además deberá elegir 4 verduras/frutas a elegir entre (wakame, kimchi, tofu, alga, pepino, aguacate, kiwi, tomates cherry, piña, fresa, mango), además tendrá que elegir una de nuestras salsas (Kimchi, soja, Rosa, fruta, Japonesa, César, agridulce)',
    
    // Salad Customizer
    'salad_customizer_title': 'PERSONALIZA TU ENSALADA',
    'salad_customizer_description': 'Elige tu ensalada favorita y la proteína que prefieras',
    'step_salad_type': 'Tipo de Ensalada',
    'salad_type': 'Tipo de ensalada',
    
    // Salad types
    'salad_cesar': 'Ensalada César',
    'salad_cesar_ingredients': 'Lechuga, Parmesano, Aguacate, Tomates cherry, picatostes, salsa vinagreta y salsa césar',
    'salad_classic_name': 'Ensalada Classic',
    'salad_classic_ingredients': 'Lechuga, Parmesano, Aguacate, Tomates cherry, pepino, cebolla roja, picatostes, salsa vinagreta y salsa césar',
    'salad_malaysia': 'Ensalada Malaysia',
    'salad_malaysia_ingredients': 'Lechuga, pepino, picatostes, tomate cherry, nueces, sésamo, verduras al wok, salsa vinagreta y salsa césar',
    'salad_singapore': 'Ensalada Singapur',
    'salad_singapore_ingredients': 'Lechuga, Cacahuete, Chili, pepino, tomates cherry, menta, cilantro, cebolla roja, ternera al wok, salsa vinagreta y salsa Ali oli',
    'salad_thai': 'Ensalada Noodles',
    'salad_thai_ingredients': 'Lechuga, Cacahuete, noodles, lima, sésamo, salsa vinagreta y salsa césar',
    'salad_noodles': 'Ensalada Noodles',
    'salad_noodles_ingredients': 'Lechuga, cacahuete, lima, noodles al wok con zanahoria, sésamo, salsa vinagreta y salsa césar',
    'salad_crispy': 'Ensalada Crispy',
    'salad_crispy_ingredients': 'Lechuga, Zanahoria, brotes de soja, tomate cherry, salsa vinagreta, salsa césar y panko a elegir (de pollo o de langostinos)',
    'salad_fruit': 'Ensalada de Fruta',
    'salad_fruit_ingredients': 'Lechuga, aguacate, tomate cherry, mango, kiwi, fresa y salsa fruta',
    
    // Salad protein options
    'salad_protein_none': 'Sin Proteína',
    'salad_protein_none_desc': 'Solo ingredientes de la ensalada',
    'salad_protein_chicken': 'Añadir Pollo',
    'salad_protein_chicken_desc': 'Ensalada con pollo tierno',
    'salad_protein_shrimp': 'Añadir Langostinos',
    'salad_protein_shrimp_desc': 'Ensalada con langostinos frescos',
    'salad_protein_both': 'Pollo y Langostinos',
    'salad_protein_both_desc': 'Ensalada con pollo y langostinos',
    
    // Drinks Products - Bebidas
    'drink_1': 'Coca Cola',
    'drink_1_desc': 'Coca Cola 0.33L',
    'drink_2': 'Coca Cola Zero',
    'drink_2_desc': 'Coca Cola Zero 0.33L',
    'drink_3': 'Fanta Naranja',
    'drink_3_desc': 'Fanta Naranja 0.33L',
    'drink_4': 'Fanta Limón',
    'drink_4_desc': 'Fanta Limón 0.33L',
    'drink_5': 'Nestea Limón',
    'drink_5_desc': 'Nestea Limón 0.33L',
    'drink_6': 'Nestea Maracuyá',
    'drink_6_desc': 'Nestea Maracuyá 0.33L',
    'drink_7': 'Aquarius Limón',
    'drink_7_desc': 'Aquarius Limón 0.33L',
    'drink_8': 'Aquarius Naranja',
    'drink_8_desc': 'Aquarius Naranja 0.33L',
    'drink_9': 'Sprite',
    'drink_9_desc': 'Sprite 0.33L',
    'drink_10': 'Agua',
    'drink_10_desc': 'Agua 0.33L',
    'drink_11': 'Agua con Gas',
    'drink_11_desc': 'Agua con Gas 0.33L',
    'drink_12': 'Zumo Manzana',
    'drink_12_desc': 'Zumo de Manzana 0.200L',
    'drink_13': 'Zumo Piña',
    'drink_13_desc': 'Zumo de Piña 0.200L',
    'drink_14': 'Zumo Naranja',
    'drink_14_desc': 'Zumo de Naranja 0.200L',
    'drink_15': 'Zumo Melocotón',
    'drink_15_desc': 'Zumo de Melocotón 0.200L',
    'drink_16': 'Zumo Tomate',
    'drink_16_desc': 'Zumo de Tomate 0.200L',
    'drink_17': 'Cerveza Shinga',
    'drink_17_desc': 'Cerveza Shinga 1/3',
    'drink_18': 'Cerveza Kirin',
    'drink_18_desc': 'Cerveza Kirin 1/3',
    'drink_19': 'Cerveza San Miguel Especial',
    'drink_19_desc': 'Cerveza San Miguel Especial 1/3',
    'drink_20': 'Cerveza San Miguel Sin Gluten',
    'drink_20_desc': 'Cerveza San Miguel Sin Gluten 1/3',
    'drink_21': 'Cerveza San Miguel 0.0',
    'drink_21_desc': 'Cerveza San Miguel 0.0 Sin Alcohol 1/3',
    'drink_22': 'Cerveza Alhambra Especial',
    'drink_22_desc': 'Cerveza Alhambra Especial 1/3',
    'drink_23': 'Cerveza Alhambra Sin Alcohol',
    'drink_23_desc': 'Cerveza Alhambra Sin Alcohol 1/3',
    'drink_26': 'Copa de Vino',
    'drink_26_desc': 'Copa de Vino',
    'drink_27': 'Botella de Vino',
    'drink_27_desc': 'Botella de Vino',
    'drink_28': 'Tinto de Verano',
    'drink_28_desc': 'Tinto de Verano'
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
     
     // Auth
     'auth_title': 'Sign In to Thaii Express',
     'login': 'Login',
     'signup': 'Sign Up',
     'email': 'Email',
     'password': 'Password',
     'loading': 'Loading...',
     'login_success': 'Login Successful!',
     'signup_success': 'Account Created!',
     'check_email_confirmation': 'Please check your email to confirm your account.',
     'logout': 'Logout',
     
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
    'rice_customizer_title': 'Customize your Rice',
    'rice_customizer_description': 'Select your favorite protein and sauce to create your perfect dish',
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
    'custom_rice_desc': 'Custom fried rice with',

    // Noodle types
    'noodle_finos': 'Thin (Noodles)',
    'noodle_anchos': 'Wide (Pad Thai)',
    'noodle_glass': 'Glass',
    'noodle_udon': 'Udon',
    'noodle_finos_desc': 'Traditional thin noodles',
    'noodle_anchos_desc': 'Wide Pad Thai style noodles',
    'noodle_glass_desc': 'Transparent rice noodles',
    'noodle_udon_desc': 'Thick Japanese noodles',

    // Noodle customizer
    'noodle_customizer_title': 'CUSTOMIZE YOUR NOODLES',
    'noodle_customizer_description': 'Choose your noodle type, favorite protein and perfect sauce',
    'step_noodle_type': 'Noodle Type',
    'step_protein': 'Protein',
    'step_sauce': 'Sauce',
    'noodle_type': 'Noodle type',
    'custom_noodles_with': 'Custom noodles with',
    'custom_noodles_and': 'and',
    'custom_noodles_desc': 'Wok-fried noodles with',
    'custom_noodles_with_sauce': 'with sauce',
    'order_summary': 'Order summary',
    'protein': 'Protein',
    'sauce': 'Sauce',
    
    // Extra vegetables
    'extra_vegetables': 'Additional Vegetables',
    'extra_vegetables_optional': 'Additional Vegetables (Optional)',
    'extra_vegetables_desc': 'Select the extra vegetables you want to add to your dish',
    'extra_vegetables_label': 'Extra vegetables',
    'step_vegetables': 'Extra Vegetables',
    
    // Vegetable names
    'veg_egg': 'Egg',
    'veg_cilantro': 'Cilantro',
    'veg_basil': 'Basil',
    'veg_bean_sprouts': 'Bean Sprouts',
    'veg_red_onion': 'Red Onion',
    'veg_corn': 'Corn',
    'veg_green_beans': 'Green Beans',
    'veg_carrot': 'Carrot',
    'veg_peanut': 'Peanut',
    'veg_broccoli': 'Broccoli',
    'veg_scallion': 'Scallion',
    'veg_mushroom': 'Mushrooms',
    'veg_pepper': 'Pepper',

    // Enhanced protein translations
    'protein_chicken': 'Chicken',
    'protein_beef': 'Beef',
    'protein_shrimp': 'Shrimp',
    'protein_chicken_desc': 'Fresh and tender chicken breast',
    'protein_beef_desc': 'Premium tender beef',
    'protein_shrimp_desc': 'Fresh seafood shrimp',
    'protein_chicken_beef': 'Chicken & Beef',
    'protein_chicken_shrimp': 'Chicken & Shrimp',
    'protein_beef_shrimp': 'Beef & Shrimp',
    'protein_chicken_beef_shrimp': 'Chicken, Beef & Shrimp',
    'protein_chicken_beef_desc': 'Perfect combination of chicken and beef',
    'protein_chicken_shrimp_desc': 'Delicious mix of chicken and shrimp',
    'protein_beef_shrimp_desc': 'Exquisite combination of beef and shrimp',
    'protein_chicken_beef_shrimp_desc': 'Triple protein: chicken, beef and shrimp',

    // Enhanced sauce translations
    'sauce_classic': 'Classic',
    'sauce_original': 'Original',
    'sauce_teriyaki': 'Teriyaki',
    'sauce_classic_desc': 'Soy and oyster sauce',
    'sauce_original_desc': 'Cilantro, bean sprouts, carrot, peanut, tamarind sauce and lime',
    'sauce_teriyaki_desc': 'Traditional teriyaki sauce',
    
    // Entrantes translations - English (names and descriptions)
    'panko_chicken': 'Panko chicken (5 pieces)',
    'panko_chicken_desc': 'Crispy chicken pieces breaded with Japanese panko',
    'panko_shrimp': 'Panko shrimp (5 pieces)',
    'panko_shrimp_desc': 'Shrimp breaded with crispy panko',
    'chicken_skewer_1': 'Chicken skewer (1 piece)',
    'chicken_skewer_1_desc': 'Marinated grilled chicken skewer',
    'chicken_skewer_2': 'Chicken skewer (2 pieces)',
    'chicken_skewer_2_desc': 'Two marinated grilled chicken skewers',
    'shrimp_skewer_1': 'Shrimp skewer (1 piece)',
    'shrimp_skewer_1_desc': 'Fresh grilled shrimp skewer',
    'shrimp_skewer_2': 'Shrimp skewer (2 pieces)',
    'shrimp_skewer_2_desc': 'Two fresh grilled shrimp skewers',
    'mushroom_skewer_1': 'Mushroom skewer (1 piece)',
    'mushroom_skewer_1_desc': 'Fresh grilled mushroom skewer',
    'mushroom_skewer_2': 'Mushroom skewer (2 pieces)',
    'mushroom_skewer_2_desc': 'Two fresh grilled mushroom skewers',
    'grilled_salmon': 'Grilled salmon with fruit sauce',
    'grilled_salmon_desc': 'Grilled salmon fillet with our special fruit sauce',
    'spring_rolls': 'Spring rolls (2 pieces)',
    'spring_rolls_desc': 'Crispy rolls filled with fresh vegetables',
    'shrimp_rolls': 'Shrimp rolls (8 pieces)',
    'shrimp_rolls_desc': 'Crispy rolls filled with fresh shrimp',
    'chicken_wings': 'Wings (6 pieces)',
    'chicken_wings_desc': 'Marinated and spiced chicken wings',
    'gyoza_fried': 'Fried shrimp gyoza (6 pieces)',
    'gyoza_fried_desc': 'Japanese dumplings filled with shrimp, fried preparation',
    'gyoza_grilled': 'Grilled shrimp gyoza (6 pieces)',
    'gyoza_grilled_desc': 'Japanese dumplings filled with shrimp, grilled preparation',
    'bao_chicken': 'Chicken bao (2 pieces)',
    'bao_chicken_desc': 'Asian steamed bun filled with tender chicken',
    'bao_shrimp': 'Shrimp bao (2 pieces)',
    'bao_shrimp_desc': 'Asian steamed bun filled with fresh shrimp',
    'edamame': 'Edamame',
    'edamame_desc': 'Boiled soybean pods with sea salt',
    'edamame_spicy': 'Spicy edamame',
    'edamame_spicy_desc': 'Boiled soybean pods with spicy seasoning',

    // Soup Customizer
    'soup_customizer_title': 'Customize your Soup',
    'soup_customizer_description': 'Choose your favorite soup type and protein',
    'step_soup_type': 'Choose your soup type',
    'soup_type': 'Soup type',
    'soup_miso': 'Miso Soup',
    'soup_miso_desc': 'Tofu, Wakame, Scallion and seafood sauce',
    'soup_tom_yam': 'Tom Yam Soup',
    'soup_tom_yam_desc': 'Mushrooms, carrot, broccoli, cherry tomatoes, seafood sauce, medium spicy',
    'custom_soup_with': 'Custom soup with',
    'custom_soup_desc': 'and your favorite ingredients',
    'prawn': 'Prawn',
    'veggie': 'Veggie',

    // Poke customizer
    'poke_customizer_title': 'Customize your Poke',
    'poke_customizer_description': 'Choose your favorite poke bowl with fresh ingredients',
    'step_poke_type': 'Poke Type',
    'choose_your_poke': 'Select your preferred poke',
    'poke_type': 'Poke Type',
    'selected': 'Selected',

    // Poke products
    'poke_korean_name': 'Korean Poke',
    'poke_korean_desc': 'Japanese vinegared rice base with soy sauce, Crispy Chicken, Kimchi, Kiwi, Tofu, prawns, seaweed, fried onion, sesame, soy sauce and kimchi sauce',
    'poke_japanese_name': 'Japanese Poke',
    'poke_japanese_desc': 'Japanese vinegared rice base with soy sauce, Wakame, avocado, sesame, Cherry tomatoes, kiwi, Salmon, prawns, Japanese sauce and soy sauce',
    'poke_indonesia_name': 'Indonesian Poke',
    'poke_indonesia_desc': 'Japanese vinegared rice base with soy sauce, Avocado, sesame, mango, pineapple, kiwi, Cherry tomatoes, cucumber, soy sauce and fruit sauce',
    'poke_thailand_name': 'Thailand Poke',
    'poke_thailand_desc': 'Japanese vinegared rice base with soy sauce, Avocado, pineapple, kiwi, prawns, sesame, fried onion, chicken, pepper sauce and fruit sauce',
    'poke_basic_name': 'Basic Poke',
    'poke_basic_desc': 'Choose to taste, select 150gr of chicken or 2 Crispy chicken, Sesame and 3 vegetables/fruits to choose from (wakame, kimchi, tofu, seaweed, cucumber, avocado, kiwi, cherry tomatoes, pineapple, strawberry, mango), plus choose one of our sauces (Kimchi, soy, Pink, fruit, Japanese, Caesar, sweet and sour)',
    'poke_premium_name': 'Premium Poke',
    'poke_premium_desc': 'Choose to taste, select 100gr of Salmon or 150gr of chicken or 2 Crispy chicken, Sesame and prawns, plus choose 4 vegetables/fruits from (wakame, kimchi, tofu, seaweed, cucumber, avocado, kiwi, cherry tomatoes, pineapple, strawberry, mango), plus choose one of our sauces (Kimchi, soy, Pink, fruit, Japanese, Caesar, sweet and sour)',
    
    // Salad Customizer
    'salad_customizer_title': 'CUSTOMIZE YOUR SALAD',
    'salad_customizer_description': 'Choose your favorite salad and preferred protein',
    'step_salad_type': 'Salad Type',
    'salad_type': 'Salad type',
    
    // Salad types
    'salad_cesar': 'Caesar Salad',
    'salad_cesar_ingredients': 'Lettuce, Parmesan, Avocado, Cherry tomatoes, croutons, vinaigrette and caesar sauce',
    'salad_classic_name': 'Classic Salad',
    'salad_classic_ingredients': 'Lettuce, Parmesan, Avocado, Cherry tomatoes, cucumber, red onion, croutons, vinaigrette and caesar sauce',
    'salad_malaysia': 'Malaysia Salad',
    'salad_malaysia_ingredients': 'Lettuce, cucumber, croutons, cherry tomatoes, walnuts, sesame, wok vegetables, vinaigrette and caesar sauce',
    'salad_singapore': 'Singapore Salad',
    'salad_singapore_ingredients': 'Lettuce, Peanut, Chili, cucumber, cherry tomatoes, mint, cilantro, red onion, wok beef, vinaigrette and Ali oli sauce',
    'salad_thai': 'Noodles Salad',
    'salad_thai_ingredients': 'Lettuce, Peanut, noodles, lime, sesame, vinaigrette and caesar sauce',
    'salad_noodles': 'Noodles Salad',
    'salad_noodles_ingredients': 'Lettuce, peanut, lime, wok noodles with carrot, sesame, vinaigrette and caesar sauce',
    'salad_crispy': 'Crispy Salad',
    'salad_crispy_ingredients': 'Lettuce, Carrot, bean sprouts, cherry tomatoes, vinaigrette, caesar sauce and choice of panko (chicken or shrimp)',
    'salad_fruit': 'Fruit Salad',
    'salad_fruit_ingredients': 'Lettuce, avocado, cherry tomatoes, mango, kiwi, strawberry and fruit sauce',
    
    // Salad protein options
    'salad_protein_none': 'No Protein',
    'salad_protein_none_desc': 'Salad ingredients only',
    'salad_protein_chicken': 'Add Chicken',
    'salad_protein_chicken_desc': 'Salad with tender chicken',
    'salad_protein_shrimp': 'Add Shrimp',
    'salad_protein_shrimp_desc': 'Salad with fresh shrimp',
    'salad_protein_both': 'Chicken and Shrimp',
    'salad_protein_both_desc': 'Salad with chicken and shrimp',
    
    // Drinks Products
    'drink_1': 'Coca Cola',
    'drink_1_desc': 'Coca Cola 0.33L',
    'drink_2': 'Coca Cola Zero',
    'drink_2_desc': 'Coca Cola Zero 0.33L',
    'drink_3': 'Fanta Orange',
    'drink_3_desc': 'Fanta Orange 0.33L',
    'drink_4': 'Fanta Lemon',
    'drink_4_desc': 'Fanta Lemon 0.33L',
    'drink_5': 'Nestea Lemon',
    'drink_5_desc': 'Nestea Lemon 0.33L',
    'drink_6': 'Nestea Passion Fruit',
    'drink_6_desc': 'Nestea Passion Fruit 0.33L',
    'drink_7': 'Aquarius Lemon',
    'drink_7_desc': 'Aquarius Lemon 0.33L',
    'drink_8': 'Aquarius Orange',
    'drink_8_desc': 'Aquarius Orange 0.33L',
    'drink_9': 'Sprite',
    'drink_9_desc': 'Sprite 0.33L',
    'drink_10': 'Water',
    'drink_10_desc': 'Water 0.33L',
    'drink_11': 'Sparkling Water',
    'drink_11_desc': 'Sparkling Water 0.33L',
    'drink_12': 'Apple Juice',
    'drink_12_desc': 'Apple Juice 0.200L',
    'drink_13': 'Pineapple Juice',
    'drink_13_desc': 'Pineapple Juice 0.200L',
    'drink_14': 'Orange Juice',
    'drink_14_desc': 'Orange Juice 0.200L',
    'drink_15': 'Peach Juice',
    'drink_15_desc': 'Peach Juice 0.200L',
    'drink_16': 'Tomato Juice',
    'drink_16_desc': 'Tomato Juice 0.200L',
    'drink_17': 'Shinga Beer',
    'drink_17_desc': 'Shinga Beer 1/3',
    'drink_18': 'Kirin Beer',
    'drink_18_desc': 'Kirin Beer 1/3',
    'drink_19': 'San Miguel Special Beer',
    'drink_19_desc': 'San Miguel Special Beer 1/3',
    'drink_20': 'San Miguel Gluten Free Beer',
    'drink_20_desc': 'San Miguel Gluten Free Beer 1/3',
    'drink_21': 'San Miguel 0.0 Beer',
    'drink_21_desc': 'San Miguel 0.0 Non-Alcoholic Beer 1/3',
    'drink_22': 'Alhambra Special Beer',
    'drink_22_desc': 'Alhambra Special Beer 1/3',
    'drink_23': 'Alhambra Non-Alcoholic Beer',
    'drink_23_desc': 'Alhambra Non-Alcoholic Beer 1/3',
    'drink_26': 'Glass of Wine',
    'drink_26_desc': 'Glass of Wine',
    'drink_27': 'Bottle of Wine',
    'drink_27_desc': 'Bottle of Wine',
    'drink_28': 'Tinto de Verano',
    'drink_28_desc': 'Tinto de Verano'
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
    'rice_customizer_title': 'Personnalisez votre Riz',
    'rice_customizer_description': 'Sélectionnez votre protéine et sauce préférées pour créer votre plat parfait',
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
    'custom_rice_desc': 'Riz frit personnalisé avec',

    // Noodle types
    'noodle_finos': 'Fins (Nouilles)',
    'noodle_anchos': 'Larges (Pad Thai)',
    'noodle_glass': 'Vermicelles',
    'noodle_udon': 'Udon',
    'noodle_finos_desc': 'Nouilles fines traditionnelles',
    'noodle_anchos_desc': 'Nouilles larges style Pad Thai',
    'noodle_glass_desc': 'Nouilles de riz transparentes',
    'noodle_udon_desc': 'Nouilles japonaises épaisses',

    // Noodle customizer
    'noodle_customizer_title': 'PERSONNALISEZ VOS NOUILLES',
    'noodle_customizer_description': 'Choisissez votre type de nouilles, protéine préférée et sauce parfaite',
    'step_noodle_type': 'Type de Nouilles',
    'step_protein': 'Protéine',
    'step_sauce': 'Sauce',
    'noodle_type': 'Type de nouilles',
    'custom_noodles_with': 'Nouilles personnalisées avec',
    'custom_noodles_and': 'et',
    'custom_noodles_desc': 'Nouilles sautées au wok avec',
    'custom_noodles_with_sauce': 'avec sauce',
    'order_summary': 'Résumé de commande',
    'protein': 'Protéine',
    'sauce': 'Sauce',
    
    // Extra vegetables
    'extra_vegetables': 'Légumes Supplémentaires',
    'extra_vegetables_optional': 'Légumes Supplémentaires (Optionnel)',
    'extra_vegetables_desc': 'Sélectionnez les légumes supplémentaires que vous souhaitez ajouter à votre plat',
    'extra_vegetables_label': 'Légumes supplémentaires',
    'step_vegetables': 'Légumes Supplémentaires',
    
    // Vegetable names
    'veg_egg': 'Œuf',
    'veg_cilantro': 'Coriandre',
    'veg_basil': 'Basilic',
    'veg_bean_sprouts': 'Pousses de Soja',
    'veg_red_onion': 'Oignon rouge',
    'veg_corn': 'Maïs',
    'veg_green_beans': 'Haricots verts',
    'veg_carrot': 'Carotte',
    'veg_peanut': 'Cacahuète',
    'veg_broccoli': 'Brocoli',
    'veg_scallion': 'Ciboulette',
    'veg_mushroom': 'Champignons',
    'veg_pepper': 'Poivron',

    // Enhanced protein translations
    'protein_chicken': 'Poulet',
    'protein_beef': 'Bœuf',
    'protein_shrimp': 'Crevettes',
    'protein_chicken_desc': 'Blanc de poulet frais et tendre',
    'protein_beef_desc': 'Bœuf tendre de première qualité',
    'protein_shrimp_desc': 'Crevettes fraîches de mer',
    'protein_chicken_beef': 'Poulet et Bœuf',
    'protein_chicken_shrimp': 'Poulet et Crevettes',
    'protein_beef_shrimp': 'Bœuf et Crevettes',
    'protein_chicken_beef_shrimp': 'Poulet, Bœuf et Crevettes',
    'protein_chicken_beef_desc': 'Combinaison parfaite de poulet et bœuf',
    'protein_chicken_shrimp_desc': 'Délicieux mélange de poulet et crevettes',
    'protein_beef_shrimp_desc': 'Combinaison exquise de bœuf et crevettes',
    'protein_chicken_beef_shrimp_desc': 'Triple protéine : poulet, bœuf et crevettes',

    // Enhanced sauce translations
    'sauce_classic': 'Classique',
    'sauce_original': 'Original',
    'sauce_teriyaki': 'Teriyaki',
    'sauce_classic_desc': 'Sauce soja et huîtres',
    'sauce_original_desc': 'Coriandre, pousses de soja, carotte, cacahuète, sauce tamarin et citron vert',
    'sauce_teriyaki_desc': 'Sauce teriyaki traditionnelle',
    
    // Entrantes translations - French (names and descriptions)
    'panko_chicken': 'Panko poulet (5 pièces)',
    'panko_chicken_desc': 'Morceaux de poulet croustillants panés au panko japonais',
    'panko_shrimp': 'Panko crevettes (5 pièces)',
    'panko_shrimp_desc': 'Crevettes panées au panko croustillant',
    'chicken_skewer_1': 'Brochette de poulet (1 pièce)',
    'chicken_skewer_1_desc': 'Brochette de poulet mariné grillé',
    'chicken_skewer_2': 'Brochette de poulet (2 pièces)',
    'chicken_skewer_2_desc': 'Deux brochettes de poulet mariné grillé',
    'shrimp_skewer_1': 'Brochette de crevettes (1 pièce)',
    'shrimp_skewer_1_desc': 'Brochette de crevettes fraîches grillées',
    'shrimp_skewer_2': 'Brochette de crevettes (2 pièces)',
    'shrimp_skewer_2_desc': 'Deux brochettes de crevettes fraîches grillées',
    'mushroom_skewer_1': 'Brochette de champignons (1 pièce)',
    'mushroom_skewer_1_desc': 'Brochette de champignons frais grillés',
    'mushroom_skewer_2': 'Brochette de champignons (2 pièces)',
    'mushroom_skewer_2_desc': 'Deux brochettes de champignons frais grillés',
    'grilled_salmon': 'Saumon grillé sauce aux fruits',
    'grilled_salmon_desc': 'Filet de saumon grillé avec notre sauce aux fruits spéciale',
    'spring_rolls': 'Rouleaux de printemps (2 pièces)',
    'spring_rolls_desc': 'Rouleaux croustillants farcis aux légumes frais',
    'shrimp_rolls': 'Rouleaux de crevettes (8 pièces)',
    'shrimp_rolls_desc': 'Rouleaux croustillants farcis aux crevettes fraîches',
    'chicken_wings': 'Ailes (6 pièces)',
    'chicken_wings_desc': 'Ailes de poulet marinées et épicées',
    'gyoza_fried': 'Gyoza crevettes frits (6 pièces)',
    'gyoza_fried_desc': 'Raviolis japonais farcis aux crevettes, préparation frite',
    'gyoza_grilled': 'Gyoza crevettes plancha (6 pièces)',
    'gyoza_grilled_desc': 'Raviolis japonais farcis aux crevettes, préparation plancha',
    'bao_chicken': 'Bao poulet (2 pièces)',
    'bao_chicken_desc': 'Pain cuit à la vapeur asiatique farci au poulet tendre',
    'bao_shrimp': 'Bao crevettes (2 pièces)',
    'bao_shrimp_desc': 'Pain cuit à la vapeur asiatique farci aux crevettes fraîches',
    'edamame': 'Edamame',
    'edamame_desc': 'Gousses de soja bouillies au sel marin',
    'edamame_spicy': 'Edamame épicé',
    'edamame_spicy_desc': 'Gousses de soja bouillies aux épices piquantes',

    // Soup Customizer
    'soup_customizer_title': 'Personnalisez votre Soupe',
    'soup_customizer_description': 'Choisissez votre type de soupe préféré et votre protéine',
    'step_soup_type': 'Choisissez votre type de soupe',
    'soup_type': 'Type de soupe',
    'soup_miso': 'Soupe Miso',
    'soup_miso_desc': 'Tofu, Wakame, Ciboulette et sauce aux fruits de mer',
    'soup_tom_yam': 'Soupe Tom Yam',
    'soup_tom_yam_desc': 'Champignons, carotte, brocoli, tomates cerises, sauce aux fruits de mer, moyennement épicé',
    'custom_soup_with': 'Soupe personnalisée avec',
    'custom_soup_desc': 'et vos ingrédients préférés',
    'prawn': 'Crevette',
    'veggie': 'Végétarien',

    // Poke customizer
    'poke_customizer_title': 'Personnalisez votre Poké',
    'poke_customizer_description': 'Choisissez votre poke bowl préféré avec des ingrédients frais',
    'step_poke_type': 'Type de Poké',
    'choose_your_poke': 'Sélectionnez votre poké préféré',
    'poke_type': 'Type de Poké',
    'selected': 'Sélectionné',

    // Poke products
    'poke_korean_name': 'Poké Coréen',
    'poke_korean_desc': 'Base de riz japonais vinaigré avec sauce soja, Poulet Crispy, Kimchi, Kiwi, Tofu, crevettes, algue, oignon frit, sésame, sauce soja et sauce kimchi',
    'poke_japanese_name': 'Poké Japonais',
    'poke_japanese_desc': 'Base de riz japonais vinaigré avec sauce soja, Wakame, avocat, sésame, Tomates cerises, kiwi, Saumon, crevettes, sauce japonaise et sauce soja',
    'poke_indonesia_name': 'Poké Indonésien',
    'poke_indonesia_desc': 'Base de riz japonais vinaigré avec sauce soja, Avocat, sésame, mangue, ananas, kiwi, Tomates cerises, concombre, sauce soja et sauce aux fruits',
    'poke_thailand_name': 'Poké Thaïlandais',
    'poke_thailand_desc': 'Base de riz japonais vinaigré avec sauce soja, Avocat, ananas, kiwi, crevettes, sésame, oignon frit, poulet, sauce poivre et sauce aux fruits',
    'poke_basic_name': 'Poké Basique',
    'poke_basic_desc': 'Choix au goût, choisissez 150gr de poulet ou 2 poulets Crispy, Sésame et 3 légumes/fruits à choisir parmi (wakame, kimchi, tofu, algue, concombre, avocat, kiwi, tomates cerises, ananas, fraise, mangue), plus choisir une de nos sauces (Kimchi, soja, Rose, fruit, Japonaise, César, aigre-douce)',
    'poke_premium_name': 'Poké Premium',
    'poke_premium_desc': 'Choix au goût, choisissez 100gr de Saumon ou 150gr de poulet ou 2 poulets Crispy, Sésame et crevettes, plus choisir 4 légumes/fruits parmi (wakame, kimchi, tofu, algue, concombre, avocat, kiwi, tomates cerises, ananas, fraise, mangue), plus choisir une de nos sauces (Kimchi, soja, Rose, fruit, Japonaise, César, aigre-douce)',
    
    // Salad Customizer
    'salad_customizer_title': 'PERSONNALISEZ VOTRE SALADE',
    'salad_customizer_description': 'Choisissez votre salade préférée et la protéine de votre choix',
    'step_salad_type': 'Type de Salade',
    'salad_type': 'Type de salade',
    
    // Salad types
    'salad_cesar': 'Salade César',
    'salad_cesar_ingredients': 'Laitue, Parmesan, Avocat, Tomates cerises, croûtons, vinaigrette et sauce césar',
    'salad_classic_name': 'Salade Classic',
    'salad_classic_ingredients': 'Laitue, Parmesan, Avocat, Tomates cerises, concombre, oignon rouge, croûtons, vinaigrette et sauce césar',
    'salad_malaysia': 'Salade Malaysia',
    'salad_malaysia_ingredients': 'Laitue, concombre, croûtons, tomates cerises, noix, sésame, légumes au wok, vinaigrette et sauce césar',
    'salad_singapore': 'Salade Singapour',
    'salad_singapore_ingredients': 'Laitue, Cacahuète, Piment, concombre, tomates cerises, menthe, coriandre, oignon rouge, bœuf au wok, vinaigrette et sauce Ali oli',
    'salad_thai': 'Salade Noodles',
    'salad_thai_ingredients': 'Laitue, Cacahuète, nouilles, citron vert, sésame, vinaigrette et sauce césar',
    'salad_noodles': 'Salade Noodles',
    'salad_noodles_ingredients': 'Laitue, cacahuète, citron vert, nouilles au wok avec carotte, sésame, vinaigrette et sauce césar',
    'salad_crispy': 'Salade Crispy',
    'salad_crispy_ingredients': 'Laitue, Carotte, germes de soja, tomates cerises, vinaigrette, sauce césar et panko au choix (poulet ou crevettes)',
    'salad_fruit': 'Salade de Fruits',
    'salad_fruit_ingredients': 'Laitue, avocat, tomates cerises, mangue, kiwi, fraise et sauce aux fruits',
    
    // Salad protein options
    'salad_protein_none': 'Sans Protéine',
    'salad_protein_none_desc': 'Ingrédients de la salade uniquement',
    'salad_protein_chicken': 'Ajouter Poulet',
    'salad_protein_chicken_desc': 'Salade avec poulet tendre',
    'salad_protein_shrimp': 'Ajouter Crevettes',
    'salad_protein_shrimp_desc': 'Salade avec crevettes fraîches',
    'salad_protein_both': 'Poulet et Crevettes',
    'salad_protein_both_desc': 'Salade avec poulet et crevettes',
    
    // Drinks Products
    'drink_1': 'Coca Cola',
    'drink_1_desc': 'Coca Cola 0.33L',
    'drink_2': 'Coca Cola Zero',
    'drink_2_desc': 'Coca Cola Zero 0.33L',
    'drink_3': 'Fanta Orange',
    'drink_3_desc': 'Fanta Orange 0.33L',
    'drink_4': 'Fanta Citron',
    'drink_4_desc': 'Fanta Citron 0.33L',
    'drink_5': 'Nestea Citron',
    'drink_5_desc': 'Nestea Citron 0.33L',
    'drink_6': 'Nestea Fruit de la Passion',
    'drink_6_desc': 'Nestea Fruit de la Passion 0.33L',
    'drink_7': 'Aquarius Citron',
    'drink_7_desc': 'Aquarius Citron 0.33L',
    'drink_8': 'Aquarius Orange',
    'drink_8_desc': 'Aquarius Orange 0.33L',
    'drink_9': 'Sprite',
    'drink_9_desc': 'Sprite 0.33L',
    'drink_10': 'Eau',
    'drink_10_desc': 'Eau 0.33L',
    'drink_11': 'Eau Gazeuse',
    'drink_11_desc': 'Eau Gazeuse 0.33L',
    'drink_12': 'Jus de Pomme',
    'drink_12_desc': 'Jus de Pomme 0.200L',
    'drink_13': 'Jus d\'Ananas',
    'drink_13_desc': 'Jus d\'Ananas 0.200L',
    'drink_14': 'Jus d\'Orange',
    'drink_14_desc': 'Jus d\'Orange 0.200L',
    'drink_15': 'Jus de Pêche',
    'drink_15_desc': 'Jus de Pêche 0.200L',
    'drink_16': 'Jus de Tomate',
    'drink_16_desc': 'Jus de Tomate 0.200L',
    'drink_17': 'Bière Shinga',
    'drink_17_desc': 'Bière Shinga 1/3',
    'drink_18': 'Bière Kirin',
    'drink_18_desc': 'Bière Kirin 1/3',
    'drink_19': 'Bière San Miguel Spéciale',
    'drink_19_desc': 'Bière San Miguel Spéciale 1/3',
    'drink_20': 'Bière San Miguel Sans Gluten',
    'drink_20_desc': 'Bière San Miguel Sans Gluten 1/3',
    'drink_21': 'Bière San Miguel 0.0',
    'drink_21_desc': 'Bière San Miguel 0.0 Sans Alcool 1/3',
    'drink_22': 'Bière Alhambra Spéciale',
    'drink_22_desc': 'Bière Alhambra Spéciale 1/3',
    'drink_23': 'Bière Alhambra Sans Alcool',
    'drink_23_desc': 'Bière Alhambra Sans Alcool 1/3',
    'drink_26': 'Verre de Vin',
    'drink_26_desc': 'Verre de Vin',
    'drink_27': 'Bouteille de Vin',
    'drink_27_desc': 'Bouteille de Vin',
    'drink_28': 'Tinto de Verano',
    'drink_28_desc': 'Tinto de Verano'
  }
};