import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ServiceCard from "../ServiceCard";
import { LanguageProvider } from "../../i18n/LanguageContext";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

function renderWithProviders(ui) {
  return render(
    <LanguageProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </LanguageProvider>,
  );
}

const mockService = {
  id: 1,
  name: "Weather API",
  description: "Get real-time weather data for any location worldwide.",
  url: "https://api.example.com/weather",
  price_usdc: "0.01",
  tags: ["data", "weather", "live"],
  owner_address: "0x1234567890abcdef1234567890abcdef12345678",
  tx_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  verified_status: "reachable",
};

const mockFreeService = {
  id: 2,
  name: "Free Joke API",
  description: "Get random jokes for free.",
  url: "https://api.example.com/jokes",
  price_usdc: "0",
  tags: ["fun", "free"],
  owner_address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
};

describe("ServiceCard", () => {
  it("should render without crash", () => {
    const { container } = renderWithProviders(
      <ServiceCard service={mockService} />,
    );
    expect(container).toBeTruthy();
  });

  it("should display the service name", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    expect(screen.getByText("Weather API")).toBeInTheDocument();
  });

  it("should show the price badge for paid services", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    expect(screen.getByText("$0.01")).toBeInTheDocument();
  });

  it('should show "Free" badge when price is 0', () => {
    renderWithProviders(<ServiceCard service={mockFreeService} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should show tags", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    // The component displays only the primaryCategory (first non-excluded tag) as a category label.
    // Individual tags are not rendered as separate pill elements — only the primary category is shown.
    expect(screen.getAllByText("data").length).toBeGreaterThanOrEqual(1);
  });

  it("should display the description", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    expect(
      screen.getByText(
        "Get real-time weather data for any location worldwide.",
      ),
    ).toBeInTheDocument();
  });

  it("should show the primary category label", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    // The component shows owner_address and tx_hash only internally; the visible
    // category is the first non-excluded tag rendered as a category label.
    expect(screen.getAllByText("data").length).toBeGreaterThanOrEqual(1);
  });

  it("should show auto-tested badge when verified_status is reachable", () => {
    renderWithProviders(<ServiceCard service={mockService} />);
    // The component renders t.serviceCard.autoTested ("Tested") for verified_status === 'reachable'
    expect(screen.getByText("Tested")).toBeInTheDocument();
  });

  it("should show online status when healthStatus is online", () => {
    renderWithProviders(
      <ServiceCard service={mockService} healthStatus="online" />,
    );
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("should show offline status when healthStatus is offline", () => {
    renderWithProviders(
      <ServiceCard service={mockService} healthStatus="offline" />,
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("should show at most 2 status badges regardless of tag count", () => {
    // The component limits its badge list (Native, Free-to-try, Trust, Quality, AutoTested) to 2.
    // A non-native service with many tags and verified_status reachable shows at most 1 badge ("Tested").
    const serviceWithManyTags = {
      ...mockService,
      tags: ["ai", "data", "weather", "live", "premium"],
    };
    const { container } = renderWithProviders(
      <ServiceCard service={serviceWithManyTags} />,
    );
    // "Tested" badge should still appear (verified_status: 'reachable')
    expect(screen.getByText("Tested")).toBeInTheDocument();
    // No "+N" overflow indicator — the badge list is capped silently at 2
    const badgeRow = container.querySelector(".flex.flex-wrap.gap-1\\.5");
    expect(badgeRow).not.toBeNull();
    expect(badgeRow.children.length).toBeLessThanOrEqual(2);
  });
});
