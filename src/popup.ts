import { extractDateTime } from "./extract";
import { createGoogleCalendarUrl } from "./google_calendar";

const getCurrentTabInfo = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs);
      }
    });
  });
}

const getCurrentTabMessage = async (): Promise<string> => {
  try {
    const tabs = await getCurrentTabInfo();
    const currentTitle = tabs[0].title || "";
    const currentUrl = tabs[0].url || "";
    const currentTab = `${currentTitle}\n${currentUrl}`;
    return currentTab;
  } catch (error) {
    console.error('Error getting current tab:', error);
    return "Error getting current tab info";
  }
}

const addEvent = async (text: string) => {
  console.log('addEvent called with:', text);
  
  if (!text.trim()) {
    console.log('Empty text, returning');
    alert('Please enter some text for the event');
    return;
  }

  try {
    console.log('Starting event creation process...');
    
    // Test if basic functions work
    console.log('Testing extractDateTime...');
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(text);
    console.log('Extracted:', { textWithoutDate, startDateTime, endDateTime });
    
    console.log('Testing getCurrentTabMessage...');
    const currentTab = await getCurrentTabMessage();
    console.log('Current tab:', currentTab);
    
    console.log('Testing createGoogleCalendarUrl...');
    const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);
    console.log('Calendar URL:', calendarUrl.href);

    // Try to create the tab
    console.log('Attempting to create new tab...');
    
    chrome.tabs.create({ url: calendarUrl.href }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating tab:', chrome.runtime.lastError);
        alert('Error creating tab: ' + chrome.runtime.lastError.message);
      } else {
        console.log('Tab created successfully:', tab);
        window.close();
      }
    });
    
  } catch (error) {
    console.error('Error creating calendar event:', error);
    alert('Error: ' + (error instanceof Error ? error.message : String(error)));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up popup...');
  
  const eventTextInput = document.getElementById('eventText') as HTMLTextAreaElement;
  const addButton = document.getElementById('addButton') as HTMLButtonElement;

  if (!eventTextInput || !addButton) {
    console.error('Required elements not found');
    alert('Error: Required elements not found');
    return;
  }

  console.log('Elements found, setting up event listeners...');

  // Focus on input when popup opens
  eventTextInput.focus();

  // Handle add button click
  addButton.addEventListener('click', (event) => {
    console.log('Button clicked! Input value:', eventTextInput.value);
    event.preventDefault();
    addEvent(eventTextInput.value);
  });

  // Handle Enter key (with Ctrl/Cmd modifier to avoid interfering with line breaks)
  eventTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      console.log('Keyboard shortcut used');
      event.preventDefault();
      addEvent(eventTextInput.value);
    }
  });

  // Enable/disable button based on input
  eventTextInput.addEventListener('input', () => {
    const hasValue = !!eventTextInput.value.trim();
    addButton.disabled = !hasValue;
    console.log('Input changed, button disabled:', !hasValue);
  });
  
  // Initial button state
  const hasInitialValue = !!eventTextInput.value.trim();
  addButton.disabled = !hasInitialValue;
  console.log('Initial setup complete, button disabled:', !hasInitialValue);
});