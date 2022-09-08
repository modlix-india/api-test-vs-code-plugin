# REST API Tester Plugin

This repository contains the REST API Tester plugin source code. The UI is similar to Postman. Easy to use and secure to distribute among your team for free.

This plugin consists of two editors, one **apit** file editor and **var** file editor.

**"apit"** file will hold the data required to make a request.

**"var"** file contains the variables and their values. These can be used only in the Workspace mode or when you open a folder in the VSCode. **global.var** is the file that contains all the default values for the variables. Rest can be created with **var** extension and the editor provides the UI to edit them. You can select the variable file you want to override the values from **global.var** in the **apit** file editor before clicking on the **SEND** button. All these **var** files have to be in the root folder of the workspace to be recognised by the **apit** editor.

The beauty of this plugin in is you can push all the api tests into your choice of repository and can be shared as simple files.

## Prerequisite

Install Visual Studio Code

## Getting Started

![REST API Tester](apit.gif)

## License

Copyright (c) Fincity. All rights reserved.

Licenced under [MIT](LICENSE) License.
