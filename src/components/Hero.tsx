import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const heroImage = "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/WhatsApp%20Image%202025-08-13%20at%2000.34.14%20(2).jpeg";
const khopiImage = "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Khopi-sinfondo";

interface HeroProps {
  onOrderClick: () => void;
}

export const Hero = ({ onOrderClick }: HeroProps) => {
  const { t } = useLanguage();
  
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
        {/* Khopi Mascot Button */}
        <div className="mb-8 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-black/90 transition-all duration-300 hover:scale-105"
              >
                <img 
                  src={khopiImage} 
                  alt="Khopi - Mascota de Thai Express" 
                  className="h-20 md:h-28 lg:h-36 w-auto drop-shadow-2xl"
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">{t('doubts_about_dishes')}</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4 py-4">
                <img 
                  src={khopiImage} 
                  alt="Khopi" 
                  className="h-32 w-auto mx-auto rounded-lg"
                />
                <p className="text-muted-foreground">
                  {t('khopi_greeting')}
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="neon" asChild>
                    <a href="tel:951401937" className="text-center">
                      {t('call_us')}
                    </a>
                  </Button>
                  <Button variant="outline" onClick={onOrderClick}>
                    {t('see_full_menu')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="neon-text">{t('prepare_to_taste')}</span>
          <br />
          <span className="text-foreground">{t('to_your_liking')}</span>
        </h1>
        
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