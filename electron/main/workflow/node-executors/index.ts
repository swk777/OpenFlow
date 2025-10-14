import { InternalNodelets } from '@/constants/nodelets';

import { executeChatResponse } from './chat-response';
import { executeClaude } from './claude';
import { executeDeepSeek } from './deep-seek';
import { executeDisplayOnScreen } from './display-on-screen';
import { executeEmail } from './email';
import { executeFileInput } from './file-input';
import { executeFireCrawlLoader } from './firecrawl-loader';
import { executeIf } from './if';
import { executeKnowledgeBase } from './knowledge-base';
import { executeOllama } from './ollama';
import { executeOpenAI } from './openAI';
import { saveToFile } from './save-to-file';
import { saveToObsidian } from './save-to-obsidian';
import { executeSearch } from './search';
import { executeSplitText } from './split-text';
import { executeTextInput } from './text-input';
import { executeTextAreaInput } from './textarea-input';
import { executeURLLoader } from './url-loader';
import { executeUserInput } from './user-input';
import { executeYoutubeLoader } from './youtube-loader';

export const InternalNodeletExecutor = {
	[InternalNodelets.UserInput]: { executor: executeUserInput },
	[InternalNodelets.TextInput]: { executor: executeTextInput },
	[InternalNodelets.FileInput]: { executor: executeFileInput },
	[InternalNodelets.TextAreaInput]: { executor: executeTextAreaInput },
	[InternalNodelets.OpenAI]: { executor: executeOpenAI },
	[InternalNodelets.Claude]: { executor: executeClaude },
	[InternalNodelets.Ollama]: { executor: executeOllama },
	[InternalNodelets.KnowledgeBase]: { executor: executeKnowledgeBase },
	[InternalNodelets.ChatResponse]: {
		executor: executeChatResponse,
	},
	[InternalNodelets.SaveToFile]: { executor: saveToFile },
	[InternalNodelets.SaveToObsidian]: { executor: saveToObsidian },
	[InternalNodelets.DisplayOnScreen]: { executor: executeDisplayOnScreen },
	[InternalNodelets.FireCrawl]: { executor: executeFireCrawlLoader },
	[InternalNodelets.URLLoader]: { executor: executeURLLoader },
	[InternalNodelets.YoutubeLoader]: { executor: executeYoutubeLoader },
	[InternalNodelets.Email]: { executor: executeEmail },
	[InternalNodelets.DeepSeek]: { executor: executeDeepSeek },
	[InternalNodelets.SplitText]: { executor: executeSplitText },
	[InternalNodelets.If]: { executor: executeIf },
	[InternalNodelets.Search]: { executor: executeSearch },
};
