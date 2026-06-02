import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TabColor = "green" | "orange" | "blue" | "purple";

interface Tab {
  label: string;
  color: TabColor;
}

interface CompactTabsProps {
  tabs: Tab[];
  activeIndex: number;
  onSelect: (index: number) => void;
  visible: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color map — dot fills matching prototype CSS variables
// ─────────────────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<TabColor, string> = {
  green: "#34D399",
  orange: "#FF9900",
  blue: "#60A5FA",
  purple: "#A78BFA",
};

// ─────────────────────────────────────────────────────────────────────────────
// CompactTabs
// ─────────────────────────────────────────────────────────────────────────────

export default function CompactTabs({
  tabs,
  activeIndex,
  onSelect,
  visible,
}: CompactTabsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!visible) return null;

  return (
    <div
      role="tablist"
      aria-label="Registration mode"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginBottom: 32,
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        const isHovered = hoveredIndex === i;

        const tabStyle: React.CSSProperties = {
          padding: "8px 20px",
          borderRadius: 12,
          background: isActive
            ? "rgba(255,153,0,0.06)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${
            isActive
              ? "#FF9900"
              : isHovered
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.07)"
          }`,
          color: isActive ? "#FF9900" : isHovered ? "#e5e7eb" : "#8b8f96",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.3s",
          display: "flex",
          alignItems: "center",
          gap: 6,
        };

        return (
          <button
            key={i}
            role="tab"
            id={`compact-tab-${i}`}
            aria-selected={isActive}
            aria-controls={`compact-tabpanel-${i}`}
            style={tabStyle}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Colored dot */}
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: DOT_COLORS[tab.color],
                flexShrink: 0,
              }}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
