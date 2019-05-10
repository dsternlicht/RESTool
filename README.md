# RESTool

<p align="center">
  <img src="https://raw.githubusercontent.com/dsternlicht/RESTool/master/screenshots/restool_screenshot.png?raw=true" alt="RESTool Sample App"/>
</p>

The best tool in the neighborhood. Managing your RESTful APIs has never been so easy.
RESTool gives you an out of the box UI that connects to your RESTful API with a simple configuration file.

The idea behind it is simple. Given the fact that each entity in your API has a RESTful implementation, RESTool will provide you UI tool for managing these entities in no time by simply editing a configuration file. No front end engineers, no JavaScript,  no CSS, no html. Just a simple JSON file.

**Live Demo**: [https://restool-sample-app.herokuapp.com/](https://restool-sample-app.herokuapp.com/)

## Getting started
Clone RESTool repo to your machine, and run npm install.

```
git clone https://github.com/dsternlicht/RESTool.git

cd RESTool

npm install
```

We used Angular for developing this awesome tool, so make sure to install Angular CLI by running `npm install -g @angular/cli`.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Configuration
One of the best things about RESTool (and the reason we actually we built it) is that you don't need to develop anything. Everything is configurable and may be set simply by editing the `config.json` file under the `/src` folder.

Here's a detailed list of properties you could add to your configuration file (just in case we added a `config-sample.json` file you could learn from).

##### `name` (string) 
The name of your app.

##### `pages` (array)
A list of pages in your app, each page will be presented as a separated tab, and will have his own methods and properties.

##### `errorMessageDataPath` (string, or array of strings)
The path within an error response object to look for an error message. If multiple are provided, each will be tried in order until a message is found.

##### `unauthorizedRedirectUrl` (string)
Path to navigate to when the api returns a 401 (Unauthorized) error. You can use `:returnUrl` to pass a return location. For example: `"/login/myLoginPage?return=:returnUrl"`

##### `baseUrl` (string)
Base url of the api. This will prefix the url of all the api methods defined for all pages.  This is normally the domain plus a base path. For example: `"https://restool-sample-app.herokuapp.com/api"`
> If different pages use different base urls this should not be used. Instead expliclty define full urls for each method.

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
The url for making the request. The url could contain parameters that we'll extract if needed. For example: ``http://website.com/users/:id``. Note that the parameter name in the url should match the one you're returning in your API. If ``baseUrl`` is defined then only provide the api path. For example: ``/users/:id``

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

If your URL includes the name of the parameter, it will be used as part of the path rather than as a query param. For example if your url is ``/api/contact/234/address`` you might make a parameter called ``contactId`` then set the URL as follows: ``/api/contact/:contactId/address``.

Each query param item is an object. See [Input fields](#input-fields)

##### `display` (object)
RESTool is going to present the data somehow. This is the object that defines how. It contains the following properties:

###### `type` (string | 'table')
How would you like to present the data (at the moment we only support table view).

###### `sortBy` (string | array)
One or more paths to properties in the result object to sort the list by.

###### `fields` (array)
The list of fields you want to present in your main view. Each one is an object and could have the following properties:

#### Display fields

###### `name` (string)
The name of the field that contains the value in the results.

###### `type` (string | 'text', 'url', 'image', 'colorbox')
The type of the returning value.

A `colorbox` type will render a #RRGGBB hex string as an 80 x 20 pixel colored rectangle, overlaid with the hex color string.

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

###### `filterable` (bool)
Set to `true` to enable a text control to do simple client-side filtering by values of this field. Can be specified for multiple fields.

###### `truncate` (bool)
Causes long values to be truncated. By default, truncation is not enabled for fields.

#### GET SINGLE (getSingle)
We'll use this type of get request to get a single item. By default, if you won't config this request, when editing an item we'll take the row data from the original "get all" request.
The properties a "get single" request could have are `url`, `dataPath`, `requestHeaders`, and `queryParams`.

#### POST/PUT requests additional configuration
##### `fields` (array)
The list of fields you want us to send as the body of the request.
Each one is an object and could have the following properties:

#### Input fields

###### ``name`` (string)
The name of the field/parameter to be sent.

###### ``label`` (string)
A label that describes the field. This is the label the user will see in the form.

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

For POST and PUT pages only.

###### ``type`` (string)
Use the "type" field to define the type of the field.
Available options:

* ``text`` - A simple text input (if "type" is not defined, text will be the default).
* ``long-text`` - A larger text input
* ``object`` - An object type of field (will use JSON.stringify() to present it, and will parse on update).
* ``encode`` - If you want the value to be encoded before being sent, use this type. GET All page only.
* ``integer`` - A text box for positive and negative integers.
* ``number`` - A text box for positive and negative floating point numbers.
* ``boolean`` - This will render a checkbox.
* ``email`` - A text box for [an email address](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email). Falls back to a simple text input on unsupported browsers.
* ``color`` - A [color selector](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color) yielding #RRGGBB hex value strings. Falls back to a simple text input on unsupported browsers.
* ``select`` - This will render a select box. See [options](#options-array) and [optionSource](#optionsource-object) properties
* ``array`` - Enter multiple values. POST and PUT page only.
* ``file`` - A file-input form element, to upload files as `Content-Type: multipart/form-data`. All non-file form inputs will be sent as individual string values. The current implementation supports only one file input per form.
* ``password`` - A password text box
* ``note`` - A plain text note within the other fields. Use ``note`` property for text. ``label`` is optional.
* ``hidden`` - Set to true if you want the value to be sent but not to be editable.

###### ``options`` (array)
Add the `options` field if you chose a `select` as a type. This field should contain an array of options to be displayed in the select box.

For example:

```
queryParams: {
  name: 'heroes',
  label: 'Select your hero',
  type: 'select',
  options: ['Spiderman', 'Batman', { display: 'Ironman', value: '324'}]
}
```

###### ``optionSource`` (object)
Use the `optionSource` field to load options for a select box from a REST service. If this is used with `options`, the items from `options` will be added to the select box before those fetched from the api.

You can use the following properties on the `optionSource` object:
* `url` - url to fetch data from
* `dataPath` - let us know where we should take the data from
* `displayPath` - property of the object to take the display value from
* `valuePath` - property of the object to take the option value from
* `sortBy` - one or more properties to sort the objects by 

For example:

```
fields: {
  name: 'bestFriend',
  label: 'Best Friend',
  type: 'select',
  optionSource: {
    url: '//restool-sample-app.herokuapp.com/api/contacts',
    dataPath: null,
    displayPath: 'name',
    valuePath: 'id',
    sortBy: ['name']
  }
}
```

###### `arrayType` (string)
For 'array' field type, you should specify another property called `arrayType` so we'll how to present & send the data in the POST and PUT pages.

###### ``default`` (string)
A default value. For GET All query params and POST pages only.

###### ``required`` (boolean)
If true, a field will be marked as required on PUT and POST pages.

###### ``readonly`` (boolean)
If true, a field will be displayed, but not editable. It's data will still be added to the PUT request.

###### ``useInUrl`` (boolean)
If true, a field can be used as a paramter in a PUT url. Otherwise only fields retreived in the original GET can be used as paramters. It's data will still be added to the PUT request body.

###### ``accept`` (string)
An optional setting for `type="file"` POST and PUT inputs. When set, the file input's [accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept) property will perform file type filtering when browsing for files.

For example:

```
"post": {
  "url": "/images",
  "fields": [
	{"name": "File", "label": "Upload your image", "type": "file", "required": true, "accept": ".png,.jpeg,image/*"}
  ]
},
```


## Build
When you're feeling your project is ready, just run `ng build --prod` to build the project. The build artifacts will be stored in the `dist/` directory.
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
* [Daniel Sternlicht](http://danielsternlicht.com/)
* Oreli Levi
* Jonathan Sellam
