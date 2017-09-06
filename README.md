# RESTool

<p align="center">
  <img src="https://raw.githubusercontent.com/dsternlicht/RESTool/master/screenshots//restool_screenshot.png?raw=true" alt="RESTool Sample App"/>
</p>

The best tool in the neighborhood. Managing your RESTful APIs has never been so easy.
RESTool gives you an out of the box UI that connects to your API with a simple configuration file.

The idea behind it is simple. Given the fact that each entity in your API has a RESTful implementation, RESTool will help you to develop a tool for managing these entities in no time by simply edit a configuration file. No JavaScript. No CSS. No html. Just a pure JSON file.

## Getting started
Clone RESTool repo to your machine, and run npm install.

```
git clone https://github.com/dsternlicht/RESTool.git

cd RESTool

npm install
```

We used Angular 2 for developing this awesome tool, so make sure to install Angular CLI by running `npm install -g @angular/cli`.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Configuration
One of the best things about RESTool (and the reason we actually we built it) is that you don't need to develop anything. Everything is configurable and may be set simply by editing the `config.json` file under the `/src` folder.

Here's a detailed list of properties you could add to your configuration file (just in case we added a `config-sample.json` file you could learn from).

##### `name` (string) 
The name of your app.

##### `pages` (array)
A list of pages in your app, each page will be presented as a separated tab, and will have his own methods and properties.

#### Pages

Each 'page' is an object. And could have the following properties:
##### `name` (string)
The name of the page. Will be presented in the app's menu.

##### `id` (string)
A unique identifier for the page. RESTool will use it to navigate between pages.

##### `description` (string)
A short description about the page and its usage.

##### `default` (boolean)
Set to true if you want this page to be the first to load in your app. If you haven't marked any page as 'default' we'll just use the first one.

##### `requestHeaders` (object)
A list of key-value headers you wish to add to every request we're making. For example: ``{ Authentication: 'SECRET_KEY', 'X-USER-ID': 'USER_ID' }``.

##### `methods` (object)
A list of all methods which are available in your RESTfull API. Available methods:
* get
* post
* put
* post

#### Methods

Each method has the following common properties:

##### `url` (string)
The url for making the request. The url could contain parameters that we'll extract if needed. For example: ``http://website.com/users/:id``. Note that the parameter name in the url should match the one you're returning in your API.

##### `actualMethod` (string | 'get', 'post', 'put', 'delete')
We aware that not everyone implements REST as they should. So if for some reason you need to make a 'post' request in order to update an exiting document, you may use this property.

##### `requestHeaders` (object)
Same as above, but for specific method. 

#### GET requests

There are two types of GET requests we support. Get all, and get single. Each one has its own purpose.

#### GET ALL (getAll)
We'll use this request in order to a list of items from the API. This type of GET request has the following additional parameters:

##### `dataPath` (string)
Use this field to let us know where we should take the data from. For example, if your server is returning the following JSON object:
```
{
    success: true,
    data: []
}
```
Your data path will be `data`.

If your server returning:
```
{
    success: true,
    data: {
        created: SOME_DATE,
        items: []
    }
}
```
Your data path will be `data.items`.

##### `queryParams` (array)
An array of query param objects you want to add to your GET request. 

#### Query Params

Each query param item is an object and could have the following properties:

###### ``name`` (string)
The key / name of the parameter that should be sent.

###### ``value`` (string)
A default value.

###### ``label`` (string)
Query params will be editable in RESTool UI. This is the label the user will see in the form.

###### ``type`` (string)
In order to render the query params form, we allow you to add the "type" field where you could define the type of the field.
Available options:
 
``text`` - A simple text input (if "type" is not defined, text will be the default).
``hidden`` - Set to true if you want the query param to be sent but not to be editable.
``boolean`` - This will render a checkbox.
``encode`` - If you want the value to be encoded before being sent, use this type.
``select`` - This will render a select box with predefined options.

###### ``options`` (array)
Add the `options` field if you chose a `select` as a type. This field should contain an array of options to be displayed in the select box.

For example:

```
queryParams: {
  name: 'heroes',
  label: 'Select your hero',
  type: 'select',
  options: ['Spiderman', 'Batman', 'Ironman']
}
```


##### `display` (object)
RESTool is going to present the data somehow. This is the object that defines how. It contains the following properties:

###### `type` (string | 'table')
How would you like to present the data (at the moment we only support table view).

###### `fields` (array)
The list of fields you want to present in your main view. Each one is an object and could have the following properties:

#### Display fields

###### `name` (string)
The name of the field that contains the value in the results.

###### `type` (string | 'text', 'url', 'image')
The type of the returning value.

###### `label` (string)
A label that describes the field. Will be presented as table headers in RESTool.

###### `dataPath` (string)
Use this field to let us know what is the path to get to the field value. For example, if this is a single result:

```
[
    {
        name: 'Daniel',
        email: 'daniel@awesome.com',
        details: {
            isAwesome: true,
            numberOfChildrens: 1
        }
    },
    ...
]
```

And you want to present the `numberOfChildrens` field in the display view, your data path for this field is `details`, and the `name` should be `numberOfChildrens`.

#### GET SINGLE (getSingle)
We'll use this type of get request to get a single item. By default, if you won't config this request, when editing an item we'll take the row data from the original "get all" request.
The properties a "get single" request could have are `url`, `dataPath`, `requestHeaders`, and `queryParams`.

#### POST/PUT requests additional configuration
##### `fields` (array)
The list of fields you want us to send as the body of the request.
Each one is an object and could have the following properties:

#### Fields

###### `name` (string)
The name of the field to be sent.

###### `type` (string | 'text', 'array')
The type of the field (will change the UI in the form accordingly).

###### `label` (string)
A label that describes the field. Will be presented as a label in the editor form.

###### `dataPath` (string)
Use this field to let us know what is the path to set to the field value. For example, if the body of the request looks like below:

```
{
    name: 'Daniel',
    details: {
        thumbnail: {
            url: 'http://bit.ly/2fqDxfQ'
        }
    }
}
```

So the field name will be `url`, the type will be `text`, and the data path will be `details.thumbnail`.

###### `arrayType` (string | 'text', 'object')
For 'array' field type, you should specify another property called `arrayType` so we'll how to present & send the data in the POST and PUT forms.

## Build
When you're feeling your project is ready, just run `ng build -prod` to build the project. The build artifacts will be stored in the `dist/` directory.
This is the directory you want to deploy to your server.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploy
* Use the "dist" folder that been created after the build, or just clone the "dist" folder in this project.
* Replace the "config.json" file with yours.
* Copy / deploy the "dist" folder to your servers.
* Enjoy!

## Created By
* Daniel Sternlicht
* Oreli Levi
* Jonathan Sellam
