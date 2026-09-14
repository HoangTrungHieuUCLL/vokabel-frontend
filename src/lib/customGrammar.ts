// User-added grammar sections. There's no backend endpoint for grammar
// content (it's static app data), so custom sections just live in this
// browser's localStorage.
export interface CustomGrammarTopic {
  id: string
  title: string
  body: string
}

const KEY = 'vokabel.customGrammarTopics'

export function loadCustomGrammarTopics(): CustomGrammarTopic[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomGrammarTopics(topics: CustomGrammarTopic[]): void {
  localStorage.setItem(KEY, JSON.stringify(topics))
}
