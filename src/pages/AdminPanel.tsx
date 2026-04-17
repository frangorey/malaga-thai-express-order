import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Package, Clock, ChefHat, Bike, CheckCircle, XCircle, RefreshCw, Upload, Image, Camera, QrCode, Map } from 'lucide-react';
import TableQRCodes from '@/components/admin/TableQRCodes';
import TableLayoutEditor from '@/components/admin/TableLayoutEditor';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  delivery_address: string | null;
  table_number: number | null;
  notes: string | null;
  items: any;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  is_available: boolean | null;
}

const ORDER_STATUSES = [
  { value: 'received', label: 'Recibido', icon: Package, color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmado', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'preparing', label: 'Preparando', icon: ChefHat, color: 'bg-yellow-500' },
  { value: 'ready', label: 'Listo', icon: Clock, color: 'bg-orange-500' },
  { value: 'delivering', label: 'En camino', icon: Bike, color: 'bg-purple-500' },
  { value: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'bg-green-600' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadingProductId, setUploadingProductId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (!roleLoading && !user) {
      navigate('/');
      return;
    }
    if (!roleLoading && user && !isAdmin) {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/');
    }
  }, [user, isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchProducts();

      const channel = supabase
        .channel('admin-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, image_url, is_available')
      .order('category')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      toast.error('Error al actualizar el estado');
    } else {
      toast.success(`Estado actualizado a: ${ORDER_STATUSES.find(s => s.value === newStatus)?.label}`);
    }
  };

  const handlePhotoUpload = async (productId: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    setUploadingProductId(productId);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `productos/${productId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('Fotos_Thaii')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('Fotos_Thaii')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: urlData.publicUrl })
        .eq('id', productId);

      if (updateError) throw updateError;

      toast.success('Foto actualizada correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploadingProductId(null);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.order_status === statusFilter);

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  const getStatusBadge = (status: string) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === status);
    if (!statusInfo) return <Badge variant="outline">{status}</Badge>;
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        <statusInfo.icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Fotos Platos
            </TabsTrigger>
            <TabsTrigger value="qrs" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QRs de Mesa
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              🗺️ Plano de Mesas
            </TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Gestión de Pedidos ({filteredOrders.length})
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {ORDER_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Actualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay pedidos</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Pago</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono font-bold">{order.order_number}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer_name}</p>
                                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {order.order_type === 'dine_in'
                                  ? `🍽️ Mesa ${order.table_number || '?'}`
                                  : order.order_type === 'delivery'
                                    ? '🚚 Domicilio'
                                    : '🏪 Recoger'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">${order.total_amount.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                            <TableCell>
                              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.order_status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map(status => (
                                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHOTOS TAB */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Fotos de Platos ({filteredProducts.length})
                  </CardTitle>
                  <Input
                    placeholder="Buscar plato..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-64"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {uploadingProductId === product.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category} · {product.price.toFixed(2)}€</p>
                        <label className="mt-2 flex items-center justify-center gap-2 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary rounded-md py-2 px-3 text-sm transition-colors">
                          <Upload className="w-4 h-4" />
                          {product.image_url ? 'Cambiar foto' : 'Subir foto'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(product.id, file);
                            }}
                            disabled={uploadingProductId !== null}
                          />
                        </label>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR CODES TAB */}
          <TabsContent value="qrs">
            <Card>
              <CardContent className="pt-6">
                <TableQRCodes />
              </CardContent>
            </Card>
          </TabsContent>

          {/* LAYOUT TAB */}
          <TabsContent value="layout">
            <Card>
              <CardContent className="pt-6">
                <TableLayoutEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
