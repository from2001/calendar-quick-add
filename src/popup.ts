import { extractDateTime } from "./extract";
import { createGoogleCalendarUrl } from "./google_calendar";

const getCurrentTabInfo = async (): Promise<chrome.tabs.Tab[]> => {
  return await chrome.tabs.query({ active: true, lastFocusedWindow: true });
}

const getCurrentTabMessage = async (): Promise<string> => {
  const tabs = await getCurrentTabInfo();
  const currentTitle = tabs[0].title || "";
  const currentUrl = tabs[0].url || "";
  const currentTab = `${currentTitle}\n${currentUrl}`;
  return currentTab;
}

const addEvent = async (text: string) => {
  if (!text.trim()) {
    return;
  }

  const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(text);
  const currentTab = await getCurrentTabMessage();
  const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);

  chrome.tabs.create({ url: calendarUrl.href });
  
  // Close the popup after creating the event
  window.close();
};

document.addEventListener('DOMContentLoaded', () => {
  const eventTextInput = document.getElementById('eventText') as HTMLTextAreaElement;
  const addButton = document.getElementById('addButton') as HTMLButtonElement;

  // Focus on input when popup opens
  eventTextInput.focus();

  // Handle add button click
  addButton.addEventListener('click', () => {
    addEvent(eventTextInput.value);
  });

  // Handle Enter key (with Ctrl/Cmd modifier to avoid interfering with line breaks)
  eventTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      addEvent(eventTextInput.value);
    }
  });

  // Enable/disable button based on input
  eventTextInput.addEventListener('input', () => {
    addButton.disabled = !eventTextInput.value.trim();
  });
  
  // Initial button state
  addButton.disabled = !eventTextInput.value.trim();
});