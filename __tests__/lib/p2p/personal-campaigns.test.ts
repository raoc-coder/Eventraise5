import {
  isUuid,
  loadActivePersonalCampaign,
  type PersonalCampaignReader,
  type AttributedPersonalCampaign,
} from "@/lib/p2p/personal-campaigns";

const VALID_PC_ID = "11111111-1111-4111-8111-111111111111";
const VALID_EVENT_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_EVENT_ID = "33333333-3333-4333-8333-333333333333";

function makeReader(
  result:
    | { data: AttributedPersonalCampaign | null; error: null }
    | { data: null; error: { message: string } },
): PersonalCampaignReader {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => result,
        }),
      }),
    }),
  } satisfies PersonalCampaignReader;
}

describe("lib/p2p/personal-campaigns", () => {
  describe("isUuid", () => {
    it("accepts canonical v4 UUIDs", () => {
      expect(isUuid(VALID_PC_ID)).toBe(true);
      expect(isUuid("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")).toBe(true);
    });

    it("rejects empty / malformed / non-string values", () => {
      expect(isUuid("")).toBe(false);
      expect(isUuid("not-a-uuid")).toBe(false);
      expect(isUuid("11111111-1111-1111-1111-111111111111")).toBe(false); // version digit wrong
      expect(isUuid(undefined)).toBe(false);
      expect(isUuid(null)).toBe(false);
      expect(isUuid(42 as unknown)).toBe(false);
    });
  });

  describe("loadActivePersonalCampaign", () => {
    const okRow: AttributedPersonalCampaign = {
      id: VALID_PC_ID,
      event_id: VALID_EVENT_ID,
      status: "active",
    };

    it("returns the row when active and event matches", async () => {
      const reader = makeReader({ data: okRow, error: null });
      const result = await loadActivePersonalCampaign(
        reader,
        VALID_PC_ID,
        VALID_EVENT_ID,
      );
      expect(result).toEqual(okRow);
    });

    it("returns null when personalCampaignId is missing", async () => {
      const reader = makeReader({ data: okRow, error: null });
      expect(
        await loadActivePersonalCampaign(reader, undefined, VALID_EVENT_ID),
      ).toBeNull();
      expect(
        await loadActivePersonalCampaign(reader, null, VALID_EVENT_ID),
      ).toBeNull();
      expect(
        await loadActivePersonalCampaign(reader, "", VALID_EVENT_ID),
      ).toBeNull();
    });

    it("returns null for non-UUID inputs without hitting the DB", async () => {
      let calls = 0;
      const reader: PersonalCampaignReader = {
        from: () => {
          calls += 1;
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: okRow, error: null }),
              }),
            }),
          };
        },
      };
      expect(
        await loadActivePersonalCampaign(reader, "not-a-uuid", VALID_EVENT_ID),
      ).toBeNull();
      expect(
        await loadActivePersonalCampaign(reader, VALID_PC_ID, "bad-event"),
      ).toBeNull();
      expect(calls).toBe(0);
    });

    it("returns null when the lookup returns an error", async () => {
      const reader = makeReader({
        data: null,
        error: { message: "boom" },
      });
      expect(
        await loadActivePersonalCampaign(reader, VALID_PC_ID, VALID_EVENT_ID),
      ).toBeNull();
    });

    it("returns null when no row is found", async () => {
      const reader = makeReader({ data: null, error: null });
      expect(
        await loadActivePersonalCampaign(reader, VALID_PC_ID, VALID_EVENT_ID),
      ).toBeNull();
    });

    it("returns null when the campaign is not active", async () => {
      const reader = makeReader({
        data: { ...okRow, status: "paused" },
        error: null,
      });
      expect(
        await loadActivePersonalCampaign(reader, VALID_PC_ID, VALID_EVENT_ID),
      ).toBeNull();
    });

    it("returns null when the campaign belongs to a different event", async () => {
      const reader = makeReader({
        data: { ...okRow, event_id: OTHER_EVENT_ID },
        error: null,
      });
      expect(
        await loadActivePersonalCampaign(reader, VALID_PC_ID, VALID_EVENT_ID),
      ).toBeNull();
    });
  });
});
