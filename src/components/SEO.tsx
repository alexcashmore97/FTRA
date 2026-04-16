import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
}

const SITE = 'https://fullthairulesaustralia.com';
const SITE_NAME = 'Full Thai Rules Australia';
const DEFAULT_IMAGE = `${SITE}/images/logos/ftra-logo.png`;

export default function SEO({ title, description, path, image, type = 'website' }: SEOProps) {
  const url = `${SITE}${path}`;
  const img = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
