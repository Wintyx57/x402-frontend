import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

describe('translations', () => {
  it('should have both en and fr translations', () => {
    expect(translations).toHaveProperty('en');
    expect(translations).toHaveProperty('fr');
  });

  it('should have en as a non-empty object', () => {
    expect(typeof translations.en).toBe('object');
    expect(Object.keys(translations.en).length).toBeGreaterThan(0);
  });

  it('should have fr as a non-empty object', () => {
    expect(typeof translations.fr).toBe('object');
    expect(Object.keys(translations.fr).length).toBeGreaterThan(0);
  });

  it('should have the same top-level keys in EN and FR', () => {
    const enKeys = Object.keys(translations.en).sort();
    const frKeys = Object.keys(translations.fr).sort();
    expect(enKeys).toEqual(frKeys);
  });

  it('all EN top-level keys should exist in FR', () => {
    const enKeys = Object.keys(translations.en);
    for (const key of enKeys) {
      expect(translations.fr).toHaveProperty(key);
    }
  });

  it('all FR top-level keys should exist in EN', () => {
    const frKeys = Object.keys(translations.fr);
    for (const key of frKeys) {
      expect(translations.en).toHaveProperty(key);
    }
  });

  it('should have nav.services in both languages', () => {
    expect(translations.en.nav.services).toBeDefined();
    expect(translations.fr.nav.services).toBeDefined();
  });

  it('should have home.heroTitle in both languages', () => {
    expect(translations.en.home.heroTitle).toBeDefined();
    expect(translations.fr.home.heroTitle).toBeDefined();
  });

  it('should have serviceCard keys in both languages', () => {
    expect(translations.en.serviceCard.free).toBeDefined();
    expect(translations.fr.serviceCard.free).toBeDefined();
    expect(translations.en.serviceCard.viewApi).toBeDefined();
    expect(translations.fr.serviceCard.viewApi).toBeDefined();
  });

  it('should have connect keys in both languages', () => {
    expect(translations.en.connect.connectWallet).toBeDefined();
    expect(translations.fr.connect.connectWallet).toBeDefined();
  });

  it('should have docs keys in both languages', () => {
    expect(translations.en.docs).toBeDefined();
    expect(translations.fr.docs).toBeDefined();
    expect(typeof translations.en.docs).toBe('object');
    expect(typeof translations.fr.docs).toBe('object');
  });

  it('should have services page keys in both languages', () => {
    expect(translations.en.services).toBeDefined();
    expect(translations.fr.services).toBeDefined();
    expect(typeof translations.en.services).toBe('object');
    expect(typeof translations.fr.services).toBe('object');
  });
});
