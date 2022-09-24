# REST API Tester Plugin

This repository contains the REST API Tester plugin source code. The UI is similar to Postman. Easy to use and secure to distribute among your team for free.

This plugin consists of two editors, one **apit** file editor and **var** file editor.

**"apit"** file will hold the data required to make a request.

**"var"** file contains the variables and their values. These can be used only in the Workspace mode or when you open a folder in the VSCode. **global.var** is the file that contains all the default values for the variables. Rest can be created with **var** extension and the editor provides the UI to edit them. You can select the variable file you want to override the values from **global.var** in the **apit** file editor before clicking on the **SEND** button. All these **var** files have to be in the root folder of the workspace to be recognised by the **apit** editor.

The beauty of this plugin in is you can push all the api tests into your choice of repository and can be shared as simple files.

## Prerequisite

Install Visual Studio Code

## Running "Post Send Script"

You can run simple javascript to test or save some settings. More fullfledged testing framework will be enabled for testing the responses. For now some simple tasks can be achieved. This code is executed when the request is sent or failed.

Three different objects are available to start with.

1. console, it has only one method log to log Output in the Output Panel. In the "OUTPUT" panel select for "Rest API Tester" to see the logged messsages from script.
   ![OUTPUT Panel](outputpanel.png)

2. settings, it is an object with the following methods to retrive and save the settings variables from and to ".settings" file in the workspace. Any actions on the settings objects work if the apit file is opened in the workspace mode/folder mode.

   - _settings.getSettings()_ returns the entire settings object stored in the ".settings" file.
   - _settings.getValue('<key>')_ returns the value of a settings variable stored in the ".settings" file. Key has to be a string.
   - _settings.setValue('<key>', <value>)_ sets the value of a settings variable and saves to ".settings" file. Key has to be a string, and value has to any serailizable object that can be serialized with _JSON.stringify_ method.
   - _settings.removeValue('<key>')_ removes the value from the ".settings" file.

3. reponse, it is the response object returned from the axios. Please refer the [Axios documentation](https://axios-http.com/docs/res_schema) for more details on the response object.

### Example

The following code with check if the accessToken is available and stores in the settings.

```
if (response?.data?.accessToken)
   settings.setValue('authToken', response.data.accessToken);
```

It can be used as a variable

```
{{settings.authToken}}
```

## Getting Started

![REST API Tester](apit.gif)

## License

Copyright (c) Fincity. All rights reserved.

Licenced under [MIT](LICENSE) License.
