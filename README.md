Sample App: Weather
===================

This sample app utilizes the following RaptorJS modules:

* [optimizer](https://github.com/raptorjs/optimizer): Used to generate optimized JavaScript and CSS bundles and generates the HTML markup to include them on the page.
* [marko](https://github.com/raptorjs/marko): HTML-based templating engine used to render pages and UI components on both the server.
* [async-config](https://github.com/patrick-steele-idem/async-config): Used to load environment-specific configuration required to configure the app.
* [raptor-args](https://github.com/raptorjs/raptor-args): Used to parse command-line arguments.
* [marko-widgets](https://github.com/raptorjs/marko-widgets): Provides automatic binding of client-side behavior to UI components rendered on either the server or the client.
* [raptor-renderer](https://github.com/raptorjs/raptor-renderer): A module for invoking an HTML renderer function and injecting the resulting HTML into the DOM with automatic binding of client-side behavior.

# Installation

```
git clone https://github.com/raptorjs/raptor-samples.git
cd raptor-samples/weather
npm install
node server
```

Navigate to [http://localhost:8080/](http://localhost:8080/) to see your application in action!

If you want to be able to write code and have the browser page automatically refresh then the following commands are recommended:

```
npm install browser-refresh -g
browser-refresh
```

Finally, to start the application to use mock services to avoid making HTTP calls to [openweathermap.org](http://openweathermap.org/) then you can append the `--mock-services` argument to the command line:

```
node server --mock-services
```

# Project Structure

```bash
./
├── config/ # Configuration files
│   ├── config.json # Configuration defaults
│   ├── optimizer.json # Default configuration for the optimizer
│   └── optimizer-production.json # Production configuration for the optimizer
├── config.js # Helper module for loading the configuration
├── mock-services.js # Helper module to use mock service modules
├── package.json # npm metadata
├── routes.js # Registers URL routes
├── server.js # Starts the server
└── src/ # Source code for the application
    ├── api/ # API endpoint implementations
    │   └── weather.js
    ├── components/ # UI components/custom tags
    │   ├── app-choose-location/
    │   │   ├── optimizer.json # Client-side dependencies
    │   │   ├── renderer.js # HTML renderer
    │   │   ├── style.css # UI Component styling
    │   │   ├── template.marko # HTML template
    │   │   └── widget.js # Client-side behavior
    │   ├── app-current-conditions/
    │   │   └── ...
    │   ├── app-footer/
    │   │   └── ...
    │   ├── app-header/
    │   │   └── ...    
    │   ├── app-location-weather/
    │   │   └── ...
    │   ├── app-nav/
    │   │   └── ...
    │   └── app-weather/
    │       └── ...
    ├── global-style/ # Module to control the style of all pages
    │   └── ...
    ├── layouts/ # Layout templates
    │   └── default/
    │       ├── optimizer.json # Client-side dependencies
    │       ├── style.css # Default layout styling
    │       └── template.marko # Layout template
    ├── pages/ # Top-level page modules
    │   └── home/ # The main index page
    │       ├── index.js # Page middleware
    │       ├── optimizer.json # Page dependencies
    │       ├── style.less # Page-specific style
    │       └── template.marko # Page template
    ├── marko-taglib.json # marko taglib definition
    ├── services/
    │   ├── package.json # Browser override configured in package.json
    │   ├── weather-service-browser.js # Browser-side version of the weather-service module
    │   ├── weather-service-util.js # Utility methods
    │   └── weather-service.js # Server-side version of the weather-service module
    └── third-party/
        └── bootstrap/
            └── optimizer.json # Package up Bootstrap
```

# UI Components

The UI for the weather application is broken down into various UI components to ease maintainability and improve reusability. Each UI component is a self-contained directory/module that includes code to provide for the following:

* Rendering HTML (i.e. `renderer.js` and `template.marko`)
* Styling (i.e. `style.css`)
* Client-side behavior (i.e. `widget.js`)
* Declarative client-side dependencies (i.e. `optimizer.json`)
* Custom tag definition (i.e. `marko-tag.json`)
* ...plus any other required files/assets

For this sample app, we chose the following decomposition of UI components:

## app-choose-location

Renders the form that allows the user to choose a location. When a location is selected the client-side widget emits a `locationSelected` event with the following properties:

* __query:__ The query that the user entered into the input field

## app-current-conditions

Renders the current conditions (high, low, humidity, etc.) for a given location.

## app-footer

Renders the global footer at the bottom of the page.

## app-header

Renders the global header at the top of the page.

## app-location-weather

Renders the weather for a location (which may include current conditions, 10 day forecast, maps, etc.).

## app-nav

Renders the top navigation.

## app-weather

Renders the UI for the weather application that goes into the body of the page. The widget for this UI component orchestrates all of the events for the nested components and it controls the web browser's location bar using the [HTML 5 history API](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history) (e.g. ` window.history.pushState(...)`). This widget adds a `locationSelected` listener for the nested `app-choose-location` widget. When a new location is selected, the widget for the `app-weather` UI component initiates a service call using the `src/services/weather` module to retrieve the weather for the selected location. When the weather data comes back for the entered location, it is used to [re-]render the `app-location-weather` component.

# Client-side Resource Optimization

Unless the `NODE_ENV` environment variable is set to `production`, the application will start in development mode. In development mode, resource optimizations such as minification, concatenation and fingerprinted URLs are disabled to be more developer-friendly. Try starting the application using the following command to see what it looks like in the optimized production mode:

```
env NODE_ENV=production node server
```

Now navigate back to [http://localhost:8080/](http://localhost:8080/) and you should see less `<script>` and `<link>` tags (as a result of resource concatenation) and all source code should be minified.

