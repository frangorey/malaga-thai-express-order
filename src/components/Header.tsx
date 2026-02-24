import { ShoppingCart, Phone, MapPin, LogIn, UserPlus, LogOut, ClipboardList, Shield, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AuthDialog } from "@/components/AuthDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { isAdmin, isModerator } = useUserRole();
  
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo - Mobile First */}
          <div className="flex items-center flex-shrink-0">
            <div className="neon-border rounded-lg p-1.5 sm:p-2 bg-card">
              <img 
                src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/logo-Thaii.png" 
                alt="Thaii Express Logo" 
                className="h-8 sm:h-10 w-auto"
                loading="eager"
              />
            </div>
          </div>

          {/* Contact Info - Hidden on mobile, visible on larger screens */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-xs lg:text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{t('address')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary flex-shrink-0" />
              <a href="tel:951401937" className="hover:text-primary transition-colors whitespace-nowrap">
                951 40 19 37
              </a>
            </div>
          </div>

          {/* Auth Buttons, Language Selector and Cart - Mobile Optimized */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10 border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden md:inline text-sm">Admin</span>
                    </Button>
                  </Link>
                )}
                {isModerator && !isAdmin && (
                  <Link to="/waiter">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10 border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden md:inline text-sm">Pedidos</span>
                    </Button>
                  </Link>
                )}
                <Link to="/orders">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10"
                  >
                    <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline text-sm">{t('myOrders')}</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline text-sm">{t('logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AuthDialog>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10"
                  >
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline text-sm">{t('login')}</span>
                  </Button>
                </AuthDialog>
                <AuthDialog>
                  <Button 
                    variant="neon" 
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-9 sm:h-10"
                  >
                    <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline text-sm">{t('signup')}</span>
                  </Button>
                </AuthDialog>
              </div>
            )}
            <LanguageSelector />
            <Button variant="cart" onClick={onCartClick} className="relative px-2 sm:px-4 h-9 sm:h-10">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline ml-2 text-sm">{t('cart')}</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs flex items-center justify-center animate-pulse-soft font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
