"use client";

import { useEffect, useState } from "react";
import { getProducts, createOrder, getCustomerByPhone, validatePromotion } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coffee, ShoppingBag, User, Ticket, Award, Search, X, Printer, Plus } from "lucide-react";
import { AnimatedPage } from "@/components/animated-page";
import { Receipt } from "@/components/pos/Receipt";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useRef } from "react";

export default function POSPage() {
  const { user, activeBranchId } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // CRM State
  const [customerPhone, setCustomerPhone] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  
  // Promo State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'QR_PROMPTPAY'>('CASH');
  const [isTaxInvoiceRequested, setIsTaxInvoiceRequested] = useState(false);
  const [taxInvoiceName, setTaxInvoiceName] = useState("");
  const [taxInvoiceTaxId, setTaxInvoiceTaxId] = useState("");
  const [taxInvoiceAddress, setTaxInvoiceAddress] = useState("");

  // Receipt & Success State
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${completedOrder?.id || 'new'}`,
  });

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => toast.error("Failed to load products: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Recalculate promo if subtotal changes (e.g. minPurchase rule)
  useEffect(() => {
    if (appliedPromo && appliedPromo.minPurchase && subtotal < appliedPromo.minPurchase) {
      toast.warning("Promotion removed due to minimum purchase requirement.");
      setAppliedPromo(null);
    }
  }, [subtotal, appliedPromo]);

  const promoDiscount = appliedPromo 
    ? (appliedPromo.type === 'PERCENTAGE' ? subtotal * (appliedPromo.value / 100) : appliedPromo.value)
    : 0;
  
  const pointsDiscount = pointsToRedeem / 10; // 10 points = 1 THB
  const totalDiscount = Math.min(promoDiscount + pointsDiscount, subtotal);
  const netTotal = subtotal - totalDiscount;
  const pointsEarned = customer ? Math.floor(netTotal / 100) : 0;

  // Handlers
  const handleFindCustomer = async () => {
    if (!customerPhone) return;
    try {
      const data = await getCustomerByPhone(customerPhone);
      setCustomer(data);
      toast.success(`Found member: ${data.name}`);
    } catch (err: any) {
      toast.error("Customer not found");
      setCustomer(null);
      setPointsToRedeem(0);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      const data = await validatePromotion(promoCode, subtotal);
      setAppliedPromo(data);
      toast.success("Promotion applied!");
    } catch (err: any) {
      toast.error(err.message);
      setAppliedPromo(null);
    }
  };

  const handleClearCRM = () => {
    setCustomer(null);
    setCustomerPhone("");
    setPointsToRedeem(0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!activeBranchId) {
      toast.error("Please select a branch first.");
      return;
    }
    
    try {
      const items = cart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      const orderData = await createOrder({ 
        userId: user?.id as number, 
        branchId: activeBranchId, 
        items,
        customerPhone: customer?.phone,
        promotionCode: appliedPromo?.code,
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        paymentMethod,
        isTaxInvoiceRequested,
        taxInvoiceName: isTaxInvoiceRequested ? taxInvoiceName : undefined,
        taxInvoiceTaxId: isTaxInvoiceRequested ? taxInvoiceTaxId : undefined,
        taxInvoiceAddress: isTaxInvoiceRequested ? taxInvoiceAddress : undefined,
      });
      
      toast.success("Order completed successfully!");
      
      // Prepare receipt data
      setCompletedOrder({
        id: orderData.id,
        cashier: user?.name,
        customerName: customer?.name,
        items: cart,
        subtotal,
        discount: totalDiscount,
        netTotal
      });
      setShowSuccess(true);
      
      setCart([]);
      handleClearCRM();
      setAppliedPromo(null);
      setPromoCode("");
      setShowCheckout(false);
      setPaymentMethod('CASH');
      setIsTaxInvoiceRequested(false);
      setTaxInvoiceName("");
      setTaxInvoiceTaxId("");
      setTaxInvoiceAddress("");
    } catch (err: any) {
      toast.error("Checkout failed: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading POS…</div>;

  return (
    <div className="flex h-full gap-6 w-full">
      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:border-amber-400 hover:shadow-md transition-colors active:scale-95 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              onClick={() => addToCart(product)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{product.name}</CardTitle>
                <CardDescription className="dark:text-slate-400">{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex justify-between items-center">
                <span className="font-bold text-amber-600 dark:text-amber-500 text-lg tabular-nums">฿{product.price}</span>
                <Button variant="secondary" size="sm" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50">Add</Button>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="col-span-3 text-center text-slate-500 dark:text-slate-400 py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              No products found. Please add them via database first.
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[420px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <ShoppingBag size={20} className="text-amber-500" /> Current Order
          </h2>
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold tabular-nums">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((item) => (
            <div key={item.product.id} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50 pb-3">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">฿{item.product.price} x {item.quantity}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">฿{item.product.price * item.quantity}</span>
                <Button aria-label="Remove item" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0" onClick={() => removeFromCart(item.product.id)}>
                  ✕
                </Button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center text-slate-400 mt-10 flex flex-col items-center gap-2">
              <ShoppingBag size={48} className="opacity-20" />
              <span>Cart is empty</span>
            </div>
          )}
        </div>

        {/* CRM & Promo Section */}
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4 space-y-4">
          
          {/* Customer CRM */}
          <div className="space-y-2">
            {!customer ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Customer Phone" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                  <Button aria-label="Search customer" variant="secondary" className="dark:bg-slate-800 dark:text-slate-300" onClick={handleFindCustomer}><Search className="w-4 h-4" /></Button>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3 rounded-lg relative">
                <Button aria-label="Clear customer" variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300" onClick={handleClearCRM}>
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 mb-1">
                  <User className="w-4 h-4" /> {customer.name} <Badge variant="outline" className="bg-white dark:bg-slate-900 dark:border-slate-700 text-[10px] uppercase font-bold tracking-wider py-0 px-2">{customer.tier}</Badge>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500 mb-2">Available: {customer.points} pts (฿{customer.points / 10})</div>
                {customer.points > 0 && (
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="number" 
                      min="0" 
                      max={customer.points} 
                      placeholder="Pts to redeem" 
                      value={pointsToRedeem || ''}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">10 pts = ฿1</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            {!appliedPromo ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Promo Code" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())} 
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 uppercase"
                />
                <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-300" onClick={handleApplyPromo}>Apply</Button>
              </div>
            ) : (
              <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-pink-700 dark:text-pink-400">
                  <Ticket className="w-4 h-4" /> {appliedPromo.code}
                </div>
                <Button aria-label="Remove promotion" variant="ghost" size="sm" className="h-6 w-6 p-0 text-pink-500 hover:text-pink-700 dark:hover:text-pink-300" onClick={() => setAppliedPromo(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

        </div>

        {/* Summary */}
        <div className="p-5 bg-slate-800 dark:bg-slate-950 text-white rounded-b-xl space-y-2 border-t border-slate-700 dark:border-slate-900">
          <div className="flex justify-between text-sm text-slate-300 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="tabular-nums">฿{subtotal.toLocaleString()}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-pink-300">
              <span>Discount</span>
              <span className="tabular-nums">- ฿{totalDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-2xl font-bold pt-2 border-t border-slate-600">
            <span>Total</span>
            <span className="text-amber-400 tabular-nums">฿{netTotal.toLocaleString()}</span>
          </div>
          {pointsEarned > 0 && (
            <div className="flex justify-end text-xs text-blue-300 pt-1">
              <Award className="w-3 h-3 mr-1" /> Earn {pointsEarned} pts
            </div>
          )}
          <Button 
            className="w-full h-12 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg mt-4 transition-colors" 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
          >
            Confirm & Pay
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Total to pay: ฿{netTotal.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('CASH')}
                >Cash</Button>
                <Button 
                  variant={paymentMethod === 'CREDIT_CARD' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                >Card</Button>
                <Button 
                  variant={paymentMethod === 'QR_PROMPTPAY' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('QR_PROMPTPAY')}
                >QR</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 border-t pt-4">
              <input 
                type="checkbox" 
                id="tax-invoice"
                checked={isTaxInvoiceRequested}
                onChange={(e) => setIsTaxInvoiceRequested(e.target.checked)}
                className="rounded border-slate-300 w-4 h-4"
              />
              <label htmlFor="tax-invoice" className="text-sm font-medium cursor-pointer">Request e-Tax Invoice</label>
            </div>
            
            {isTaxInvoiceRequested && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <Input 
                  placeholder="Company / Individual Name" 
                  value={taxInvoiceName}
                  onChange={(e) => setTaxInvoiceName(e.target.value)}
                />
                <Input 
                  placeholder="Tax ID (13 digits)" 
                  value={taxInvoiceTaxId}
                  onChange={(e) => setTaxInvoiceTaxId(e.target.value)}
                />
                <Input 
                  placeholder="Full Address" 
                  value={taxInvoiceAddress}
                  onChange={(e) => setTaxInvoiceAddress(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCheckout} className="w-full bg-emerald-600 hover:bg-emerald-700">Pay ฿{netTotal.toLocaleString()}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success & Print Dialog */}
      <Dialog open={showSuccess} onOpenChange={(open) => {
        if (!open) setShowSuccess(false);
      }}>
        <DialogContent className="sm:max-w-[400px] bg-slate-100 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-center text-emerald-600 text-2xl font-bold flex flex-col items-center gap-2">
              <Award className="w-12 h-12" />
              Order Completed!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex justify-center">
            {/* Hidden Receipt Component to be printed */}
            <div className="hidden">
              <Receipt ref={receiptRef} order={completedOrder} branchName="Branch" />
            </div>
            
            {/* Preview */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm text-sm text-center w-full max-w-[250px] rounded text-slate-900 dark:text-slate-100">
              <p className="font-bold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">Receipt Preview</p>
              <p>Total: ฿{completedOrder?.netTotal?.toFixed(2)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Order #{completedOrder?.id}</p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={() => handlePrint()} className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600">
              <Printer className="w-5 h-5 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" onClick={() => setShowSuccess(false)} className="w-full h-12 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
