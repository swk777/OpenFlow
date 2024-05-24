import { ConfigurationType } from '../configType';

import { IConfigBaseExtend } from '@/type/configDefinition';
import ConfigCheckbox from './ConfigCheckbox';
import ConfigFolderSelect from './ConfigFolderSelect';
import ConfigInput from './ConfigInput';
import ConfigKnowledgeBase from './ConfigKnowledgeBase';
import ConfigLabel from './ConfigLabel';
import ConfigNumber from './ConfigNumber';
import ConfigSelect from './ConfigSelect';
import ConfigTags from './ConfigTags';
import ConfigTextarea from './ConfigTextarea';

export function getTargetConfigClass(def: IConfigBaseExtend<any>) {
	const { type } = def;
	switch (type) {
		case ConfigurationType.INPUT:
			return ConfigInput;
		case ConfigurationType.TAGS:
			return ConfigTags;
		case ConfigurationType.LABEL:
			return ConfigLabel;
		case ConfigurationType.SELECT:
			return ConfigSelect;
		case ConfigurationType.NUMBER:
			return ConfigNumber;
		case ConfigurationType.BOOLEAN:
			return ConfigCheckbox;
		case ConfigurationType.KNOWLEDGE_BASE:
			return ConfigKnowledgeBase;
		case ConfigurationType.TEXT_AREA:
			return ConfigTextarea;
		case ConfigurationType.FOLDER_PATH_CHOOSER:
			return ConfigFolderSelect;
		default:
			return null;
	}
}
