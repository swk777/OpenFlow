# OpenFlow

⚠️ **OpenFlow is currently in Development**: Expect breaking changes and bugs!

OpenFlow is a local-first, extendable LLM (Large Language Model) orchestration app designed to streamline the running of LLM workflows locally.

![demo.gif](/demo.gif)
![webloader.gif](/webloader.gif)

## Philosophy

- **Local First**: Save all data locally if you prefer.
- **LLM Orchestration**: Utilize a pipeline approach for efficient LLM management.
- **Custom Extension**: Offers an open schema to load extensions easily.
- **Easy to Migrate**: Designed with migration simplicity in mind.

## 🛫 Quick Setup

Follow these steps to get OpenFlow up and running on your local machine:

```bash
# Clone the project
git clone https://github.com/swk777/OpenFlow.git

# Enter the project directory
cd OpenFlow

# Install dependencies
npm install

# Start the development server
npm run dev

```

## Basic Concepts
    
### Nodelet 
  
  
  Nodelet is a versatile component designed for building  workflows .  
#### Node Types:
- Input Nodes: These nodes can handle various inputs such as user entries, files, and variables, facilitating the initial data entry into the workflow.
  
- Processor Nodes: Processor nodes are versatile and can be customized to perform a variety of tasks, including accessing large models, filtering data, merging data streams, and summarizing information. Developers can configure these nodes with custom settings, such as text fields for names or dropdowns for model selection.
  
- Output Nodes: Output nodes are designed to display results on the screen or save data to files and other services like Notion, ensuring flexible data dissemination.
  
#### Customizable Nodelet: 
  
  
  Each nodelet can be tailored with a unique configuration, allowing developers to script in JavaScript. This script is executed within the node’s virtual machine, utilizing both the context of the node and its specific settings to process data effectively.  
### Workflow 
  
  
  workflows are designed to automate and streamline complex processes by orchestrating a sequence of tasks, each represented by nodelets. These workflows facilitate efficient data processing and decision-making across various applications by allowing customized configuration and execution of multiple interconnected actions  
#### Chatbot Workflow: 
  
  This workflow enables interactive Q&A sessions using nodelets that manage dialogue, understand context, and generate responses.  
#### Automation Workflow: 
  
  
  Focused on automating tasks with minimal human input, this workflow links specialized nodelets to execute sequential operations efficiently. 

### Integration
  
Configuration related to nodelets.  

### Template
The template is a repository of a pre-built workflow. You can run the workflow directly from the template.  
  
## Extension System
OpenFlow’s extension system, centered around “nodelets,” allows users to customize and extend the application to meet their specific needs. Here’s how you can develop and integrate a custom nodelet into OpenFlow:

### Create an extension
To create an extension, you need to define two primary files:

To create a plugin, users need to define two files:
1. config.json: This file contains the nodelet configuration.
2. main.js: This file contains the runtime logic for the nodelet.
   
#### config.json
The config.json file defines the structure and properties of the nodelet. Here's an example:
```JSON
{
  "id": "customInput",
  "category": "Custom Input",
  "workflowCategory": "All",
  "name": "Custom Input",
  "image": "base64",
  "inputs": [
    {
      "id": "input",
      "name": "input",
      "type": "String"
    }
  ],
  "outputs": [
    {
      "id": "output",
      "name": "output",
      "type": "String"
    }
  ],
  "configDefinitions": [
    {
      "name": "text",
      "fieldName": "text",
      "label": "text",
      "type": "INPUT",
      "placeholder": "Enter text",
      "isDisplayed": true
    }
  ]
}
```

#### main.js
The main.js file contains an execute function that defines the runtime logic for the nodelet. The function receives a context object with the following TypeScript interface:
```ts
export interface NodeletExecuteContextFull {
  node: Node; // The current node instance
  nodelet: INodelet; // The nodelet configuration
  nodeContext: any; // Node-specific context
  globalContext: any; // Global context
  nodeConfig: any; // Node configuration
  integrationConfig: any; // Integration configuration
  nodeInputs: InputsObject; // Input values
  context: any; // Additional context
  setNodeContext: (nodeContext: any) => void; // Function to update node context
  setGlobalContext: (globalContext: any) => void; // Function to update global context
}
```

Here's an example of a simple execute function:
```js
function execute(context) {
  const { setNodeContext, nodeConfig, nodeInputs } = context;
  const { input } = nodeInputs;
  setNodeContext &&
    setNodeContext({
      outputs: { output: (nodeConfig?.text || '') + 'abc' + input },
    });
  return;
}
```

## Contributing

Contributions are what make the open-source community such a powerful place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## License

Distributed under the MIT License. See LICENSE for more information.
