export const extractDomainFromCompany = (companyName: string): string => {
  // Remove common suffixes and convert to lowercase
  const name = companyName
    .toLowerCase()
    .replace(/\s+(inc\.?|corp\.?|ltd\.?|limited|company)$/i, '')
    .trim()
    .replace(/[^a-z0-9]/g, '');
  
  return `${name}.com`;
};

export const getCompanyLogo = (domain: string): string => {
  return `https://logo.clearbit.com/${domain}`;
};