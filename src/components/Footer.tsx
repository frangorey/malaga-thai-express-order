import { MapPin, Phone, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
export const Footer = () => {
  const { t } = useLanguage();
  return <footer className="bg-darker-surface border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="neon-border rounded-lg p-2 bg-card">
                <div className="text-xl font-bold neon-text">Thaii</div>
                <div className="text-xs text-muted-foreground">EXPRESS</div>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              {t('restaurant_description')}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold neon-text mb-4">{t('contact_title')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Plaza de la Solidaridad, 9</p>
                  <p className="text-sm text-muted-foreground">Málaga, España</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:951401937" className="hover:text-primary transition-colors">
                  951 40 19 37
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-bold neon-text mb-4">{t('hours_title')}</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">{t('monday_sunday')}</p>
                  <p className="text-sm text-muted-foreground">{t('hours_time')}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                {t('online_orders_available')}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">{t('all_rights_reserved')}</p>
        </div>
      </div>
    </footer>;
};