/**
 * HTTP request options interface for API calls
 */
export interface IRequestOptions {
    /** Target URL for the request */
    url: string;
    
    /** HTTP headers */
    headers: {
        'Content-Type': string;
        'X-Auth-Token': string;
    };
    
    /** JSON payload for the request */
    json: Record<string, any>;
}