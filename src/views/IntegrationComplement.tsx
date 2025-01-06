import { AppContext } from '@/context/AppContext';
import Configuration from '@/node/config/Configuration';
import { IIntegration } from '@/type/integration';
import { Button, Divider, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { isEmpty } from 'lodash';
import { useContext, useState } from 'react';

type Props = {
	integrations: IIntegration[];
	onSave: () => void;
};

export default function IntegrationComplement({ integrations, onSave }: Props) {
	const { updateIntegration } = useContext(AppContext);

	const [configs, setConfigs] = useState(integrations.map((i) => i.config));
	return (
		<>
			{integrations.map((integration, index) => (
				<Stack key={integration.id} gap="sm">
					<h2 className="text-xl font-bold">{integration.label}</h2>
					<Configuration
						key={integration.id}
						definitions={integration?.configDefinitions || []}
						config={integration?.config || {}}
						style={{ padding: '20px 0' }}
						onChange={(newConfig) => {
							setConfigs([...configs.slice(0, index), newConfig, ...configs.slice(index + 1)]);
						}}
					/>
					<Divider className="my-2" />
				</Stack>
			))}
			<Button
				variant="filled"
				size="sm"
				className="mt-3 w-20"
				onClick={() => {
					const missIntegrations = integrations.filter((integration, index) =>
						integration.configDefinitions.some((cd) => cd.required && isEmpty(configs[index][cd.fieldName])),
					);
					if (missIntegrations.length > 0) {
						notifications.show({
							title: 'Missing Required Fields',
							message: 'Please fill in all required fields.',
							color: 'red',
						});
						return;
					}
					Promise.all(
						integrations.map((integration, index) => {
							return (
								updateIntegration &&
								updateIntegration(integration?.id, {
									...integration,
									config: configs[index],
								})
							);
						}),
					)
						.then(() => {
							onSave();
							notifications.show({
								title: 'Save Successfully',
								message: '',
								autoClose: 1000,
							});
						})
						.catch((e) => {
							notifications.show({
								title: 'Save failed',
								message: '',
								autoClose: 1000,
							});
						});
				}}
			>
				Save
			</Button>
		</>
	);
}
