NOTE
====

**THIS PROJECT IS CURRENTLY NOT FUNCTIONAL!**

The open source *FireConsole Extension* (which will be replacing the open source *FirePHP Extension*) is
currently incubating as part of [DeveloperCompanion](http://developercompanion.com/).

Once the *FireConsole* related functionality stabilizes within *DeveloperCompanion* this project
will be updated with the latest open source code.

To use the advanced features of [FirePHP 1.0](http://sourcemint.com/firephp.org/firephp/1) please install 
*DeveloperCompanion* for now.

See here for more details:

  * [http://sourcemint.com/github.com/firephp/firephp/1:1.0.0b1rc3/-docs/Clients#fireconsole](http://sourcemint.com/github.com/firephp/firephp/1/-docs/Clients#fireconsole)
  * [http://www.christophdorn.com/Blog/2011/08/03/firephp-and-firebug-1-8/](http://www.christophdorn.com/Blog/2011/08/03/firephp-and-firebug-1-8/)


FireConsole Toolchain
=====================

This project contains everything needed to work on the [FireConsole Firefox Extension](http://www.fireconsole.org/).


Libraries
---------

  * [PHP](http://github.com/cadorn/fireconsole/tree/master/packages/lib-php/)



Install
-------

See [narwhalrunner](http://github.com/cadorn/narwhalrunner) for requirements.

Checkout the fireconsole workspace and switch to it:

    pinf checkout-workspace -s github.com/cadorn/fireconsole

Make sure you have a firefox binary registered:

    nr add-bin /Applications/Firefox.app/Contents/MacOS/firefox-bin

Create a firefox profile. Install [Firebug 1.5+](http://getfirebug.com/) before closing the browser again.

    nr create-profile --dev master
    nr populate-profile master

Add the firefox extension to the profile:

    nr add-extension -l --profile master packages/firefox-extension

Launch the profile:

    nr launch --dev --profile master





License
=======

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2009-2010 Christoph Dorn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
