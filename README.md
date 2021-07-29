# Angular Workspace, Ionic Cordova Applications with Hook Script for Android

## Summary

This recipe produces a monorepo with the following key pieces:
- angular workspace with common angular.json 
- an angular application
- an ionic angular application with cordova platform build for android
- a shared library 

The workspace and projects are built with
- angular 12.1
- node 16.2 (causes karma error requiring --force whenever using npm install)

Use a lower version of node.

Overall there are no magic configuration changes required except for dealing with the output from the ionic cordova build. The output does not make its way to the /www folder and so is not deployed to the android platform as it should. A simple workaround is to create a hook script that runs after the angular build and copies the output from the /dist folder to the /www folder.

### Final project structure (For android)

This will be the final file structure at three levels deep showing the two applications, a shared library and also the cordova output in the integrations folder.

```text
.
├── README.md
├── angular.json
├── dist
│  
├── integrations
│   └── app-two
│       ├── config.xml
│       ├── package.json
│       └── resources
├── ionic.config.json
├── node_modules
│ 
├── package-lock.json
├── package.json
├── projects
│   ├── app-common
│   │   ├── README.md
│   │   ├── karma.conf.js
│   │   ├── ng-package.json
│   │   ├── node_modules
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── src
│   │   ├── tsconfig.lib.json
│   │   ├── tsconfig.lib.prod.json
│   │   └── tsconfig.spec.json
│   ├── app-one
│   │   ├── karma.conf.js
│   │   ├── src
│   │   ├── tsconfig.app.json
│   │   └── tsconfig.spec.json
│   └── app-two
│       ├── karma.conf.js
│       ├── package.json
│       ├── scripts
│       ├── src
│       ├── tsconfig.app.json
│       └── tsconfig.spec.json
└── tsconfig.json
```

## Steps

These are the steps to create a functioning workspace with cross-platform output for further development.

### Step 1 - new angular workspace

```console
ng new ionic-monorepo --create-Application=false 
cd ./ionic-monorepo
```

Install the npm packages and use force if required

```console
npm install -force
```

### Step 2 - new angular library

```console
ng generate library app-common --prefix=al
ng build app-common
```

### Step 3 - new angular application

```console
ng generate application --prefix=app --routing --style=css app-one
ng build app-one
ng serve --project app-one
```

### Step 4 - consume library in angular application

Open app-one in an editor, and edit the module file and add AppCommonModule to the imports.

_/projects/app-one/src/app/app.module.ts_

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppCommonModule } from 'app-common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppCommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

There should be no issues adding the component or intellisense because the library definition was added automatically to the common typescript configuration file:

_tsconfig.json_
```json
"compilerOptions": {
    "paths": {
      "app-common": [
        "dist/app-common/app-common",
        "dist/app-common"
      ]
    },
```

Edit the app-one project to consume the component,

_/projects/app-one/src/app/app.component.html_
```html
<al-app-common></al-app-common>

<router-outlet></router-outlet>
```

And the change is now visible:

```console
ng serve --project app-one

```

### Step 5 - new ionic angular application

At this point there is no ionic content in the application and ionic has definitely not been initialised


```console
ionic init --multi-app 
```

At this point the ionic configuration file should look like:

_ionic.config.json_
```json
{
  "projects": {}
}
```

Add the ionic app

```console
ng generate application --prefix=app --routing --style=css app-two
ng add @ionic/angular --project=app-two
```

Run the following but don't make the app the default project

```console
cd projects/app-two
ionic init app-two --type=angular --project-id=app-two
cd ../..
```

At this point the ionic configuration file should look like:

_ionic.config.json_
```json
{
   "projects": {
    "app-two": {
      "name": "app-two",
      "integrations": {},
      "type": "angular",
      "root": "projects/app-two"
    }
  }
}
```

Serve the app

```console
ionic serve --project app-two
```

### Step 6 - consume library in ionic application

Alter the ionic application, app-two, in the same way as app-one:

_/projects/app-two/src/app/app.module.ts_
```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { AppCommonModule } from 'app-common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppCommonModule,
    IonicModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

and also 

_/projects/app-two/src/app/app.component.html_

```html
<al-app-common></al-app-common>
In ionic app
```

Serve the app and verify

```console
ionic serve --project app-two
```

### Step 7 - Integrate cordova

Run the following ionic command to create an integration in its own folder

```console
ionic integrations enable cordova --add --root=integrations/app-two --project=app-two
```

At this point the ionic configuration file will look like this:

_ionic.config.json_
```json
{
  "projects": {
    "app-two": {
      "name": "app-two",
      "integrations": {
        "cordova": {
          "root": "integrations/app-two"
        }
      },
      "type": "angular",
      "root": "projects/app-two"
    }
  }
}
```

and there will be a new /integrations folder. This is where the cross-platform output will go.

Initialise /integrations/app-two folder as an npm package:

```console
cd integrations/app-two
npm init
cd ../..
```

At this point commit any changes because a build creates a lot of folders. Cordova also wants
the app-two project to have an initialised npm package.json

```console
cd projects/app-two
npm init
cd ../..
```

Add the android platform

```console
ionic cordova platform add android --project app-two
```

commit your changes and then confirm that a build completes successfully. 
```console
ionic cordova build android --project app-two
```

There will no web asset output on _/integrations/app-two/platforms/android

## Step 7 - Add an ionic build hook to copy the assets

Create a new script at 

_/projects/app-two/scripts/build-after.js_
```javascript
const { exec } = require('child_process');
const rimraf = require('rimraf');

handleOutput = (error, stdout, stderr) => {

  if (error) {
    console.log(error.message);
  } else if (stderr) {
    console.log(stderr);
 } else {
    console.log(stdout);
  }
}

module.exports = function(context) {

  console.log('**** in build-after ****');
  console.log(context);  
    
  if (context.build.platform === 'android') {

    console.log('**** copying assets to integrations ****');
    
    const project_dir = `${context.project.dir}`;
    
    const source_dir = `${project_dir}/../../dist/${context.build.project}`;
    const target_dir = `${project_dir}/../../integrations/${context.build.project}`;

    rimraf(`{target_dir}\www`, handleOutput);
    exec(`cp -r ${source_dir}/* ${target_dir}/www`, handleOutput);
 }

}

```

The context object that is output to the console contains a lot of useful information. Now alter **ionic.config.json** to call the post build hook.

_ionic.config.json_
```json
{
  "projects": {
    "app-two": {
      "name": "app-two",
      "integrations": {
        "cordova": {
          "root": "integrations/app-two"
        }
      },
      "type": "angular",
      "root": "projects/app-two",
      "hooks": {
        "build:after": "./scripts/build-after.js" 
      }
    }
  }
}
```

## Step 8 - Rebuild and open android platform in Android Studio

```console
ionic cordova build android --project app-two
```

## Bonus Steps for Adding IOS

These are the additional steps for adding an integration for IOS

## Step 9 - integrate IOS

Add the ios platform

```console 
ionic cordova platform add ios --project app-two
```

Update the hook script to include ios

_/projects/app-two/scripts/build-after.js_
```javascript
const { exec } = require('child_process');
const rimraf = require('rimraf');

handleOutput = (error, stdout, stderr) => {

  if (error) {
    console.log(error.message);
  } else if (stderr) {
    console.log(stderr);
 } else {
    console.log(stdout);
  }
}

module.exports = function(context) {

  console.log('**** in build-after ****');
  console.log(context);  
    
  if (context.build.platform === 'android' || context.build.platform === 'ios') {

    console.log('**** copying assets to integrations ****');
    
    const project_dir = `${context.project.dir}`;
    
    const source_dir = `${project_dir}/../../dist/${context.build.project}`;
    const target_dir = `${project_dir}/../../integrations/${context.build.project}`;

    rimraf(`{target_dir}\www`, handleOutput);
    exec(`cp -r ${source_dir}/* ${target_dir}/www`, handleOutput);
 }

}
```

Commit all before the build because of the folders that get added. I am working on a macbook so this will work :)

```console
ionic cordova build ios --project app-two
```

## Building from a clone

Clone your source as usual or run this:

```console
git clone https://github.com/blackram/ionic-cordova-monorepo.git
cd ionic-cordova-monorepo
```

Must update packages including the library app-common library first

```console
cd projects/app-common
npm install
cd ../../

npm install
```

Now build what you want

_app-common (shared library)_
```console
ng build --project app-common
```
_app-one (angular application)_
```console
ng build --project app-one
```

_app-two (ionic application)_
```console
ionic cordova build --project app-two android
ionic cordova build --project app-two ios
```

or serve
```console
ng serve --project app-one
ionic serve --project app-two
```

### Issues:

You may encounter an issue with the PlatformApi missing (https://stackoverflow.com/questions/46799446/cordova-unable-to-load-platformapi)

Remove both platforms and then rebuilding will *fix* it:
```console
ionic cordova platform rm android --project app-two
ionic cordova platform rm ios --project app-two
```

I have only seen this since using a clean install. I suspect it is becuase of the way I am ignoring some folders. YMMV




