import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://mps-ecommerce.onrender.com/';
const BRAND_COLOR = '#e43224';
const BRAND_COLOR_DARK = '#b71916';
const BRAND_TEXT = "AV's Store";

const RESPONSIVE_VIEWPORT_SCRIPT = `
  (function () {
    var viewport = document.querySelector('meta[name="viewport"]');

    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }

    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover'
    );

    document.documentElement.style.webkitTextSizeAdjust = '100%';
    document.documentElement.style.textSizeAdjust = '100%';
    document.body.style.margin = '0';
    document.body.style.minWidth = '0';

    if (!document.getElementById('avs-mobile-preload-style')) {
      var style = document.createElement('style');
      style.id = 'avs-mobile-preload-style';
      style.textContent = [
        '@media (max-width: 768px) {',
        '  header { background: #e43224 !important; min-height: 86px !important; overflow: hidden !important; }',
        '  header > div:first-child { display: none !important; }',
        '  header > div:nth-child(2) { display: flex !important; min-height: 86px !important; padding: 16px 54px 12px 4px !important; }',
        '  header > div:nth-child(3) { display: none !important; }',
        '}'
      ].join('\\n');
      document.head.appendChild(style);
    }

    true;
  })();
`;

const MOBILE_STOREFRONT_SCRIPT = `
  (function () {
    var STYLE_ID = 'avs-mobile-storefront-style';
    var CATEGORY_TITLE_CLASS = 'avs-category-title';

    function hasText(element, text) {
      return element && (element.textContent || '').toLowerCase().indexOf(text.toLowerCase()) !== -1;
    }

    function firstMatching(selector, predicate) {
      var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
      for (var index = 0; index < elements.length; index += 1) {
        if (predicate(elements[index])) {
          return elements[index];
        }
      }
      return null;
    }

    function smallestMatching(selector, predicate) {
      var matches = Array.prototype.slice.call(document.querySelectorAll(selector)).filter(predicate);
      matches.sort(function (first, second) {
        return (first.textContent || '').length - (second.textContent || '').length;
      });
      return matches[0] || null;
    }

    function addStyle() {
      if (document.getElementById(STYLE_ID)) {
        return;
      }

      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '@media (max-width: 768px) {',
        '  :root { --avs-theme: #e43224; --avs-theme-dark: #b71916; --avs-heading: #183a7a; }',
        '  html, body { background: #ffffff !important; overflow-x: hidden !important; }',
        '  body { padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; }',
        '  #root { min-height: 100%; overflow-x: hidden !important; }',
        '  .avs-mobile-header { background: var(--avs-theme) !important; border: 0 !important; box-shadow: none !important; min-height: 86px !important; position: sticky !important; top: 0 !important; z-index: 50 !important; }',
        '  .avs-header-hidden { display: none !important; }',
        '  .avs-mobile-header > :not(.avs-search-bar) { display: none !important; }',
        '  .avs-search-bar { background: var(--avs-theme) !important; border: 0 !important; box-shadow: none !important; display: flex !important; min-height: 86px !important; padding: 16px 54px 12px 4px !important; width: 100% !important; }',
        '  .avs-search-bar > :not(.avs-search-box) { display: none !important; }',
        '  .avs-search-bar::after { align-items: center; bottom: 12px; color: #ffffff; content: "☎"; display: flex; font-size: 28px; height: 52px; justify-content: center; position: absolute; right: 6px; width: 42px; }',
        '  .avs-search-box { align-items: center !important; background: #f7f8ff !important; border-radius: 4px !important; color: #aeb8d4 !important; display: flex !important; flex: 1 1 auto !important; height: 52px !important; justify-content: space-between !important; margin: 0 !important; min-width: 0 !important; padding: 0 14px !important; width: 100% !important; }',
        '  .avs-search-box > * { align-items: center !important; color: #aeb8d4 !important; display: flex !important; min-width: 0 !important; }',
        '  .avs-search-box h6 { color: #aeb8d4 !important; font-size: 16px !important; font-weight: 700 !important; min-width: 0 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }',
        '  .avs-search-box svg { color: #aeb8d4 !important; flex: 0 0 auto !important; }',
        '  .avs-search-box button { display: none !important; }',
        '  .avs-search-bar .MuiInputBase-root, .avs-search-bar [class*="MuiInputBase-root"] { background: #f7f8ff !important; border: 0 !important; border-radius: 4px !important; box-shadow: none !important; color: #103572 !important; height: 52px !important; max-width: none !important; width: 100% !important; }',
        '  .avs-search-bar input { color: #103572 !important; font-size: 16px !important; font-weight: 700 !important; min-width: 0 !important; }',
        '  .avs-search-bar input::placeholder { color: #aeb8d4 !important; opacity: 1 !important; }',
        '  .avs-main-container { padding: 0 !important; width: 100% !important; max-width: none !important; }',
        '  .avs-main-stack { gap: 24px !important; padding: 18px 0 0 !important; width: 100% !important; }',
        '  .avs-hero-grid { display: block !important; height: auto !important; margin: 0 !important; width: 100% !important; }',
        '  .avs-hero-item { display: block !important; margin: 0 !important; max-width: none !important; padding: 0 12px !important; width: 100% !important; }',
        '  .avs-hero-card { border-radius: 5px !important; height: 188px !important; min-height: 0 !important; overflow: hidden !important; padding: 20px 16px !important; }',
        '  .avs-hero-card * { color: #ffffff !important; letter-spacing: 0 !important; }',
        '  .avs-hero-card h1, .avs-hero-card h2, .avs-hero-card h3, .avs-hero-card [class*="MuiTypography-h"] { font-size: clamp(18px, 4.8vw, 22px) !important; line-height: 1.08 !important; max-width: 58% !important; white-space: pre-line !important; }',
        '  .avs-hero-card h5, .avs-hero-card p { font-size: 12px !important; line-height: 1.25 !important; max-width: 58% !important; }',
        '  .avs-hero-card p:not(:first-child), .avs-hero-card h5 { display: none !important; }',
        '  .avs-hero-card img { border-radius: 4px !important; bottom: 0 !important; height: 72% !important; max-width: 46% !important; object-fit: cover !important; position: absolute !important; right: 0 !important; top: auto !important; width: 46% !important; }',
        '  .avs-hero-card a, .avs-hero-card button { background: #bb1433 !important; border-radius: 0 !important; color: #ffffff !important; font-size: 12px !important; min-height: 34px !important; padding: 7px 13px !important; text-transform: uppercase !important; }',
        '  .avs-category-section { background: #ffffff !important; border: 0 !important; box-shadow: none !important; display: block !important; height: auto !important; margin: 0 !important; overflow: visible !important; padding: 0 4px !important; width: 100% !important; }',
        '  .avs-category-title { color: var(--avs-heading) !important; display: block !important; font: 900 28px/1.1 "Nunito Sans", system-ui, sans-serif !important; margin: 18px 0 16px !important; padding: 0 !important; }',
        '  .avs-category-track { display: grid !important; gap: 6px !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important; height: auto !important; overflow: visible !important; padding: 0 !important; width: 100% !important; }',
        '  .avs-category-track > * { border-radius: 5px !important; height: auto !important; margin: 0 !important; min-height: 94px !important; min-width: 0 !important; padding: 8px 4px !important; transform: none !important; width: auto !important; }',
        '  .avs-category-track img, .avs-category-track svg { max-height: 44px !important; max-width: 52px !important; }',
        '  .avs-category-track [class*="MuiTypography"] { font-size: clamp(10px, 2.8vw, 13px) !important; font-weight: 900 !important; line-height: 1.05 !important; overflow-wrap: anywhere !important; text-align: center !important; }',
        '  .avs-shops-panel { background: #ffffff !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; padding: 4px 10px 0 !important; width: 100% !important; }',
        '  .avs-shops-panel [class*="Partner"], .avs-shops-panel div:has(> span) { letter-spacing: 0 !important; }',
        '  .avs-shops-panel h3 { color: var(--avs-heading) !important; font-size: 28px !important; line-height: 1.1 !important; margin: 0 0 16px !important; }',
        '  .avs-shops-panel p, .avs-shops-panel [class*="css-h5vtrc"] { display: none !important; }',
        '  .avs-shops-panel .MuiGrid-container { display: grid !important; gap: 10px !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; margin: 0 !important; width: 100% !important; }',
        '  .avs-shops-panel .MuiGrid-container > * { max-width: none !important; padding: 0 !important; width: auto !important; }',
        '  .avs-shops-panel .MuiGrid-container > * > * { align-items: center !important; border-radius: 6px !important; display: flex !important; justify-content: center !important; min-height: 76px !important; overflow: visible !important; padding: 8px !important; }',
        '  .avs-shops-panel .MuiGrid-container [class*="MuiTypography"] { color: inherit !important; display: block !important; font-size: clamp(16px, 4.6vw, 24px) !important; font-weight: 900 !important; line-height: 1 !important; max-width: 100% !important; opacity: 1 !important; overflow: visible !important; text-align: center !important; text-indent: 0 !important; transform: none !important; visibility: visible !important; white-space: normal !important; }',
        '  .avs-shops-panel .MuiGrid-container > * > * > * { opacity: 1 !important; visibility: visible !important; }',
        '  .avs-chip-row { background: #ffffff !important; border: 0 !important; box-shadow: none !important; margin: 2px 0 0 !important; overflow-x: auto !important; padding: 10px 8px 2px !important; width: 100% !important; }',
        '  .avs-chip-row > * { gap: 16px !important; padding: 0 4px !important; }',
        '  .avs-card-strip { background: #f6f6fb !important; margin: 18px 0 0 !important; padding: 24px 0 16px !important; width: 100% !important; }',
        '  .avs-card-strip .MuiGrid-container { display: grid !important; grid-auto-flow: column !important; grid-auto-columns: 42vw !important; gap: 10px !important; margin: 0 !important; overflow-x: auto !important; padding: 0 12px !important; scroll-snap-type: x mandatory !important; width: 100% !important; }',
        '  .avs-card-strip .MuiGrid-container > * { max-width: none !important; padding: 0 !important; scroll-snap-align: start !important; width: auto !important; }',
        '  .avs-product-section { gap: 18px !important; margin: 28px 0 0 !important; padding: 0 0 0 !important; width: 100% !important; }',
        '  .avs-product-section > :first-child { min-height: 0 !important; padding: 0 0 0 !important; }',
        '  .avs-product-section h3 { color: var(--avs-heading) !important; font-size: 28px !important; line-height: 1.1 !important; padding: 0 0 0 !important; }',
        '  .avs-product-section h3 + p, .avs-product-section [class*="MuiTypography-body"] { color: #5d6472 !important; }',
        '  .avs-product-section > .MuiGrid-container { column-gap: 20px !important; display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; margin: 0 !important; padding: 0 12px !important; row-gap: 18px !important; width: 100% !important; }',
        '  .avs-product-section > .MuiGrid-container > * { max-width: none !important; padding: 0 !important; width: auto !important; }',
        '  .avs-product-section img { object-fit: contain !important; }',
        '  .avs-showcase { margin: 18px 0 0 !important; padding: 0 12px !important; }',
        '  .avs-bottom-nav { background: var(--avs-theme) !important; border-radius: 0 !important; bottom: 0 !important; box-shadow: 0 -10px 28px rgba(159, 23, 20, 0.18) !important; display: grid !important; grid-template-columns: repeat(5, 1fr) !important; height: calc(72px + env(safe-area-inset-bottom, 0px)) !important; left: 0 !important; padding: 8px 0 env(safe-area-inset-bottom, 0px) !important; position: fixed !important; right: 0 !important; top: auto !important; z-index: 2147483000 !important; }',
        '  .avs-bottom-nav a { align-items: center !important; color: #ffffff !important; display: flex !important; height: 56px !important; justify-content: center !important; min-width: 0 !important; position: relative !important; text-decoration: none !important; }',
        '  .avs-bottom-nav svg { color: #ffffff !important; display: block !important; fill: none !important; height: 31px !important; stroke: currentColor !important; stroke-linecap: round !important; stroke-linejoin: round !important; stroke-width: 2.2 !important; width: 31px !important; }',
        '  .avs-cart-badge { align-items: center !important; background: #c33d4b !important; border-radius: 999px !important; color: #ffffff !important; display: flex !important; font: 800 12px/1 "Nunito Sans", system-ui, sans-serif !important; height: 22px !important; justify-content: center !important; min-width: 22px !important; position: absolute !important; right: calc(50% - 25px) !important; top: 2px !important; }',
        '}',
        '@media (max-width: 370px) {',
        '  .avs-category-track { gap: 5px !important; }',
        '  .avs-category-track > * { min-height: 86px !important; }',
        '  .avs-shops-panel .MuiGrid-container { gap: 8px !important; }',
        '  .avs-product-section > .MuiGrid-container { column-gap: 12px !important; padding: 0 8px !important; }',
        '}',
        '@media (min-width: 769px) {',
        '  .avs-mobile-header, .avs-category-section, .avs-main-container { max-width: 1440px; }',
        '}'
      ].join('\\n');
      document.head.appendChild(style);
    }

    function markLayout() {
      var header = document.querySelector('header');
      if (header) {
        header.classList.add('avs-mobile-header');
        var searchBar = firstMatching('header .MuiToolbar-root, header [class*="MuiToolbar-root"]', function (element) {
          return hasText(element, 'Search') || !!element.querySelector('input');
        });
        if (searchBar) {
          searchBar.classList.add('avs-search-bar');
          Array.prototype.slice.call(searchBar.children).forEach(function (child) {
            if (hasText(child, 'Search')) {
              child.classList.add('avs-search-box');
            }
          });
          Array.prototype.slice.call(header.children).forEach(function (child) {
            if (child === searchBar || child.contains(searchBar)) {
              child.classList.add('avs-search-bar');
              child.classList.remove('avs-header-hidden');
              return;
            }
            child.classList.add('avs-header-hidden');
          });
        }
      }

      var categorySection = smallestMatching('body div', function (element) {
        var text = (element.textContent || '').toLowerCase();
        return text.length < 500 && text.indexOf('quick meals') !== -1 && text.indexOf('flowers') !== -1 && element.querySelectorAll('a').length >= 8;
      });
      if (categorySection) {
        var categoryTrack = categorySection;
        if (
          categorySection.parentElement &&
          (categorySection.parentElement.textContent || '').toLowerCase().indexOf('quick meals') !== -1 &&
          categorySection.parentElement.querySelectorAll('a').length === categorySection.querySelectorAll('a').length
        ) {
          categorySection = categorySection.parentElement;
        }
        categorySection.classList.add('avs-category-section');
        categoryTrack = firstMatching('.avs-category-section div', function (element) {
          return element.querySelectorAll('a').length >= 8;
        });
        if (categoryTrack) {
          categoryTrack.classList.add('avs-category-track');
        }
        if (!categorySection.querySelector('.' + CATEGORY_TITLE_CLASS)) {
          var title = document.createElement('h2');
          title.className = CATEGORY_TITLE_CLASS;
          title.textContent = 'Shop Categories';
          categorySection.insertBefore(title, categorySection.firstChild);
        }
      }

      var mainContainer = firstMatching('.MuiContainer-root, [class*="MuiContainer-root"]', function (element) {
        return hasText(element, 'Fresh picks for your home') && hasText(element, 'Top Offers');
      });
      if (mainContainer) {
        mainContainer.classList.add('avs-main-container');
        var mainStack = firstMatching('.avs-main-container > div, .avs-main-container [class*="MuiStack-root"]', function (element) {
          return hasText(element, 'Fresh picks for your home') && hasText(element, 'Top Offers');
        });
        if (mainStack) {
          mainStack.classList.add('avs-main-stack');
        }
      }

      var heroGrid = firstMatching('.avs-main-container .MuiGrid-container, .avs-main-container [class*="MuiGrid-container"]', function (element) {
        return hasText(element, 'Fresh picks for your home') && hasText(element, 'Our Shops');
      });
      if (heroGrid) {
        heroGrid.classList.add('avs-hero-grid');
        var heroItem = firstMatching('.avs-hero-grid > *, .avs-hero-grid [class*="MuiGrid-grid"]', function (element) {
          return hasText(element, 'Fresh picks for your home') && !hasText(element, 'Our Shops');
        });
        if (heroItem) {
          heroItem.classList.add('avs-hero-item');
          var heroCard = firstMatching('.avs-hero-item div', function (element) {
            return hasText(element, 'Fresh picks for your home') && hasText(element, 'Find out more');
          });
          if (heroCard) {
            heroCard.classList.add('avs-hero-card');
          }
        }
      }

      var shopsPanel = smallestMatching('body div', function (element) {
        var text = element.textContent || '';
        return text.length < 500 && text.indexOf('Our Shops') !== -1 && text.indexOf('Sainsbury') !== -1 && text.indexOf('Iceland') !== -1;
      });
      if (shopsPanel) {
        shopsPanel.classList.add('avs-shops-panel');
      }

      var mainStackForMove = document.querySelector('.avs-main-stack');
      if (mainStackForMove && categorySection && heroGrid && categorySection.parentElement !== mainStackForMove) {
        mainStackForMove.insertBefore(categorySection, heroGrid.nextSibling);
      }
      if (mainStackForMove && shopsPanel && shopsPanel.parentElement !== mainStackForMove) {
        var categoryAnchor = document.querySelector('.avs-category-section');
        mainStackForMove.insertBefore(shopsPanel, categoryAnchor ? categoryAnchor.nextSibling : heroGrid.nextSibling);
      }

      var chipRows = Array.prototype.slice.call(document.querySelectorAll('body div')).filter(function (element) {
        var text = element.textContent || '';
        return text.length < 600 && element.querySelectorAll('a,button').length >= 5 && text.indexOf('Promotion') !== -1 && text.indexOf('Buy Bulk') !== -1 && text.indexOf('E-Gift Cards') !== -1;
      });
      chipRows.forEach(function (element, index) {
        element.classList.add(index === 0 ? 'avs-chip-row' : 'avs-secondary-chip-row');
      });

      var cardStrip = smallestMatching('body div', function (element) {
        var text = element.textContent || '';
        return text.indexOf('Farm fresh dairy picks') !== -1 && text.indexOf('Light bites') !== -1 && text.indexOf('Butcher quality') !== -1;
      });
      if (cardStrip) {
        cardStrip.classList.add('avs-card-strip');
      }

      ['Top Offers', 'Top Blooms', 'New In Season'].forEach(function (title) {
        var heading = firstMatching('h1,h2,h3,h4,h5,h6', function (element) {
          return (element.textContent || '').trim() === title;
        });
        if (heading) {
          var section = heading.parentElement;
          while (section && section !== document.body && !hasText(section, title === 'Top Offers' ? 'Promo-led pricing' : title === 'Top Blooms' ? 'Fresh-cut bouquets' : 'Seasonal')) {
            section = section.parentElement;
          }
          if (section) {
            section.classList.add('avs-product-section');
          }
        }
      });

      var showcase = smallestMatching('body div', function (element) {
        return hasText(element, 'No added sugar') && hasText(element, 'cleaner grocery homepage');
      });
      if (showcase) {
        showcase.classList.add('avs-showcase');
      }

      if (!document.querySelector('.avs-bottom-nav')) {
        var bottomNav = document.createElement('nav');
        bottomNav.className = 'avs-bottom-nav';
        bottomNav.setAttribute('aria-label', 'Primary mobile navigation');
        [
          ['/', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>', 'Home'],
          ['/account/favourites', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6c-1.8-1.7-4.7-1.6-6.4.2L12 7.2 9.6 4.8C7.9 3 5 2.9 3.2 4.6c-1.9 1.8-1.9 4.8 0 6.7L12 20l8.8-8.7c1.9-1.9 1.9-4.9 0-6.7Z"/></svg>', 'Favourites'],
          ['/catalog', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10"/><path d="M4 12h7"/><path d="M4 17h6"/><circle cx="16.5" cy="15.5" r="3.5"/><path d="m19.2 18.2 2.3 2.3"/></svg>', 'Search'],
          ['/cart', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8h13l-1.2 12H5.2L4 8h2.5Z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/></svg><span class="avs-cart-badge">0</span>', 'Cart'],
          ['/account', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>', 'Account']
        ].forEach(function (item) {
          var link = document.createElement('a');
          link.href = item[0];
          link.setAttribute('aria-label', item[2]);
          link.innerHTML = item[1];
          bottomNav.appendChild(link);
        });
        document.body.appendChild(bottomNav);
      }
    }

    function apply() {
      addStyle();
      markLayout();
    }

    apply();
    window.addEventListener('load', apply);
    setTimeout(apply, 300);
    setTimeout(apply, 1000);
    setTimeout(apply, 2500);
    true;
  })();
`;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const { height, width } = useWindowDimensions();
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isCompact = width < 380;
  const isTablet = Math.min(width, height) >= 768;

  const responsiveStyles = useMemo(
    () => ({
      contentCard: {
        maxWidth: isTablet ? 520 : undefined,
        paddingHorizontal: isCompact ? 20 : 28,
      },
      errorMessage: {
        fontSize: isCompact ? 14 : 15,
        lineHeight: isCompact ? 20 : 22,
      },
      errorTitle: {
        fontSize: isCompact ? 18 : isTablet ? 24 : 20,
      },
      loadingText: {
        fontSize: isCompact ? 14 : 15,
      },
      retryButton: {
        alignSelf: isCompact ? 'stretch' as const : 'center' as const,
        minHeight: isCompact ? 48 : 46,
      },
    }),
    [isCompact, isTablet],
  );

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) {
        return false;
      }

      webViewRef.current?.goBack();
      return true;
    });

    return () => {
      backSubscription.remove();
    };
  }, [canGoBack]);

  const handleNavigationStateChange = (navigationState: WebViewNavigation) => {
    setCanGoBack(navigationState.canGoBack);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const injectMobileStorefrontLayout = () => {
    webViewRef.current?.injectJavaScript(MOBILE_STOREFRONT_SCRIPT);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    injectMobileStorefrontLayout();
    setTimeout(injectMobileStorefrontLayout, 250);
    setTimeout(injectMobileStorefrontLayout, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={BRAND_COLOR} style="light" />

      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        allowsBackForwardNavigationGestures
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        domStorageEnabled
        injectedJavaScript={MOBILE_STOREFRONT_SCRIPT}
        injectedJavaScriptBeforeContentLoaded={RESPONSIVE_VIEWPORT_SCRIPT}
        javaScriptEnabled
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadEnd={handleLoadEnd}
        onLoadStart={() => {
          setHasError(false);
          setIsLoading(true);
        }}
        onContentProcessDidTerminate={() => {
          webViewRef.current?.reload();
        }}
        onNavigationStateChange={handleNavigationStateChange}
        overScrollMode="always"
        pullToRefreshEnabled
        scalesPageToFit
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        startInLoadingState
        style={[styles.webview, { height, width }]}
      />

      {isLoading && !hasError ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator color={BRAND_COLOR_DARK} size="large" />
          <Text style={[styles.loadingText, responsiveStyles.loadingText]}>Loading {BRAND_TEXT}...</Text>
        </View>
      ) : null}

      {hasError ? (
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={styles.errorOverlay}
          style={styles.errorScrollView}
        >
          <View style={[styles.errorCard, responsiveStyles.contentCard]}>
            <Text style={[styles.errorTitle, responsiveStyles.errorTitle]}>Unable to load the storefront</Text>
            <Text style={[styles.errorMessage, responsiveStyles.errorMessage]}>
              Check the device connection or Render app status, then retry.
            </Text>
            <Pressable onPress={handleRetry} style={[styles.retryButton, responsiveStyles.retryButton]}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BRAND_COLOR,
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : undefined,
  },
  errorCard: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  errorMessage: {
    color: '#4a5565',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  errorScrollView: {
    ...StyleSheet.absoluteFillObject,
  },
  errorTitle: {
    color: BRAND_COLOR_DARK,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    bottom: 0,
    gap: 12,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    color: BRAND_COLOR_DARK,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: BRAND_COLOR_DARK,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  webview: {
    flex: 1,
  },
});
