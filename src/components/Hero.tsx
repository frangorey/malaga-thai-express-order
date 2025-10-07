import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const heroImage = "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/premium_photo-1697729549014-2faefb25efba.jpg";
const khopiImage = "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Khopi-sinfondonueva.jpeg";

const topSalesImages = [
  {
    src: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Arroz-ternera.jpeg",
    alt: "Arroz con ternera",
    title: "Arroz Ternera"
  },
  {
    src: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Ensalada-Noodles.jpeg", 
    alt: "Ensalada de Noodles",
    title: "Ensalada Noodles"
  },
  {
    src: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Finos-classic-pollogambas.jpeg",
    alt: "Tallarines clásicos con pollo y gambas", 
    title: "Finos Clásicos"
  },
  {
    src: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Poke-Coreano.jpeg",
    alt: "Poke Coreano",
    title: "Poke Coreano"
  },
  {
    src: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Sopa-TomYam.jpeg",
    alt: "Sopa Tom Yam",
    title: "Sopa Tom Yam"
  }
];

interface HeroProps {
  onOrderClick: () => void;
}

export const Hero = ({ onOrderClick }: HeroProps) => {
  const { t } = useLanguage();
  const plugin = useRef(
    Autoplay({ delay: 8000, stopOnInteraction: false })
  );
  
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Decorative Neon Lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="neon-text">Tus Noodles</span>
          <br />
          <span className="text-foreground">de Málaga</span>
        </h1>
        
        {/* Eslogan */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            "No wok, No life"
          </h2>
        </div>

        {/* Carrusel de Top Ventas */}
        <div className="mb-8 max-w-6xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            {t('top_sales')}
          </h3>
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2">
              {topSalesImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:basis-1/2 lg:basis-1/3">
                  <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-2xl group cursor-pointer">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-bold text-xl mb-2 drop-shadow-lg">{image.title}</h4>
                      <div className="w-12 h-1 bg-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('choose_what_you_like')} <span className="neon-text font-semibold">{t('take_it_home')}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="neon" 
            size="lg" 
            onClick={onOrderClick}
            className="text-lg px-8 py-6"
          >
            {t('order_online')}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6"
            asChild
          >
            <a href="tel:951401937">
              {t('call_us')}
            </a>
          </Button>
        </div>

        {/* Contact Info for Mobile */}
        <div className="mt-8 md:hidden text-sm text-muted-foreground">
          <p>{t('address')}</p>
        </div>
      </div>
    </section>
  );
};