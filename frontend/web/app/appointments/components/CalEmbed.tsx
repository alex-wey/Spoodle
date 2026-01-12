'use client';

import { useEffect, useMemo } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';

interface CalEmbedProps {
  schedulingUrl: string;
  onBookingSuccess?: () => void;
}

/**
 * Extract calLink from full Cal.com URL
 * Examples:
 * - https://cal.com/username/event-slug -> username/event-slug
 * - https://team.cal.com/event-slug -> event-slug (for team events)
 */
function extractCalLink(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Remove leading slash
    const path = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    
    // For team URLs (team.cal.com), the path is just the event slug
    // For user URLs (cal.com/username/event-slug), the path is username/event-slug
    // Remove any trailing slashes
    return path.replace(/\/$/, '');
  } catch (error) {
    console.error('Error extracting calLink from URL:', error);
    return '';
  }
}

/**
 * Extract query parameters from URL for pre-filling
 */
function extractQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch (error) {
    console.error('Error extracting query params:', error);
    return {};
  }
}

export function CalEmbed({ schedulingUrl, onBookingSuccess }: CalEmbedProps) {
  const calLinkWithParams = useMemo(() => {
    const calLink = extractCalLink(schedulingUrl);
    const queryParams = extractQueryParams(schedulingUrl);
    
    if (!calLink) return '';
    
    // Append query parameters to calLink for pre-filling
    // Cal.com embed supports query params in the calLink string
    if (Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      return `${calLink}?${params.toString()}`;
    }
    
    return calLink;
  }, [schedulingUrl]);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      
      // Configure Cal.com embed
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
      });

      // Listen for booking success
      if (onBookingSuccess) {
        cal('on', {
          action: 'bookingSuccessful',
          callback: () => {
            console.log('Cal.com booking successful, triggering refresh');
            // Add a small delay to ensure Cal.com has processed the booking
            setTimeout(() => {
              onBookingSuccess();
            }, 500);
          },
        });
      }
    })();
  }, [onBookingSuccess]);

  if (!calLinkWithParams) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Invalid scheduling URL</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[460px] overflow-auto">
      <Cal
        calLink={calLinkWithParams}
        style={{ width: '100%', height: '100%', overflow: 'scroll' }}
        config={{
          layout: 'month_view',
        }}
      />
    </div>
  );
}
