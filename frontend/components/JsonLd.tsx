/**
 * Injects JSON-LD structured data into the page <head>.
 * Supports Article, FAQPage, BreadcrumbList, and WebSite schemas.
 * Critical for SEO (rich snippets), GEO (AI citation), and AEO (featured snippets).
 */

interface ArticleSchemaProps {
  type: 'article';
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  publisherName: string;
  publisherUrl: string;
  imageUrl?: string;
}

interface FaqSchemaProps {
  type: 'faq';
  questions: { question: string; answer: string }[];
}

interface BreadcrumbSchemaProps {
  type: 'breadcrumb';
  items: { name: string; url: string }[];
}

interface WebSiteSchemaProps {
  type: 'website';
  name: string;
  url: string;
  description: string;
}

type JsonLdProps =
  | ArticleSchemaProps
  | FaqSchemaProps
  | BreadcrumbSchemaProps
  | WebSiteSchemaProps;

function buildSchema(props: JsonLdProps): object {
  switch (props.type) {
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: props.title,
        description: props.description,
        url: props.url,
        datePublished: props.datePublished,
        dateModified: props.dateModified,
        author: {
          '@type': 'Organization',
          name: props.authorName,
          url: props.publisherUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: props.publisherName,
          url: props.publisherUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${props.publisherUrl}/icon.svg`,
          },
        },
        ...(props.imageUrl ? { image: props.imageUrl } : {}),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': props.url,
        },
      };

    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      };

    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: props.name,
        url: props.url,
        description: props.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${props.url}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
  }
}

export default function JsonLd(props: JsonLdProps) {
  const schema = buildSchema(props);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
