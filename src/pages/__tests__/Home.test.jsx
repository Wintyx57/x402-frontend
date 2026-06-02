import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "../Home";
import { LanguageProvider } from "../../i18n/LanguageContext";

// Mock config
vi.mock("../../config", () => ({
  API_URL: "http://localhost:3000",
}));

// Mock useServices
vi.mock("../../hooks/useServices", () => ({
  useServices: vi.fn(),
}));

// Mock usePublicStats
vi.mock("../../hooks/usePublicStats", () => ({
  usePublicStats: vi.fn(),
}));

// Mock useReveal (returns a ref)
vi.mock("../../hooks/useReveal", () => ({
  useReveal: () => ({ current: null }),
}));

// Mock useSEO
vi.mock("../../hooks/useSEO", () => ({
  default: vi.fn(),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}
globalThis.IntersectionObserver = MockIntersectionObserver;

import { useServices } from "../../hooks/useServices";
import { usePublicStats } from "../../hooks/usePublicStats";

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("Home", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    useServices.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    usePublicStats.mockReturnValue({
      data: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render without crash", () => {
    const { container } = renderWithProviders(<Home />);
    expect(container).toBeTruthy();
  });

  it("should display the hero title", () => {
    renderWithProviders(<Home />);
    // The redesigned hero uses SplitHero with h2 headings (provider + agent sides).
    // The provider side title reads "Monetize" / "any API" / "in 2 min."
    const headings = screen.getAllByRole("heading", { level: 2 });
    const providerHeading = headings.find((h) =>
      h.textContent.includes("Monetize"),
    );
    expect(providerHeading).toBeDefined();
  });

  it("should display the hero agent side title", () => {
    renderWithProviders(<Home />);
    // The agent side of SplitHero displays the current i18n title.
    const headings = screen.getAllByRole("heading", { level: 2 });
    const agentHeading = headings.find((h) =>
      h.textContent.includes("Any agent."),
    );
    expect(agentHeading).toBeDefined();
  });

  it("should display the explore CTA link", () => {
    renderWithProviders(<Home />);
    // The explore button text from en translations
    const links = screen.getAllByRole("link");
    const exploreLink = links.find(
      (link) =>
        link.textContent.includes("Browse") ||
        link.textContent.includes("Explore") ||
        link.textContent.includes("API"),
    );
    expect(exploreLink).toBeDefined();
  });

  it("should show stats section when stats data is loaded", () => {
    usePublicStats.mockReturnValue({
      data: {
        services: 50,
        nativeEndpoints: 69,
      },
    });

    useServices.mockReturnValue({
      data: [{ id: 1, name: "Test", price_usdc: "0", tags: ["ai"] }],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<Home />);

    // Stats bar should be rendered when stats data exists
    // Check for "Services Listed" or related stat text
    expect(screen.getByText("Blockchain")).toBeInTheDocument();
  });

  it("should display free services section when free services exist", () => {
    useServices.mockReturnValue({
      data: [
        {
          id: 1,
          name: "Free Service 1",
          price_usdc: "0",
          tags: ["ai"],
          url: "https://api.example.com/1",
          owner_address: "0x1234567890abcdef1234567890abcdef12345678",
        },
      ],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<Home />);
    expect(screen.getByText("Free Service 1")).toBeInTheDocument();
  });

  it("should display error banner when services fetch fails", () => {
    useServices.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("API error"),
    });

    renderWithProviders(<Home />);
    expect(
      screen.getByText("Failed to load services. Please try again later."),
    ).toBeInTheDocument();
  });
});
