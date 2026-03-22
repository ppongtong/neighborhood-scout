import { GoogleGenAI } from '@google/genai';
const client = new GoogleGenAI({ apiKey: 'test' });
console.log('Interactions:', (client as any).interactions);
