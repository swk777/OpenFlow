import { IConfigBaseProps, IConfigDefinitionBase } from '@/type/configDefinition';
import { Button, Group, Input } from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import useDef, { useDependOnMap } from '../useDef';

export default function ConfigFolderSelect({ definition, style }: IConfigBaseProps<IConfigDefinitionBase>) {
	const [fieldValue, updateFv, readonly] = useDef(definition);
	const prevFv = useRef(fieldValue);
	const [inputValue, setInputValue] = useState(fieldValue);
	const [error, setError] = useState<String>();
	const { disabledOnMap = {} } = definition;
	const onChange = useCallback(
		(v: string): void => {
			updateFv(v);
			setInputValue(v);
		},
		[updateFv],
	);
	const [hasDisabledOn, fullfilled] = useDependOnMap(disabledOnMap);
	const disabled = hasDisabledOn && fullfilled;
	useEffect(() => {
		if (fieldValue === undefined && definition.defaultValue !== undefined) {
			updateFv(definition.defaultValue);
		}
	}, [fieldValue, updateFv, definition]);
	useEffect(() => {
		if (fieldValue !== undefined && disabled) {
			updateFv(undefined);
		}
		if (prevFv.current !== fieldValue) {
			prevFv.current = fieldValue;
			setInputValue(fieldValue);
		}
	}, [fieldValue, updateFv, disabled]);
	const handleSelectFolder = () => {
		window.ipcRenderer.openDialog().then((filePath) => {
			onChange(filePath);
		});
	};
	return (
		<Input.Wrapper label={definition?.label} className="text-left" description={definition?.description} required={definition.required}>
			<Group align="center">
				<Input
					className="flex-1"
					value={inputValue}
					placeholder={definition.placeholder}
					disabled={readonly || disabled}
					error={error}
					style={style}
				/>
				<Button onClick={handleSelectFolder} className="mt-2">
					Select
				</Button>
			</Group>
		</Input.Wrapper>
	);
}
