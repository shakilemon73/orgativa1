import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import InvoicePage from "@/pages/InvoicePage";
import NotFound from "@/pages/not-found";
import ScrollToTop from "@/components/ScrollToTop";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminProductForm from "@/pages/admin/AdminProductForm";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminSettings from "@/pages/admin/AdminSettings";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Customer routes */}
        <Route path="/" component={Home} />
        <Route path="/products/:slug" component={ProductDetail} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/track" component={OrderTracking} />
        <Route path="/track-order" component={OrderTracking} />
        <Route path="/invoice/:orderNumber" component={InvoicePage} />

        {/* Admin routes */}
        <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />
        <Route path="/admin/" component={() => <Redirect to="/admin/dashboard" />} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/products/new" component={() => <AdminProductForm />} />
        <Route path="/admin/products/:id/edit" component={AdminProductForm} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/orders/:id" component={AdminOrderDetail} />
        <Route path="/admin/settings" component={AdminSettings} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
