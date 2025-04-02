
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Order, WhatsAppMessage } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { order } = await req.json() as { order: Order };

    if (!order) {
      return new Response(
        JSON.stringify({ error: "No order data provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if customer phone exists
    if (!order.customer?.phone) {
      console.log("No customer phone number available for order:", order.id);
      return new Response(
        JSON.stringify({ error: "No customer phone number available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Format the WhatsApp message
    const message = formatReceiptMessage(order);
    
    // Send WhatsApp message using CallMeBot API
    const phone = formatPhoneNumber(order.customer.phone);
    const success = await sendWhatsAppMessage({ phone, message });

    return new Response(
      JSON.stringify({ success, message: "WhatsApp message sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Ensure the number starts with country code (assuming India +91)
  if (digits.length === 10) {
    return "91" + digits;
  }
  
  // If already has country code
  return digits;
}

function formatReceiptMessage(order: Order): string {
  const date = new Date(order.createdAt).toLocaleString();
  const orderType = order.type.charAt(0).toUpperCase() + order.type.slice(1);
  
  let message = `📝 *MIR CAFÉ - RECEIPT* 📝\n\n`;
  message += `*Order #${order.id.slice(-5)}*\n`;
  message += `*Date:* ${date}\n`;
  message += `*Order Type:* ${orderType}\n`;
  if (order.type === 'dine-in' && order.tableNumber) {
    message += `*Table:* ${order.tableNumber}\n`;
  }
  message += `*Customer:* ${order.customer?.name || 'Guest'}\n\n`;
  
  message += `*ITEMS:*\n`;
  order.items.forEach(item => {
    message += `${item.quantity}x ${item.name} - ₹${item.price.toFixed(2)}/each\n`;
  });
  
  message += `\n*TOTAL: ₹${order.totalAmount.toFixed(2)}*\n\n`;
  
  if (order.paymentMethod) {
    message += `*Payment:* ${order.paymentMethod}\n`;
  }
  
  message += `\nThank you for visiting Mir Café!\nWe hope to see you again soon. ☕`;
  
  return message;
}

async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<boolean> {
  try {
    // Format the URL for CallMeBot API
    // Using format: https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[message]&apikey=[api]
    const url = new URL("https://api.callmebot.com/whatsapp.php");
    url.searchParams.append("phone", data.phone);
    url.searchParams.append("text", encodeURIComponent(data.message));
    url.searchParams.append("apikey", "YOUR_CALLMEBOT_API_KEY"); // Replace with actual API key or environment variable
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("CallMeBot API error:", errorText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
