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

const showStatus = (message: string, type: 'success' | 'error') => {
  const statusElement = document.getElementById('status') as HTMLDivElement;
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

const addToCalendar = async (eventText: string) => {
  try {
    if (!eventText.trim()) {
      showStatus('イベント内容を入力してください', 'error');
      return;
    }

    // Extract date/time from the input text
    const { textWithoutDate, startDateTime, endDateTime } = extractDateTime(eventText);

    // Get current tab information for details
    const currentTab = await getCurrentTabMessage();

    // Create Google Calendar URL
    const calendarUrl = createGoogleCalendarUrl(textWithoutDate, currentTab, startDateTime, endDateTime);

    // Open calendar in new tab
    await chrome.tabs.create({ url: calendarUrl.href });

    // Show success message
    showStatus('カレンダーを開きました！', 'success');

    // Close popup after a short delay
    setTimeout(() => {
      window.close();
    }, 1000);

  } catch (error) {
    console.error('Error adding to calendar:', error);
    showStatus('エラーが発生しました', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const eventTextArea = document.getElementById('eventText') as HTMLTextAreaElement;
  const addButton = document.getElementById('addButton') as HTMLButtonElement;
  const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

  // Focus on textarea when popup opens
  eventTextArea.focus();

  // Add button click handler
  addButton.addEventListener('click', async () => {
    const eventText = eventTextArea.value;
    
    // Disable button during processing
    addButton.disabled = true;
    addButton.textContent = '処理中...';
    
    await addToCalendar(eventText);
    
    // Re-enable button
    addButton.disabled = false;
    addButton.textContent = '追加';
  });

  // Cancel button click handler
  cancelButton.addEventListener('click', () => {
    window.close();
  });

  // Enter key handler (Ctrl+Enter to submit)
  eventTextArea.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      addButton.click();
    }
  });

  // Auto-resize textarea
  eventTextArea.addEventListener('input', () => {
    eventTextArea.style.height = 'auto';
    eventTextArea.style.height = eventTextArea.scrollHeight + 'px';
  });
});