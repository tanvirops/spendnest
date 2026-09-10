import { Helmet } from 'react-helmet-async';

/**
 * PageTitle Component
 * Dynamically sets the page title and meta tags
 * @param {string} title - Page title
 * @param {string} description - Meta description (optional)
 */
export function PageTitle({
  title,
  description = 'SpendNest - Personal Finance Tracker',
  keywords = 'expense tracker, budget planner, personal finance app, spending dashboard, monthly budget',
}) {
  const appName = 'SpendNest';
  const fullTitle = title ? `${title} | ${appName}` : appName;
  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}${window.location.search}`
      : 'https://spendnest.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: appName,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description,
    url: currentUrl,
    image: '/web-app-manifest-512x512.png',
    author: {
      '@type': 'Organization',
      name: appName,
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content={appName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={appName} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content="/web-app-manifest-512x512.png" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/web-app-manifest-512x512.png" />
      <link rel="canonical" href={currentUrl} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

export default PageTitle;
