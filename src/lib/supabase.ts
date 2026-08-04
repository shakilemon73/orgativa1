import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

// Only create the client when credentials are actually present
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          label: string;
          icon: string;
          image_url: string | null;
          product_count: number;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_label: string;
          category_slug: string;
          weight: string;
          price: number;
          original_price: number | null;
          rating: number;
          reviews: number;
          image: string;
          images: string[];
          badge: string | null;
          description: string;
          highlights: string[];
          origin: string;
          in_stock: boolean;
          featured: boolean;
          trending: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          phone: string;
          email: string | null;
          division: string;
          district: string;
          thana: string;
          address: string;
          postcode: string | null;
          payment_method: string;
          payment_number: string | null;
          transaction_id: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      site_settings: {
        Row: {
          key: string;
          value: string;
          label: string | null;
          group_name: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_settings"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
      };
    };
  };
};

export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
export type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
export type DbOrder = Database["public"]["Tables"]["orders"]["Row"];
export type DbOrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type DbSiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type OrderStatus = DbOrder["status"];
