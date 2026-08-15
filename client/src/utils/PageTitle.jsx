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
  keywords = 'expense, budget, finance, tracker'
}) {
  const appName = 'SpendNest';
  const fullTitle = title ? `${title} | ${appName}` : appName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

export default PageTitle;
