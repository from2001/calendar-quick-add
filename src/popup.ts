import { extractDateTime } from "./extract";
import { createGoogleCalendarUrl } from "./google_calendar";

const getCurrentTabInfo = async (): Promise<chrome.tabs.Tab[]> => {
  console.log('Querying active tab...');
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  console.log('Found tabs:', tabs);
  return tabs;
}

const getCurrentTabMessage = async (): Promise<string> => {
  const tabs = await getCurrentTabInfo();
  const currentTitle = tabs[0].title || "";
  const currentUrl = tabs[0].url || "";
  const currentTab = `${currentTitle}\n${currentUrl}`;
  console.log('Formatted tab message:', currentTab);
  return currentTab;
}

const addEvent = async (text: string) => {
  console.log('addEvent called with text:', text);
  
  if (!text.trim()) {
    console.log('Text is empty, returning');
    return;
  }

  try {
    console.log('Extracting date/time from text...');
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(text);
    console.log('Extracted:', { textWithoutDate, startDateTime: startDateTime?.format(), endDateTime: endDateTime?.format() });
    
    console.log('Getting current tab info...');
    const currentTab = await getCurrentTabMessage();
    console.log('Current tab:', currentTab);
    
    console.log('Creating calendar URL...');
    const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);
    console.log('Calendar URL:', calendarUrl.href);

    console.log('Creating new tab...');
    chrome.tabs.create({ url: calendarUrl.href });
    
    console.log('Closing popup...');
    // Close the popup after creating the event
    window.close();
  } catch (error) {
    console.error('Error in addEvent:', error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded');
  
  const eventTextInput = document.getElementById('eventText') as HTMLTextAreaElement;
  const addButton = document.getElementById('addButton') as HTMLButtonElement;

  console.log('Elements found:', { eventTextInput, addButton });

  if (!eventTextInput || !addButton) {
    console.error('Required elements not found!');
    return;
  }

  // Focus on input when popup opens
  eventTextInput.focus();

  // Handle add button click
  addButton.addEventListener('click', () => {
    console.log('Add button clicked with value:', eventTextInput.value);
    addEvent(eventTextInput.value);
  });

  // Handle Enter key (with Ctrl/Cmd modifier to avoid interfering with line breaks)
  eventTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      console.log('Keyboard shortcut triggered');
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
  
  console.log('Event listeners attached successfully');
});