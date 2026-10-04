import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useI18n } from './I18nProvider';
import { translateStaticText } from './translations';

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Record<string, string>>();
const translatableAttributes = ['aria-label', 'placeholder', 'title'];

const shouldSkipNode = (node: Node) => {
  const parent = node.parentElement;
  if (!parent) return true;
  return Boolean(parent.closest('[data-no-translate], script, style, noscript, textarea, code, pre'));
};

const restoreEnglish = (root: ParentNode) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    const original = originalText.get(node);
    if (original) node.nodeValue = original;
    node = walker.nextNode() as Text | null;
  }

  root.querySelectorAll?.('*').forEach((element) => {
    if (element.closest('[data-no-translate]')) return;

    const attributes = originalAttributes.get(element);
    if (!attributes) return;

    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  });
};

const translateMyanmar = (root: ParentNode) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    if (!shouldSkipNode(node)) {
      const original = originalText.get(node) ?? node.nodeValue ?? '';
      originalText.set(node, original);
      const translated = translateStaticText(original, 'my');
      if (translated !== original.trim()) node.nodeValue = original.replace(original.trim(), translated);
    }

    node = walker.nextNode() as Text | null;
  }

  root.querySelectorAll?.('*').forEach((element) => {
    if (element.closest('[data-no-translate]')) return;

    const storedAttributes = originalAttributes.get(element) ?? {};
    let nextAttributes = storedAttributes;

    translatableAttributes.forEach((name) => {
      const currentValue = element.getAttribute(name);
      if (!currentValue) return;

      const originalValue = storedAttributes[name] ?? currentValue;
      const translated = translateStaticText(originalValue, 'my');
      if (translated === originalValue) return;

      if (!storedAttributes[name]) {
        nextAttributes = { ...nextAttributes, [name]: originalValue };
        originalAttributes.set(element, nextAttributes);
      }
      element.setAttribute(name, translated);
    });
  });
};

export const StaticTextTranslator = () => {
  const { language } = useI18n();
  const location = useLocation();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (language === 'en') {
        restoreEnglish(document.body);
        return;
      }

      translateMyanmar(document.body);
    });
  }, [language, location.pathname, location.search]);

  return null;
};
