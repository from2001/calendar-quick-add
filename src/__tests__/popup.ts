// Test for popup functionality without DOM dependencies

import { extractDateTime } from "../extract";
import { createGoogleCalendarUrl } from "../google_calendar";

describe("Popup functionality", () => {
  it("should extract date and create calendar URL from popup text input", () => {
    const inputText = "ミーティング 2025/03/10 14:30";
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(inputText);
    
    expect(textWithoutDate).toBe("ミーティング ");
    expect(startDateTime?.format("YYYY-MM-DD HH:mm")).toBe("2025-03-10 14:30");
    expect(endDateTime?.format("YYYY-MM-DD HH:mm")).toBe("2025-03-10 15:30");
  });

  it("should create correct calendar URL with tab info", () => {
    const inputText = "テスト会議 2025/03/10 14:30";
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(inputText);
    
    // Simulate current tab info
    const currentTab = "Test Page\nhttps://example.com/test";
    
    const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);
    
    expect(calendarUrl.origin + calendarUrl.pathname).toBe("https://calendar.google.com/calendar/r/eventedit");
    expect(calendarUrl.searchParams.get("text")).toBe("テスト会議 ");
    expect(calendarUrl.searchParams.get("details")).toBe("Test Page\nhttps://example.com/test");
    expect(calendarUrl.searchParams.get("dates")).toBe("20250310T143000/20250310T153000");
  });

  it("should handle text without dates", () => {
    const inputText = "単純なタスク";
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(inputText);
    
    expect(textWithoutDate).toBe("単純なタスク");
    expect(startDateTime).toBeUndefined();
    expect(endDateTime).toBeUndefined();
    
    const currentTab = "Test Page\nhttps://example.com/test";
    const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);
    
    expect(calendarUrl.searchParams.get("text")).toBe("単純なタスク");
    expect(calendarUrl.searchParams.get("dates")).toBeNull();
  });
});