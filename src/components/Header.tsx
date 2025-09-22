import { ShoppingCart, Phone, MapPin, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AuthDialog } from "@/components/AuthDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}
export const Header = ({
  cartItemsCount,
  onCartClick
}: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="neon-border rounded-lg p-2 bg-card">
              <img 
                src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/logo-Thaii.png" 
                alt="Thaii Express Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{t('address')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-primary" />
              <a href="tel:951401937" className="hover:text-primary transition-colors">
                951 40 19 37
              </a>
            </div>
          </div>

          {/* Auth Buttons, Language Selector and Cart */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <AuthDialog>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('login')}</span>
                  </Button>
                </AuthDialog>
                <AuthDialog>
                  <Button 
                    variant="neon" 
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('signup')}</span>
                  </Button>
                </AuthDialog>
              </div>
            )}
            <LanguageSelector />
            <Button variant="cart" onClick={onCartClick} className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline ml-2">{t('cart')}</span>
              {cartItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center animate-pulse-soft">
                  {cartItemsCount}
                </span>}
            </Button>
          </div>
        </div>
      </div>
    </header>;
};