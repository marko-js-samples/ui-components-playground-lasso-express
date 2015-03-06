// Export a render(input) method that can be used
// to render this UI component on the client
require('marko-widgets').makeRenderable(exports, require('./renderer'));