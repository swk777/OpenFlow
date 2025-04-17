import { INodelet } from '@/type/nodelet';

export const buildDefaultConfig = (nodelet: INodelet) => {
	const defaultConfig = {};
	nodelet.configDefinitions.forEach((configDefinition) => {
		if (configDefinition.defaultValue !== undefined) {
			defaultConfig[configDefinition.fieldName] = configDefinition.defaultValue;
		}
	});
	return defaultConfig;
};
export const checkIntegration = (nodelet, integrations) => {
	const integration = integrations.find((intn) => intn.id === nodelet.id);
	const { config = {} } = integration;
	const { configDefinitions } = integration;
	return configDefinitions.every((configDefinition) => {
		if (!configDefinition.required || configDefinition.defaultValue) return true;
		return !config[configDefinition.fieldName];
	});
};
export function getRandomColor(id: string) {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	}

	const hue = hash % 360;
	const saturation = 10 + (hash % 20);
	const lightness = 50 + (hash % 30);

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const isEmpty = (obj: any) =>
	!obj || (Array.isArray(obj) && obj.length === 0) || (typeof obj === 'object' && Object.keys(obj).length === 0);

export const getMissIntegrations = (nodes, integrations) =>
	nodes
		.filter((n) => {
			const integration = integrations.find((i) => i.id === n.data.nodeletId);
			return integration && integration.configDefinitions.some((cd) => cd.required && isEmpty(integration.config[cd.fieldName]));
		})
		.map((n) => {
			return integrations.find((i) => i.id === n.data.nodeletId);
		});
