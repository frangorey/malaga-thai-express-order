import { MapPin, Phone, Clock } from "lucide-react";
export const Footer = () => {
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
              Comida asiática auténtica para llevar. Prepáralo al gusto y llévátelo a casa.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold neon-text mb-4">CONTACTO</h3>
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
            <h3 className="text-lg font-bold neon-text mb-4">HORARIOS</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm">Lunes - Domingo</p>
                  <p className="text-sm text-muted-foreground">12:00 - 23:00</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Pedidos online disponibles durante todo el horario de apertura
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Thai Express Málaga. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>;
};