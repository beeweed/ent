const API_BASE_URL = 'https://8000-ixagkrgj2n7vnx401pw98.e2b.app';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function fetchModels(apiKey: string) {
  const response = await fetch(`${API_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch models' }));
    throw new Error(error.detail || 'Failed to fetch models');
  }
  
  return response.json();
}

export async function* streamChat(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to send message' }));
    throw new Error(error.detail || 'Failed to send message');
  }
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (!reader) {
    throw new Error('No response body');
  }
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        
        if (data === '[DONE]') {
          return;
        }
        
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          if (e instanceof SyntaxError) {
            continue;
          }
          throw e;
        }
      }
    }
  }
}