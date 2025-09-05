import { useState, useEffect } from 'react';
import { fetchStaticContent, StaticContentData, staticContent } from '@/lib/static-content';

export const useStaticContent = (
  contentType: 'privacy_policy' | 'terms_conditions' | 'contact',
  siteId: string = 'smartstockiq'
) => {
  const [content, setContent] = useState<StaticContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `static_content_${contentType}_${siteId}`;
    
    // Check for cached content first
    const cachedContent = localStorage.getItem(cacheKey);
    if (cachedContent) {
      try {
        setContent(JSON.parse(cachedContent));
        setLoading(false);
      } catch (err) {
        console.error('Error parsing cached content:', err);
        localStorage.removeItem(cacheKey);
      }
    } else {
      setLoading(true);
    }

    const loadContent = async () => {
      try {
        const data = await fetchStaticContent(contentType, siteId);
        
        if (data) {
          setContent(data);
          // Cache the fetched content
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } else {
          // Fallback to static content if database fetch fails
          const fallbackContent = getFallbackContent(contentType);
          if (fallbackContent) {
            const fallbackData = {
              id: 'fallback',
              site_id: siteId,
              content_type: contentType,
              title: fallbackContent.title,
              last_updated: fallbackContent.lastUpdated || null,
              sections: fallbackContent.sections,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setContent(fallbackData);
            localStorage.setItem(cacheKey, JSON.stringify(fallbackData));
          }
        }
      } catch (err) {
        console.error('Error loading static content:', err);
        setError('Failed to load content');
        
        // Fallback to static content on error
        const fallbackContent = getFallbackContent(contentType);
        if (fallbackContent) {
          const fallbackData = {
            id: 'fallback',
            site_id: siteId,
            content_type: contentType,
            title: fallbackContent.title,
            last_updated: fallbackContent.lastUpdated || null,
            sections: fallbackContent.sections,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setContent(fallbackData);
          localStorage.setItem(cacheKey, JSON.stringify(fallbackData));
        }
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType, siteId]);

  return { content, loading, error };
};

const getFallbackContent = (contentType: string) => {
  switch (contentType) {
    case 'privacy_policy':
      return {
        title: staticContent.privacyPolicy.title,
        lastUpdated: staticContent.privacyPolicy.lastUpdated,
        sections: staticContent.privacyPolicy.sections
      };
    case 'terms_conditions':
      return {
        title: staticContent.termsConditions.title,
        lastUpdated: staticContent.termsConditions.lastUpdated,
        sections: staticContent.termsConditions.sections
      };
    case 'contact':
      return {
        title: staticContent.contact.page.title,
        lastUpdated: null,
        sections: [{
          title: "Contact Form",
          content: staticContent.contact.page.description,
          form_fields: staticContent.contact.form.labels,
          submit_text: staticContent.contact.form.buttons.submit,
          submitting_text: staticContent.contact.form.buttons.submitting
        }]
      };
    default:
      return null;
  }
};