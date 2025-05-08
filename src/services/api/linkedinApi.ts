
import { supabase } from "@/integrations/supabase/client";
import { ApiResponse, WebhookData } from "../types/linkedinTypes";
import { WEBHOOK_URL, FETCH_TIMEOUT } from "../config/linkedinConfig";
import { saveRecordIdToStorage, createTemporaryId } from "../utils/storageUtils";

/**
 * Sends the LinkedIn URL to the webhook for processing
 */
export const sendUrlToWebhook = async (linkedinUrl: string, email: string | null = null): Promise<ApiResponse> => {
  try {
    console.log("[LINKEDIN_API] Processing LinkedIn URL:", linkedinUrl);
    console.log("[LINKEDIN_API] Email provided:", email);
    
    // Try to save the URL to the database to get an ID
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from('linkedin_links')
        .insert({
          linkedin_url: linkedinUrl,
          email: email // Save the email if provided
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("[LINKEDIN_API] Error saving URL to database:", insertError);
        
        // Check if this is a connection error
        if (insertError.message.includes("Failed to fetch") || 
            insertError.message.includes("NetworkError") || 
            insertError.message.includes("network")) {
          return { 
            data: null, 
            error: "Database connection problem. Please check your internet connection.",
            status: 503
          };
        }
        
        return { 
          data: null, 
          error: `Error saving URL: ${insertError.message}`,
          status: 500
        };
      }
      
      const recordId = insertedData.id;
      console.log("[LINKEDIN_API] URL saved to database with ID:", recordId);
      
      // Store the ID in localStorage and sessionStorage for redundancy
      saveRecordIdToStorage(linkedinUrl, recordId);
      
      // Now try to send the ID and URL to the webhook
      return await sendToWebhook(linkedinUrl, recordId, email);
    } catch (supabaseError) {
      console.error("[LINKEDIN_API] Critical error accessing Supabase:", supabaseError);
      
      // Try to create a local ID to work offline
      const tempId = createTemporaryId();
      saveRecordIdToStorage(linkedinUrl, tempId);
      
      return { 
        data: null,
        recordId: tempId,
        error: "Database connection error. A temporary ID was created for continuity.",
        status: 503
      };
    }
  } catch (error) {
    console.error("[LINKEDIN_API] Error processing request:", error);
    return { 
      data: null, 
      error: String(error), 
      status: 500 
    };
  }
};

/**
 * Helper function to send data to the webhook
 */
async function sendToWebhook(linkedinUrl: string, recordId: string, email: string | null): Promise<ApiResponse> {
  try {
    console.log("[LINKEDIN_API] Sending URL, ID and email to webhook:", linkedinUrl, recordId, email);
    
    // Prepare data for the webhook including URL, record ID, email and timestamp
    const webhookData: WebhookData = {
      linkedinUrl,
      recordId,
      email,
      requestTime: new Date().toISOString()
    };
    
    console.log("[LINKEDIN_API] Data being sent to webhook:", webhookData);
    
    // Use the same fetch pattern for the webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log("[LINKEDIN_API] Webhook response status:", response.status);
    
    // Check the response
    if (response.ok) {
      // If successfully sent to the webhook, great
      try {
        const responseData = await response.json();
        console.log("[LINKEDIN_API] Webhook response:", responseData);
        return { 
          data: null, 
          status: response.status,
          recordId: recordId,
          message: responseData.message || "URL sent successfully"
        };
      } catch (e) {
        console.log("[LINKEDIN_API] Webhook responded successfully, but without JSON data");
        return { 
          data: null, 
          status: response.status,
          recordId: recordId,
          message: "URL sent successfully, no data returned"
        };
      }
    } else {
      // If the webhook failed, but we have the record ID, continue anyway
      console.log("[LINKEDIN_API] Webhook failed, but continuing with record ID:", recordId);
      
      // Capture the webhook error for logging but don't interrupt the flow
      try {
        const errorData = await response.text();
        console.error("[LINKEDIN_API] Webhook error (ignored):", errorData);
      } catch (e) {
        console.error("[LINKEDIN_API] Could not read webhook error:", e);
      }
      
      // Return success anyway since having the record ID is what matters
      return {
        data: null,
        recordId: recordId,
        message: "URL registered successfully. The webhook failed, but the process will continue."
      };
    }
  } catch (webhookError) {
    // If the webhook failed completely but we have the record ID, continue anyway
    console.error("[LINKEDIN_API] Error calling webhook (ignored):", webhookError);
    
    // Check if it's a timeout error
    if (webhookError.name === "AbortError") {
      console.log("[LINKEDIN_API] Webhook call timeout, but continuing with ID:", recordId);
    }
    
    return {
      data: null,
      recordId: recordId,
      message: "URL registered successfully. The webhook could not be called, but the process will continue."
    };
  }
}
