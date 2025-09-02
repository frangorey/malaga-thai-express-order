import { Button } from "@/components/ui/button";
import thaiExpressLogo from "@/assets/thai-express-logo.png";

const heroImage = "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/WhatsApp%20Image%202025-08-13%20at%2000.34.14%20(2).jpeg";

interface HeroProps {
  onOrderClick: () => void;
}

export const Hero = ({ onOrderClick }: HeroProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Decorative Neon Lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={thaiExpressLogo} 
            alt="Thai Express Logo" 
            className="h-16 md:h-24 lg:h-32 w-auto drop-shadow-2xl"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="neon-text">PREPÁRALO</span>
          <br />
          <span className="text-foreground">AL GUSTO</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Escoge lo que más te guste y... <span className="neon-text font-semibold">¡llévátelo a casa!</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="neon" 
            size="lg" 
            onClick={onOrderClick}
            className="text-lg px-8 py-6"
          >
            HACER PEDIDO ONLINE
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="text-lg px-8 py-6"
            asChild
          >
            <a href="tel:951401937">
              LLAMAR: 951 40 19 37
            </a>
          </Button>
        </div>

        {/* Contact Info for Mobile */}
        <div className="mt-8 md:hidden text-sm text-muted-foreground">
          <p>Plaza de la Solidaridad, 9 - Málaga</p>
        </div>
      </div>
    </section>
  );
};