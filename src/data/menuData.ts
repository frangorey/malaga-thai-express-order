import { MenuCategory } from "@/types/menu";
import friedRiceImage from "@/assets/fried-rice.jpg";
import soupImage from "@/assets/soup.jpg";
import curryImage from "@/assets/curry.jpg";
import saladImage from "@/assets/salad.jpg";
import dessertImage from "@/assets/dessert.jpg";

export const menuCategories: MenuCategory[] = [
  {
    id: "arroces",
    name: "Arroces",
    description: "Arroces con base de huevo, col, pimienta mix, calabacín, zanahoria",
    items: [
      {
        id: "arroz-pollo",
        name: "Arroz Pollo",
        description: "Arroz frito con pollo tierno y verduras frescas",
        price: 8.90,
        image: friedRiceImage,
        category: "arroces",
        customizable: true
      },
      {
        id: "arroz-ternera",
        name: "Arroz Ternera",
        description: "Arroz frito con ternera y mezcla de verduras asiáticas",
        price: 9.90,
        image: friedRiceImage,
        category: "arroces",
        customizable: true
      },
      {
        id: "arroz-gambas",
        name: "Arroz Gambas",
        description: "Arroz frito con gambas frescas y vegetales",
        price: 11.90,
        image: friedRiceImage,
        category: "arroces",
        customizable: true
      },
      {
        id: "arroz-mixto",
        name: "Arroz Mixto",
        description: "Combinación de pollo, ternera y gambas",
        price: 12.90,
        image: friedRiceImage,
        category: "arroces",
        customizable: true
      }
    ]
  },
  {
    id: "tallarines",
    name: "Tallarines",
    description: "Tallarines con base de huevo, col, pimienta mix, calabacín, zanahoria",
    items: [
      {
        id: "tallarines-glass",
        name: "Tallarines Glass",
        description: "Tallarines de cristal con verduras y salsa especial",
        price: 8.90,
        image: soupImage,
        category: "tallarines",
        customizable: true
      },
      {
        id: "tallarines-finos",
        name: "Tallarines Finos",
        description: "Tallarines finos con mezcla de verduras asiáticas",
        price: 8.90,
        image: soupImage,
        category: "tallarines",
        customizable: true
      },
      {
        id: "tallarines-anchos",
        name: "Tallarines Anchos",
        description: "Tallarines anchos salteados con verduras",
        price: 8.90,
        image: soupImage,
        category: "tallarines",
        customizable: true
      },
      {
        id: "tallarines-udon",
        name: "Tallarines Udon",
        description: "Tallarines gruesos japoneses con verduras",
        price: 9.90,
        image: soupImage,
        category: "tallarines",
        customizable: true
      }
    ]
  },
  {
    id: "sopas",
    name: "Sopas",
    description: "Sopas calientes con ingredientes frescos",
    items: [
      {
        id: "sopa-pollo",
        name: "Sopa Pollo Langostino",
        description: "Sopa caliente con pollo, langostinos y verduras",
        price: 8.90,
        image: soupImage,
        category: "sopas"
      },
      {
        id: "sopa-veggie",
        name: "Sopa Veggie",
        description: "Sopa vegetariana con tofu y verduras asiáticas",
        price: 8.10,
        image: soupImage,
        category: "sopas",
        vegetarian: true
      }
    ]
  },
  {
    id: "ensaladas",
    name: "Ensaladas",
    description: "Ensaladas frescas con ingredientes asiáticos",
    items: [
      {
        id: "ensalada-normal",
        name: "Ensalada Normal",
        description: "Lechuga, parmesano, aguacate, tomate, picatostes, vinagreta",
        price: 10.40,
        image: saladImage,
        category: "ensaladas",
        vegetarian: true
      },
      {
        id: "ensalada-cesar",
        name: "Ensalada César",
        description: "Lechuga, parmesano, aguacate, tomate, pepino, cebolla roja, picatostes, vinagreta, salsa césar",
        price: 11.40,
        image: saladImage,
        category: "ensaladas"
      },
      {
        id: "ensalada-malaysa",
        name: "Ensalada Malaysa",
        description: "Lechuga, pepino, picatostes, tomate, nueces, vinagreta, salsa césar, verdura al wok",
        price: 12.90,
        image: saladImage,
        category: "ensaladas"
      }
    ]
  },
  {
    id: "curries",
    name: "Currys",
    description: "Currys aromáticos con sabores auténticos",
    items: [
      {
        id: "curry-amarillo",
        name: "Curry Amarillo",
        description: "Curry suave con leche de coco y especias aromáticas",
        price: 9.90,
        image: curryImage,
        category: "curries",
        spicy: true,
        customizable: true
      },
      {
        id: "curry-verde",
        name: "Curry Verde",
        description: "Curry picante con hierbas frescas y verduras",
        price: 9.90,
        image: curryImage,
        category: "curries",
        spicy: true,
        customizable: true
      },
      {
        id: "curry-rojo",
        name: "Curry Rojo",
        description: "Curry intenso con chile rojo y especias",
        price: 9.90,
        image: curryImage,
        category: "curries",
        spicy: true,
        customizable: true
      }
    ]
  },
  {
    id: "postres",
    name: "Postres",
    description: "Dulces finales perfectos para completar tu comida",
    items: [
      {
        id: "fruta-mediana",
        name: "Fruta Mediana",
        description: "Selección de frutas tropicales frescas",
        price: 7.50,
        image: dessertImage,
        category: "postres",
        vegetarian: true
      },
      {
        id: "fruta-pequena",
        name: "Fruta Pequeña",
        description: "Porción individual de fruta fresca",
        price: 3.95,
        image: dessertImage,
        category: "postres",
        vegetarian: true
      }
    ]
  }
];