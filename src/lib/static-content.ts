import { staticContent as fallbackContent } from '@/config/static-content';

export interface StaticContentData {
  id: string;
  site_id: string;
  content_type: string;
  title: string;
  last_updated: string | null;
  sections: any;
  created_at: string;
  updated_at: string;
}

export const fetchStaticContent = async (
  contentType: 'privacy_policy' | 'terms_conditions' | 'contact',
  siteId: string = 'smartstockiq'
): Promise<StaticContentData | null> => {
  // For now, return null to use fallback content
  // Future implementation could integrate with Supabase when database schema is ready
  return null;
};

export { fallbackContent as staticContent };