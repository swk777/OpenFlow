import { IConfigDefinitionBase, IConfigDependOnMap } from '@/type/configDefinition';
import { getNewState } from '@/utils/state';
import { get, set } from 'lodash';
import { partition } from 'ramda';
import React, { ReactElement, useCallback, useMemo } from 'react';

interface ConfigContext {
	config: any;
	integrationConfig: any;
	updateField: (field: string, value: any) => void;
	batchUpdateFields: (fields: string[], values: any[]) => void;
	isFieldVisible: (field: any) => boolean;
	getFieldValue: (field: string) => any;
	getIntegrationValue: (field: string) => any;
	upstreamStages?: any[];
	readonly: boolean;
	refresh: () => void;
}

export const isDependencyMet = (dependencyMap: IConfigDependOnMap = {}, config: any): boolean => {
	const fields = Object.keys(dependencyMap);
	if (!fields.length) return true;
	return fields.every((field) => dependencyMap[field]?.includes(get(config, field)));
};

function isExclusionMet(exclusionMap: IConfigDependOnMap = {}, config: any): boolean {
	return Object.keys(exclusionMap).some((field) => exclusionMap[field]?.includes(get(config, field)));
}

export const isFieldVisibleInConfig = (definition: IConfigDefinitionBase, config: any): boolean =>
	isDependencyMet(definition.dependsOnMap, config) && !isExclusionMet(definition.hiddenOnMap, config);

export function cleanupConfig(config: any, definitions?: IConfigDefinitionBase[]): any {
	if (!definitions?.length) return config;
	const [visibleDefinitions, hiddenDefinitions] = partition((definition) => isFieldVisibleInConfig(definition, config), definitions);

	return getNewState(config, (draft) => {
		hiddenDefinitions.forEach(({ fieldName }) => {
			if (!get(draft, fieldName) && visibleDefinitions.some((d) => d.fieldName === fieldName)) return;
			set(draft, fieldName, undefined);
		});

		visibleDefinitions.forEach(({ fieldName, defaultValue }) => {
			if (get(draft, fieldName) === undefined && defaultValue !== undefined) {
				set(draft, fieldName, defaultValue);
			}
		});
	});
}

const defaultConfigContext: ConfigContext = {
	config: {},
	integrationConfig: {},
	updateField: () => {},
	batchUpdateFields: () => {},
	isFieldVisible: () => true,
	getFieldValue: () => {},
	getIntegrationValue: () => {},
	upstreamStages: [],
	readonly: false,
	refresh: () => {},
};

export function createConfigContext(
	config: any,
	integrationConfig: any,
	onChange: (state: any) => void,
	readonly: boolean,
	refresh: () => void,
): ConfigContext {
	const batchUpdateFields = (fields: string[], values: any[]) => {
		if (fields.every((field, index) => get(config, field) === values[index])) return;
		onChange(
			getNewState(config, (draft) => {
				fields.forEach((field, index) => {
					set(draft, field, values[index]);
				});
			}),
		);
	};

	return {
		config,
		integrationConfig,
		isFieldVisible: (definition) => isFieldVisibleInConfig(definition, config),
		getFieldValue: (field) => get(config, field),
		getIntegrationValue: (field) => get(integrationConfig, field),
		updateField: (field, value) => batchUpdateFields([field], [value]),
		batchUpdateFields,
		readonly,
		refresh,
	};
}

const ConfigContext = React.createContext<ConfigContext>(defaultConfigContext);
export default ConfigContext;

interface ProviderProps {
	config: any;
	integrationConfig: any;
	definitions: IConfigDefinitionBase[];
	onChange: (newConfig: any, sourceInputs?: any) => void;
	refresh: () => void;
	readonly?: boolean;
	children: ReactElement;
}

export function ConfigContextProvider({
	config,
	integrationConfig,
	definitions,
	onChange,
	refresh,
	readonly,
	children,
}: ProviderProps): ReactElement {
	const handleConfigChange = useCallback((newConfig: any) => onChange(cleanupConfig(newConfig, definitions)), [onChange, definitions]);

	const value = useMemo(
		() => createConfigContext(config, integrationConfig, handleConfigChange, readonly, refresh),
		[config, handleConfigChange, readonly, refresh],
	);

	return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
