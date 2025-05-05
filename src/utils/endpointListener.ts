
import { LinkedInProfile } from "@/services/linkedinService";

// Set up a global event for endpoint data reception
export interface EndpointEventDetail {
  url?: string;
  data?: any;
  status: number;
  error?: string;
}

// Create a typed custom event
export const triggerEndpointEvent = (detail: EndpointEventDetail) => {
  const customEvent = new CustomEvent('endpointDataReceived', { detail });
  window.dispatchEvent(customEvent);
};

// Type extension for window interface
declare global {
  interface Window {
    _endpointListenerAdded?: boolean;
    _receivedLinkedInData?: {
      [url: string]: LinkedInProfile;
    };
  }
}

// Initialize data storage if it doesn't exist yet
if (typeof window !== 'undefined') {
  window._receivedLinkedInData = window._receivedLinkedInData || {};
}
