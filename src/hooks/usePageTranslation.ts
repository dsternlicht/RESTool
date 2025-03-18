import { useTranslation } from 'react-i18next';
import { TFunction, TOptions, TFunctionResult } from 'i18next';

/**
 * Custom hook that extends useTranslation to support both global and page-specific translations
 * @param pageId - The ID of the current page (optional)
 * @returns Object with translation functions and i18n instance
 */
export const usePageTranslation = (pageId?: string) => {
  const { t: baseT, i18n, ...rest } = useTranslation();

  const translatePage = (key: string | string[], options?: TOptions | string): string => {
    const translationOptions = typeof options === 'string' ? { defaultValue: options } : options;
    
    // Always use 'pages.<pageId>.' prefix for page translations
    const namespaceKey = `pages.${pageId}.${key}`;
    const pageTrans = baseT(namespaceKey, { ...(translationOptions || {}), returnNull: true });
    
    if (pageTrans !== null) {
      return pageTrans;
    }

    // Fallback to global namespace
    return baseT(`global.${key}`, translationOptions);
  };

  return {
    translate: baseT,
    translatePage: pageId ? (translatePage as TFunction) : baseT,
    i18n,
    ...rest
  };
};