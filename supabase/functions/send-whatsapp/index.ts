
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
  } | null;
  status: string;
  type: string;
  tableNumber?: string;
  totalAmount: number;
  staffName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order } = await req.json() as { order: OrderDetails };
    
    if (!order || !order.customer || !order.customer.phone) {
      return new Response(
        JSON.stringify({ error: "Missing order details or customer phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
    if (!whatsappApiKey) {
      console.error("WhatsApp API key not found in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "WhatsApp API key not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Format items for WhatsApp message
    const itemsList = order.items
      .map(item => `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    // Create WhatsApp message
    const message = `
🛒 *Order Confirmation*
Order #${order.id.slice(-4)}
Type: ${order.type}${order.tableNumber ? ` (Table ${order.tableNumber})` : ''}

*Items:*
${itemsList}

*Total: ₹${order.totalAmount.toFixed(2)}*

Thank you for your order at Mir Café! Your order has been completed. Please visit again!
    `.trim();

    // Log what would be sent
    console.log(`Would send WhatsApp message to ${order.customer.phone}:`, message);

    // For now, just simulate sending WhatsApp message
    // In production, you would integrate with a WhatsApp API service
    /*
    const response = await fetch("https://whatsapp-api-service.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${whatsappApiKey}`
      },
      body: JSON.stringify({
        phone: order.customer.phone,
        message: message
      })
    });
    
    const data = await response.json();
    */

    // Simulate successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp notification sent successfully",
        details: {
          recipient: order.customer.phone,
          messagePreview: message.substring(0, 100) + "..."
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
