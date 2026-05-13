import { normalizeCampaignSlug, slugifyDisplayName } from "@/lib/p2p/slug"

describe("slugifyDisplayName", () => {
  it("lowercases and replaces non-alphanumeric runs with hyphens", () => {
    expect(slugifyDisplayName("  Hello World!!  ")).toBe("hello-world")
  })

  it("trims leading and trailing hyphens", () => {
    expect(slugifyDisplayName("---abc---")).toBe("abc")
  })
})

describe("normalizeCampaignSlug", () => {
  it("uses raw slug when valid", () => {
    expect(normalizeCampaignSlug("My_Page", "ignored")).toBe("my-page")
  })

  it("falls back to display name when raw empty", () => {
    expect(normalizeCampaignSlug("", "Team Alpha")).toBe("team-alpha")
  })
})
