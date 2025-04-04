
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for request body
interface RequestBody {
  order: {
    id: string;
    items: { name: string; quantity: number; price: number }[];
    customer: { name: string; phone: string } | null;
    totalAmount: number;
    orderType: string;
    tableNumber?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { order } = await req.json() as RequestBody;
    
    // Get WhatsApp API key from owner_config
    const { data: configData, error: configError } = await supabaseClient
      .from('owner_config')
      .select('whatsapp_api_key')
      .single();
    
    if (configError || !configData?.whatsapp_api_key) {
      console.error("Error fetching WhatsApp API key:", configError);
      return new Response(
        JSON.stringify({ error: "WhatsApp API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Customer phone is required for WhatsApp
    if (!order.customer?.phone) {
      return new Response(
        JSON.stringify({ error: "Customer phone number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Prepare WhatsApp message
    const itemsList = order.items
      .map(item => `${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`)
      .join("\n");
      
    const message = `
*Thank you for your order at Mir Cafe!*

Order #${order.id.substring(0, 6)}
Customer: ${order.customer.name}

*Items:*
${itemsList}

*Total Amount:* ₹${order.totalAmount}

We hope to see you again soon!
`;

    // Format phone number (remove + and any spaces)
    const phone = order.customer.phone.replace(/[\s+]/g, "");
    
    // Send WhatsApp message using the API key
    // Note: This is a placeholder - replace with your actual WhatsApp API integration
    // This example assumes a simple REST API that accepts a phone and message
    const whatsappResponse = await fetch("https://api.whatsapp.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${configData.whatsapp_api_key}`
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });
    
    // Log the result for debugging
    console.log("WhatsApp API response status:", whatsappResponse.status);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "WhatsApp notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in send-whatsapp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
