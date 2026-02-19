import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServiceCard from '../ServiceCard';
import { LanguageProvider } from '../../i18n/LanguageContext';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

function renderWithProviders(ui) {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
}

const mockService = {
  id: 1,
  name: 'Weather API',
  description: 'Get real-time weather data for any location worldwide.',
  url: 'https://api.example.com/weather',
  price_usdc: '0.01',
  tags: ['data', 'weather', 'live'],
  owner_address: '0x1234567890abcdef1234567890abcdef12345678',
  tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  verified_status: 'reachable',
};

const mockFreeService = {
  id: 2,
  name: 'Free Joke API',
  description: 'Get random jokes for free.',
  url: 'https://api.example.com/jokes',
  price_usdc: '0',
  tags: ['fun', 'free'],
  owner_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

describe('ServiceCard', () => {
  it('should render without crash', () => {
    const { container } = renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(container).toBeTruthy();
  });

  it('should display the service name', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(screen.getByText('Weather API')).toBeInTheDocument();
  });

  it('should show the price badge for paid services', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(screen.getByText('$0.01')).toBeInTheDocument();
  });

  it('should show "Free" badge when price is 0', () => {
    renderWithProviders(
      <ServiceCard service={mockFreeService} />
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should show tags', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    // "data" appears both as category label and as a tag, so use getAllByText
    expect(screen.getAllByText('data').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('weather')).toBeInTheDocument();
    expect(screen.getByText('live')).toBeInTheDocument();
  });

  it('should display the description', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(screen.getByText('Get real-time weather data for any location worldwide.')).toBeInTheDocument();
  });

  it('should show owner address truncated', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('should show verified link when tx_hash is valid', () => {
    renderWithProviders(
      <ServiceCard service={mockService} />
    );
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('should show online status when healthStatus is online', () => {
    renderWithProviders(
      <ServiceCard service={mockService} healthStatus="online" />
    );
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show offline status when healthStatus is offline', () => {
    renderWithProviders(
      <ServiceCard service={mockService} healthStatus="offline" />
    );
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should show +N when there are more than 3 tags', () => {
    const serviceWithManyTags = {
      ...mockService,
      tags: ['ai', 'data', 'weather', 'live', 'premium'],
    };
    renderWithProviders(
      <ServiceCard service={serviceWithManyTags} />
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
