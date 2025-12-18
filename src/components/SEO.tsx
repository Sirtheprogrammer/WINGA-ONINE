import { useEffect } from 'react';
import { Product } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  product?: Product;
  type?: 'website' | 'product' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Beipoa Online - Best Cheap Prices & Affordable Products Tanzania',
  description = 'Beipoa Online offers the best cheap prices on electronics, fashion, home goods, and more. Find affordable products with fast delivery across Tanzania.',
  keywords = 'cheap prices Tanzania, affordable products Tanzania, online shopping Tanzania, best prices Tanzania',
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://beipoa.online/',
  product,
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:type', type === 'product' ? 'product' : 'website', 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:site_name', 'Beipoa Online', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'property');
    updateMetaTag('twitter:url', url, 'property');
    updateMetaTag('twitter:title', title, 'property');
    updateMetaTag('twitter:description', description, 'property');
    updateMetaTag('twitter:image', image, 'property');

    // Product-specific meta tags
    if (product && type === 'product') {
      updateMetaTag('product:price:amount', product.price.toString(), 'property');
      updateMetaTag('product:price:currency', 'TZS', 'property');
      updateMetaTag('product:availability', product.inStock ? 'in stock' : 'out of stock', 'property');
      if (product.brand) {
        updateMetaTag('product:brand', product.brand, 'property');
      }
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Add structured data (JSON-LD) for products
    if (product && type === 'product') {
      // Remove existing product structured data
      const existingScript = document.querySelector('#product-structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const structuredData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image || product.images[0] || '',
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Beipoa'
        },
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: 'TZS',
          price: product.price,
          availability: product.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        aggregateRating: product.rating > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews
        } : undefined,
        category: product.category
      };

      // Remove undefined fields
      Object.keys(structuredData).forEach(key => {
        if (structuredData[key as keyof typeof structuredData] === undefined) {
          delete structuredData[key as keyof typeof structuredData];
        }
      });

      const script = document.createElement('script');
      script.id = 'product-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    } else {
      // Add organization structured data for homepage
      const existingScript = document.querySelector('#organization-structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const structuredData = {
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        name: 'Beipoa Online',
        url: 'https://beipoa.online/',
        logo: 'https://beipoa.online/logo.png',
        description: 'Beipoa Online - Best cheap prices and affordable products online. Fast delivery across Tanzania.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'TZ',
          addressRegion: 'Tanzania'
        },
        sameAs: [
          // Add social media links if available
        ]
      };

      const script = document.createElement('script');
      script.id = 'organization-structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, image, url, product, type]);

  return null;
};

