# RESTool 2.0 ([demo](https://dsternlicht.github.io/RESTool/))

  

<p  align="center">

<img  src="https://raw.githubusercontent.com/dsternlicht/RESTool/master/screenshots/screenshot_1.png?raw=true"  alt="RESTool Sample App"/>

</p>

  

The best tool in the neighborhood. Managing your **RESTful APIs** has never been so easy.

RESTool gives you an out of the box UI that connects to your RESTful API with a simple configuration file.

  

The idea behind it is simple. Given the fact that each entity in your API has a RESTful implementation, RESTool will provide you UI tool for managing these entities in no time by simply editing a configuration file. No front end engineers, no JavaScript, no CSS, no html. Just a simple JSON file.

  

**Live Demo**: [https://dsternlicht.github.io/RESTool/](https://dsternlicht.github.io/RESTool/)

<br />

## What's New in V2?

While RESTool originally was developed with Angular, we decided to rewrite it from scratch and move to **React**. The main reason we moved to React is the **community**. Since React is so popular we believe that choosing React over Angular will get a much wider **community support**.

Some new features and capabilities in V2:

* **From Angular to React & Typescript**
* Full mobile support
* Cards layout
* Custom app colors
* Data path extraction from arrays
* New & improved design
* Custom favicon support
* Custom icons for actions
* Better error handling in configuration and requests

<br />

## Getting started

If you only interested in using **RESTool** on its latest version as a management tool for your RESTful API, read the docs about [configuration](#configuration), [deployment](#deploy), and [consuming RESTool from CDN](#consume-from-cdn).

If you wish to extend RESTool's functionality and develop on top of it, please go to the [development](#development) section.

<br />

## Configuration

One of the best things about RESTool (and the reason we actually built it) is that you don't need to develop anything. Everything is configurable and may be set simply by editing a configuration file (`config.json`).

The `config.json` file should be placed in the root folder of the project, alongside with the `index.html` file.

Here's a detailed list of properties you could add to your configuration file (just in case, we added a [`config-sample.json`](https://github.com/dsternlicht/RESTool/blob/master/public/config-sample.json) file you could learn from).

| Property | Type | Required? | Description |
|----------------|--------------|-----|----------------------------------------------------------------|
| name | `string` | true | The name of your app.|
| pages | `array` | true | A list of pages in your app, each page will be presented as a separated tab, and will have his own methods and properties. |
| baseUrl | `string` | false | Base url of the api. This will prefix the url of all the api methods defined for all pages. This is normally the domain plus a base path. For example: `"https://restool-sample-app.herokuapp.com/api"` <br /><br /> Note: If different pages use different base urls this should not be used. Instead, you should explicitly define absolute urls for each method. |
| requestHeaders | `object` | false | A list of key-value headers you wish to add to every request we're making. <br /><br /> For example: <br />``{ Authentication: 'SECRET_KEY', 'X-USER-ID': 'USER_ID' }``. |
| errorMessageDataPath | `string[]` | false | The path within an error response object to look for an error message. If multiple are provided, each will be tried in order until a message is found. |
| unauthorizedRedirectUrl | `string` | false | Path to navigate to when the api returns a 401 (Unauthorized) error. You can use `:returnUrl` to pass a return location. For example: `"/login/myLoginPage?return=:returnUrl"` |
| favicon | `string` | false | A URL for you app's favicon. |
| customStyles | `object` | false | [Custom styles](#custom-styles) |
| customLabels | `object` | false | [Custom labels](#custom-labels) |

#### Dynamic configuration file
RESTool also support dynamic js configuration file. 
Just replace the `config.json` file with `config.js` file with this content:

```
export default {
  // Content is the same as the json config file
}
```

**NOTE:** In case you're using the `build` folder, the config.js must be placed in the folder `/build/static/js`.
<br />


### Pages

Each **page** is an object and represents a resource in your API. It should have the following properties:

| Property | Type | Required? | Description |
|----------------|--------------|-----|----------------------------------------------------------------|
| name | `string` | true | The name of the page. This will be presented in the menu.|
| id | `string` | true | A unique identifier for the page. RESTool will use it to navigate between pages. |
| description | `string` | false | A short description about the page and its usage. |
| requestHeaders | `object` | false | A list of key-value headers you wish to add to every request we're making. <br /><br /> For example: <br />``{ Authentication: 'SECRET_KEY', 'X-USER-ID': 'USER_ID' }``. |
| methods | `object` | true | A list of all methods which are available in your RESTful API. |
| customActions | `object[]` | false | A list of extra (non RESTful) endpoints available in your RESTful API. Specifically `customActions` is a list of PUT or POST method objects. <br /><br />Read more about custom actions [here](#custom-actions). |
| customLabels | `object` | false | [Custom labels](#custom-labels) |

<br />

#### Methods

A method object will tell RESTool how to work with your API. Available methods:

* getAll
* getSingle
* post
* put
* delete

Each method has the following common properties (which could be extended specifically for each use case):

| Property | Type | Required? | Description |
|----------------|--------------|-----|----------------------------------------------------------------|
| url | `string` | true | The url for making the request. The url could be either relative or absolute. If a ``baseUrl`` is defined then you should only provide a relative path. For example: ``/users/:id``. <br /><br />The url could contain parameters that will be extracted if needed. For example: ``https://website.com/users/:id`` - note that the parameter name in the url should match the one you're returning in your API. |
| actualMethod | `string` ("get", "put", "post", "delete", "patch") | false | Since not everyone implements the RESTful standard, if you need to make a 'post' request in order to update an exiting document, you may use this property. |
| requestHeaders | `object` | false | Same as above, but for specific method. |
| queryParams | `array` | false | An array of query parameters fields that will be added to the request. <br /><br />If your url includes the name of the parameter, it will be used as part of the path rather than as a query parameter. For example if your url is ``/api/contact/234/address`` you might make a parameter called ``contactId`` then set the url as follows: ``/api/contact/:contactId/address``. <br /><br />Each query param item is an object. See [input fields](#input-fields) |
| fields | `array` | false | A list of [Input fields](#input-fields) that will be used as the body of the request. <br /><br /> For the `getAll` request, the fields will be a list to [display fields](#display-fields) and will be used to render the main view. |

<br />

##### `getAll` - additional properties

We'll use this request in order to get a list of items from our API. This type of GET request has the following additional properties:

<br />

###### `dataPath` (string)

Use this field to let RESTool know from where it should extract the data from. For example, if your API is returning the following JSON response:

```

{
  success: true,
  data: []
}

```

The `dataPath` you'll want to use will be `data`.

If your API returning:

```

{
  success: true,
  data: {
    created: 1578314296120,
    items: []
  }
}

```

The `dataPath` will be `data.items`.

<br />

###### `display` (object: { type: "table" | "cards" })

RESTool allows you to control how to output the data. The display object has a `type` property that will define how to display the data. RESTool supports two display type: `"table"` and `"cards"`.

```
{
  "display": {
    "type": "cards"
  },
  ...
}
```

<br />

###### `sortBy` (string | string[])

One or more paths to properties in the result object to sort the list by.

<br />

###### `pagination` ([Pagination](#pagination))

Optional. This allows to handle pagination. See [Pagination](#pagination).

<br />

###### `dataTransform` (Function | async Function)

Optional. Relevant only when using dynamic (js) config.
A function to allow manipulation on the response data. 
Useful for changing\adding data for display purposes.

Here is an example for adding a new field named `wiki` to the data:
```
{
  ...
  "dataTransform": items => items.map(item => Object.assign(item, { wiki: `https://en.wikipedia.org/wiki/${item.name}` }))
}
```

<br />

##### `getSingle`

This method will be fired once you hit the edit button on an item in order to get a single item's data. By default, if this method hasn't been set, when editing an item, RESTool will take the raw data from the original `getAll` request.

An example of a `getSingle` request:

```
{
  "url": "/character/:id",
  "dataPath": "data",
  "queryParams": [],
  "requestHeaders": {}
}
```

<br />

###### `dataTransform` (Function | async Function)

Optional. Relevant only when using dynamic (js) config.
A function to allow manipulation on the response data.
Useful for changing\adding data for display purposes.

Here is an example for adding a new field named `wiki` to the data:
```
{
  ...
  "dataTransform": item => Object.assign(item, { wiki: `https://en.wikipedia.org/wiki/${item.name}` })
}
```

<br />

##### `post`
The `post` method will be used to create new items in your API resource.

Example:

```
{
  "url": "/character",
  "fields": [
    {
      "name": "name",
      "label": "Name",
      "type": "text"
    },
    {
      "name": "location",
      "label": "Location",
      "type": "select",
      "options": ["Kings Landing", "Beyond the Wall", "Winterfell"]
    },
    {
      "name": "isAlive",
      "label": "Alive?",
      "type": "boolean"
    }		
  ]
}
```

<br />

#####  `put` - additional properties

The `put` method will be used to update an existing item in your API resource.

Example:

```
{
  "put": {
    "url": "/character/:id",
    "actualMethod": "post",
    "includeOriginalFields": false,
    "fields": [
      {
        "name": "location",
        "label": "Location",
        "type": "select",
        "options": ["Kings Landing", "Beyond the Wall", "Winterfell"]
      },
      {
        "name": "isAlive",
        "label": "Alive?",
        "type": "boolean"
      }
    ]
  }
}
```

###### `includeOriginalFields` (boolean)
When set to `true`, all fields from the original object are merged and sent in the request body.
Default is `false`.

<br />

#####  `delete`
The `delete` method will be used to delete an existing item in your API resource.

Example:

```
{
  "delete": {
    "url": "/character/:id"
  }
}
```

<br />

#### Pagination

The `pagination` property allows you to handle pagination on .

Here's a list of variable names you may change:

| Name   | Value                        | Description                                                  |
| ------ | ---------------------------- | ------------------------------------------------------------ |
| type   | `'buttons' | 'infinite-scroll'` | Type of pagination. Buttons is the standard one. You can also have a "inifite scroll" with lazy loading. |
| source | `'query'`                    | Where the pagination parameters are written to. Only supports query parameters for now. |
| params | `object`                     | Parameters definition for pagniation purposes. See below.    |
| fields | `object`                     | Definition of informations that will be returned by the API. See below. |

<br />

The `params` field has the following properties that all can be defined with a  [input field](#input-fields)

| Name       | Value    | Required? | Description                                                  |
| ---------- | -------- | --------- | ------------------------------------------------------------ |
| page       | `object` | true      | The parameter definition of the page number.                 |
| limit      | `object` | false     | The parameter definition of the maximum number of items to be returned by the API. |
| sortBy     | `object` | false     | The parameter definition of the sorting value.               |
| descending | `object` | false     | The parameter definition of the order in which the API should return items. `false` by default. |

<br />

The `fields` field has the following properties that all can be defined with a `{ dataPath: string }` object

| Name  | Value    | Required? | Description                                                  |
| ----- | -------- | --------- | ------------------------------------------------------------ |
| total | `object` | False     | The total of items available on the API endpoint. This will allow RESTool to know when there is no more pages to navigate to. |

<br />

####  Custom Actions

A list of extra (non RESTful) endpoints available in your RESTful API. Specifically `customActions` is a list of PUT or POST method objects. For example this could enable an endpoint like: ``PUT /users/:id/disable``

> These use the same format as the method objects defined below.

> The default HTTP method used is PUT but this can be overwritten using the `actualMethod` parameter.

> If `customActions` is not empty then for each action RESTool will generate an action button on each data row.

> You may configure the icon of the action by adding an `icon` property. RESTool uses font-awesome and you may use any icon name you want from their collection.

Here's an example for a configuration of 2 custom actions:

```
{
  "customActions": [
    {
      "name":"Send Email",
      "url": "/character/:id/sendEmail",
      "actualMethod": "post",
      "icon": "envelope",
      "fields": [
        {
          "name": "id",
          "type": "text",
          "label": "ID",
          "readonly": true
        },
        {
          "name": "title",
          "type": "text",
          "label": "Email Title",
          "required": true
        },
        {
          "name": "body",
          "type": "text",
          "label": "Email Body",
          "required": true
        }
      ]
    },
    {
      "name":"Disable Character",
      "url": "/character/:id/disable",
      "actualMethod": "post",
      "icon": "minus-circle",
      "fields": [
        {
          "name": "id",
          "type": "text",
          "label": "Contact ID",
          "readonly": true
        }
      ]
    }
  ]
}
```
<br />

###### `dataTransform` (Function | async Function)

Optional. Relevant only when using dynamic (js) config.
A function to allow manipulation on the body data.
Useful for changing/adding data before the PUT.

Here is an example for changing payload to literal:
```
{
  ...
  "dataTransform": item => { return item.value}
}
```

<br />

####  Custom Styles

The `customStyles` property allows you to control the look & feel of your RESTool app. The object will contains a `vars` property where you'll be able to change the deafult colors of RESTool.

Here's a list of variable names you may change:

| Name | Value | Description |
|--------------|-----|----------------------------------------------------------------|
| appText | `string` | Root text color. |
| appBackground | `string` | App background color. |
| navBackground | `string` | Navigation menu background color. |
| navText | `string` | Navigation menu text color. |
| navItemText | `string` | Navigation item text color. |
| navItemHoverBackground | `string` | Navigation item background color on hover event. |
| navItemActiveBackground | `string` | Active navigation item background color. |
| actionButtonBackground | `string` | Action button background color. |
| actionButtonHoverBackground | `string` | Action button background color on hover event. |
| actionButtonText | `string` | Action button text color. |
| cardBackground | `string` | Card background color. |

Usage example in `config.json` file:

```
{
  ...
  "customStyles": {
    "vars": {
      "appBackground": "#888",
      "navBackground": "#333"
      "navItemHoverBackground": "#454545"
    }
  }
}
```

<br />

####  Custom Labels

The `customLabels` property allows you to control the different labels that are shown across the pages of your RESTool app. The object has three fields that contain properties that you can customize: `buttons`, `formTitles` and `placeholders`.

List of variable names you may change within the `buttons`property:

| Name         | Value    | Description                                        | Default value |
| ------------ | -------- | -------------------------------------------------- | ------------- |
| addItem      | `string` | Content of the add button on a page.               | + Add Item    |
| editItem     | `string` | Title of the edit button on a row or a card.       | Edit          |
| deleteItem   | `string` | Title of the delete button on a row or a card.     | Delete        |
| clearInput   | `string` | Title of the clear button on form inputs.          | Clear         |
| closeForm    | `string` | Title of the close button in forms.                | Close         |
| addArrayItem | `string` | Title of the add button on arrays inputs in forms. | Add Item      |

List of variable names you may change within the `formTitles` property:

| Name     | Value    | Description                                  | Default value |
| -------- | -------- | -------------------------------------------- | ------------- |
| addItem  | `string` | Content of the add button on a page.         | Add Item      |
| editItem | `string` | Title of the edit button on a row or a card. | Edit Item     |

List of variable names you may change within the `placeholders` property:

| Name     | Value    | Description                   | Default value       |
| -------- | -------- | ----------------------------- | ------------------- |
| object   | `string` | JSON input placeholder.       | Enter JSON...       |
| array    | `string` | JSON array input placeholder. | Enter JSON array... |
| text     | `string` | Text input placeholder.       | Enter text...       |
| number   | `string` | Number input placeholder.     | 0                   |
| color    | `string` | Color input placeholder.      | Enter color...      |
| email    | `string` | Email input placeholder.      | Enter email...      |
| password | `string` | Password input placeholder.   | Enter password...   |
| date     | `string` | Date input placeholder.       | Enter date...       |
| file     | `string` | File input placeholder.       | Select file...      |

List of variable names you may change within the `pagination` property:

| Name       | Value    | Description                                                  | Default value                                  |
| ---------- | -------- | ------------------------------------------------------------ | ---------------------------------------------- |
| itemsCount | `string` | Label displaying the items count when `pagination` option is on with type `infinite-scroll`. Use `:currentCountFrom`, `:currentCountTo` and `:totalCount` to display relevant data anywhere in your custom label. | Showing :currentCountFrom-:currentCountTo out of :totalCount items |
| editItem   | `string` | Title of the edit button on a row or a card.                 | Edit Item                                      |

Usage example in `config.json` file:

```
{
  ...
  "customLabels": {
    "buttons": {
      "addItem": "+ New item",
      "editItem": "Modify"
    },
    "formTitles": {
      "addItem": "New item form"
    },
    "placeholders": {
      "color": "Enter color in HEX format..."
    }
  }
}
```

<br />

### Display fields

The list of fields you want to present in the main view of the app. Each one is an object and could have the following properties:

| Property | Type | Required? | Description |
|----------------|--------------|-----|----------------------------------------------------------------|
| name | `string` | true | The property name of the field that contains the value in the API result. |
| type | `string` | true | This will help RESTool to render the main view. See a list of available type below. |
| label | `string` | false | A label that describes the field. Will be presented as table headers in the main view. |
| dataPath | `string` | false | Read more about dataPath [here](#data-path).
| filterable | `boolean` | false | Set to `true` to enable a text control to do simple client-side filtering by values of this field. Can be specified for multiple fields. |
| truncate | `boolean` | false | Causes long values to be truncated. By default, truncation is not enabled for fields. |
| url | `string` | false | If the type of the field is set to `url`, this property can be used to provide a custom URL that receives the `value` of this field as a parameter. If `url` is not provided, the value of the field will be the target of the anchor. Example below. |

Example for URL field:
```json
fields: [
  {
    "name": "someValue",
    "type": "url",
    "label": "External",
    "url": "https://example.com/products/:someValue"
  }
]
```

<br />

#### Display field types

Here's a list of available display field types:

* `text` - will parse the value as a text 
* `url` - will render an anchor element with a clickable link 
* `image` - will render an image from the url 
* `colorbox` - will render a #RRGGBB hex string as an 80 x 20 pixel colored rectangle, overlaid with the hex color string
* `boolean` - will render as a green or red dot

<br />

### Input fields

A list of fields you want us to send as the body of the request. Each one is an object and could have the following properties:

| Property | Type | Required? | Description |
|----------------|--------------|-----|----------------------------------------------------------------|
| name | `string` | true | The name of the field / parameter to be sent. |
| label | `string` | false | A label that describes the field. This will act as a label in RESTool's forms. |
| dataPath | `string` | false | Use this field to let RESTool know what is the path of this field in the body of the request. Read more about `dataPath` [here](#data-path). |
| type | `string` | true | Use the `type` field to define the type of the field. See a list of available type below. |
| options | `string[]` | false | Add the `options` field if you chose a `select` as a type. This field should contain an array of options to be displayed in the select box. <br /><br />For example: `["Amazon", "Google", { "display": "Microsoft", "value": "ms" }]`|
| arrayType | `string` | false | For `array` field type, you should specify another property called `arrayType` so RESTool will know how to present & send the data in the POST and PUT methods. Array type could be `object` or `text`. |
| value | `any` | false | Set a default value to the field. |
| required | `boolean` | false | If true, a field will be marked as required on PUT and POST forms. |
| readOnly | `boolean` | false | If true, a field will be displayed, but not editable. It's data will still be added to the PUT and POST requests. |
| placeholder | `string` | false | Input field placeholder. |
| accept | `string` | false | An optional setting for `file` type inputs. When set, the file input's [accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept) property will perform file type filtering when browsing for files. <br /><br />For example: `{ "accept": ".png,.jpeg,image/*" }`|
| useInUrl | `boolean` | false | If true, a field can be used as a parameter in a PUT url. Otherwise only fields retrieved in the original GET can be used as parameters. It's data will still be added to the PUT request body. |
| optionSource| `object` | false | Use the `optionSource` field to load options for a select box from a REST service. If this is used with `options`, the items from `options` will be added to the select box before those fetched from the api. Read more about it [here](#option-source).|
| multi | `boolean` | false | If true, select-multi dropdown will allow for multiple selections from a pre-defined list. |
| selectLimit | `number` | unlimited | An optional setting for limiting the multiple selections from a pre-defined list. |

<br />

#### Input field types

Available options:

*  ``text`` - A simple text input (if "type" is not defined, text will be the default).
*  ``long-text`` - A larger text input
*  ``object`` - An object type of field (will use JSON.stringify() to present it, and will parse on update).
*  ``encode`` - If you want the value to be encoded before being sent, use this type. GET All page only.
*  ``integer`` - A text box for positive and negative integers.
*  ``number`` - A text box for positive and negative floating point numbers.
*  ``boolean`` - This will render a checkbox.
*  ``date`` - A text box for [date format](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date). Falls back to a simple text input on unsupported browsers.
*  ``email`` - A text box for [an email address](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email). Falls back to a simple text input on unsupported browsers.
*  ``color`` - A [color selector](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color) yielding #RRGGBB hex value strings. Falls back to a simple text input on unsupported browsers.
*  ``select`` - This will render a select box. See [options](#options-array) and [optionSource](#option-source) properties
*  ``array`` - Enter multiple values. POST and PUT page only.
*  ``file`` - A file-input form element, to upload files as `Content-Type: multipart/form-data`. All non-file form inputs will be sent as individual string values. The current implementation supports only one file input per form.
*  ``password`` - A password text box.
*  ``note`` - A plain text note within the other fields. Use ``note`` property for text. ``label`` is optional.
*  ``hidden`` - Set to true if you want the value to be sent but not to be editable.

<br />

#### Option source

Use the `optionSource` field to load options for a select box from a REST service. If this is used with `options`, the items from `options` will be added to the select box before those fetched from the api.

You can use the following properties on the `optionSource` object:

*  `url` - url to fetch data from
*  `dataPath` - let us know where we should take the data from
*  `displayPath` - property of the object to take the display value from
*  `valuePath` - property of the object to take the option value from
*  `sortBy` - one or more properties to sort the objects by  

For example:

```
fields: [
  {
    name: "bestFriend",
    label: "Best Friend",
    type: "select",
    optionSource: {
      url: "https://restool-sample-app.herokuapp.com/api/character",
      dataPath: null,
      displayPath: "name",
      valuePath: "id",
      sortBy: ["name"]
    }
  }
]
```

<br />

### Data path

Use this field to help RESTool understand what's the path to get to the field's value in the raw data. For example, if this is a single result's data:

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

And you want to present the `numberOfChildrens` field in the main view, the data path for this field will be `details`, and the `name` should be `numberOfChildrens`.

`dataPath` also supports extracting value from an array:

```
[
  {
    childrens: [
      {
        nickName: 'Spiderman'
      }, 
      { 
        nickName: 'Ironman'
      }    
    ]
  },
  ...
]
```

You may use the following data path to extract the first children's nickName: `childrens.0` and the field's name will be `nickName`.

Another usage of this field is to help RESTool to build up the request body. Let's assume that you want to build the following request body:

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

The field name will be `url`, the type will be `text`, and the data path will be `details.thumbnail`. RESTool will build the body of the request dynamically according to the `dataPath` and `name` of the field.


<br />

## Development

Clone RESTool repository to get started.

```
git clone https://github.com/dsternlicht/RESTool.git
cd RESTool
```

Install project dependencies by running:
```
npm i
```

We used React for developing this awesome tool so no need to install anything globally.

In order to start developing:

* Start the development server by running `npm start`.
* Browse to `http://localhost:3000/`.
* The app will automatically reload on changes.

<br />

## Build

Once you're ready, run `npm run build` in order build the project. The build artifacts will be stored in the `build/` folder.
**The `build` folder is the one you want to deploy to your server.**

<br />

## Deploy

* Copy the `build` folder with all of its content.
* Edit the `config.json` file, and add your configuration.
* Deploy the `build` folder to your servers, and make sure you serve the `index.html` file.
* Enjoy! 😎

<br />

## Consume from CDN

Instead of using the `build` folder, you may also consume RESTool as a script from CDN in an HTML page:
```
<script src="https://unpkg.com/restool"></script>
```

In this case you'll want to set a config file directly on the window object:
```
<script>
  window.RESTool = {
    config: {
      remoteUrl: '{CONFIG_FILE_URL}'
    }
  };
</script>
```

Full example:
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RESTool App</title>
  </head>
  <body>
    <script>
      window.RESTool = {
        config: {
          remoteUrl: '{CONFIG_FILE_URL}'
        }
      };
    </script>
    <script src="https://unpkg.com/restool"></script>
  </body>
</html>
```

## Created By

* [Daniel Sternlicht](http://danielsternlicht.com/)
* Oreli Levi
* Jonathan Sellam
