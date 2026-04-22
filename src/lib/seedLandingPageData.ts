import { firestoreHelpers, COLLECTIONS } from './firestore';
import type { LandingPageContent } from '@/types';

/**
 * Seed initial landing page content
 * This script populates the CMS with initial content from the existing hardcoded pages
 */
export const seedLandingPageData = async (userId: string) => {
  const pages: Omit<LandingPageContent, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      pageSlug: 'home',
      pageTitle: 'Home',
      metaDescription: 'Logan River Tree Farm - Growers of quality advanced trees and shrubs. Wholesale & Retail Nursery in Sydney.',
      metaKeywords: 'lilly pilly, tree farm, nursery, sydney, wholesale, retail, advanced trees',
      sections: [
        {
          id: 'hero',
          sectionKey: 'hero',
          title: 'Growers of quality advanced trees and shrubs',
          subtitle: '',
          imageUrl: 'https://storage.googleapis.com/farm-erp-web.firebasestorage.app/wp-content/uploads/2023/03/Aerial1.jpg',
          visible: true,
          order: 1,
        },
        {
          id: 'about',
          sectionKey: 'about',
          title: '',
          imageUrl: 'https://storage.googleapis.com/farm-erp-web.firebasestorage.app/wp-content/uploads/2023/03/Aerial.png',
          content: '<strong>Logan River Tree Farm</strong> specialises in advanced screening trees and shrubs, streetscape, landscaping trees and hedging plants. Varieties of <strong>Lilly Pilly</strong> make up a large percentage of our trees and shrubs. We have experienced staff who can advise you on the right trees to suit your situation and budget. Our trees are grown in bags with handles for easy lifting and our specially designed trailers will deliver them to your garden in the best condition. The tree farm has been in operation for 20 years and is a reliable supplier to Landscapers, Councils, Developers and Home Gardeners who want established trees straight from the grower. Yes, we do sell wholesale to the public!',
          visible: true,
          order: 2,
        },
        {
          id: 'parallax2',
          sectionKey: 'parallax2',
          title: '',
          imageUrl: 'https://storage.googleapis.com/farm-erp-web.firebasestorage.app/wp-content/uploads/2023/03/Aerial_north.jpeg',
          visible: true,
          order: 3,
        },
      ],
      published: true,
      updatedBy: userId,
    },
    {
      pageSlug: 'about',
      pageTitle: 'About Us',
      metaDescription: 'Learn more about Logan River Tree Farm, our history, and our commitment to quality.',
      metaKeywords: 'about, tree farm, history, logan river',
      sections: [
        {
          id: 'hero',
          sectionKey: 'hero',
          title: 'About Logan River Tree Farm',
          subtitle: '20 years of growing excellence',
          visible: true,
          order: 1,
        },
      ],
      published: false,
      updatedBy: userId,
    },
    {
      pageSlug: 'products-lilly-pilly',
      pageTitle: 'Lilly Pilly Products',
      metaDescription: 'Browse our extensive range of Lilly Pilly varieties. Quality screening plants and hedging.',
      metaKeywords: 'lilly pilly, syzygium, screening plants, hedging, native plants',
      sections: [
        {
          id: 'hero',
          sectionKey: 'hero',
          title: 'Lilly Pilly Products',
          subtitle: 'Premium screening and hedging plants',
          visible: true,
          order: 1,
        },
      ],
      published: false,
      updatedBy: userId,
    },
    {
      pageSlug: 'contact',
      pageTitle: 'Contact Us',
      metaDescription: 'Get in touch with Logan River Tree Farm. Visit us, call, or email for enquiries.',
      metaKeywords: 'contact, location, phone, email, visit',
      sections: [
        {
          id: 'hero',
          sectionKey: 'hero',
          title: 'Contact Us',
          subtitle: 'We\'re here to help',
          visible: true,
          order: 1,
        },
      ],
      published: false,
      updatedBy: userId,
    },
  ];

  const results = {
    success: [] as string[],
    errors: [] as string[],
  };

  for (const page of pages) {
    try {
      const id = await firestoreHelpers.addDocument(
        COLLECTIONS.LANDING_PAGE_CONTENT,
        page
      );
      results.success.push(`Created ${page.pageSlug} (ID: ${id})`);
      console.log(`✓ Created landing page: ${page.pageSlug}`);
    } catch (error) {
      results.errors.push(`Failed to create ${page.pageSlug}: ${error}`);
      console.error(`✗ Failed to create ${page.pageSlug}:`, error);
    }
  }

  return results;
};
