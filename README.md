jquery-popoutmenu
=================

This plugin will help you adding popout-menus to any element on your page.

Available settings
------------------
- **structure**: the structure of the menu. Either a list of objects or a list of lists of objects.
  The keys should match the names of the placeholders surrounded by underscored in the *tplItem*. (e.g. "href" --> "\_\_href\_\_").
- **tplContainer**: the container for the menu.
- **tplGroup**: a container for a group of menu items. If you are not using grouping this element will hold all your items.
- **tplItem**: a menu item containing your placeholders which can be filled by your structure's object keys.
- **addContainerClass**: a string of additional classes for the *tplContainer*.
- **animSpeed**: the speed of the fade-in/-out animations.


How to use
----------
There are two ways of using this plugin. Via data-attribute and via jQuery.
You may also combine both but beware of data-attribute has higher priority.


Use via data-attribute
-----------------------
You should change the plugin's default settings matching your needs first. Afterwards you can simply add a JSON encoded
string as data-attribute containing the structure of the menu.

```html
<span data-popoutmenu='{"structure":[
   {"href": "/sample1", "text": "Sample 1"},
   {"href": "/sample2", "text": "Sample 2"}
]}'></span>
```

At any place you may wish to use different settings than your default.
```html
<span data-popoutmenu='{
    "structure":[
        {"href": "/sample1", "text": "Sample 1"},
        {"href": "/sample2", "text": "Sample 2"}
    ],
    "addContainerClass": "special"
}'></span>
```


Use via jQuery
--------------
```javascript
$('.mySelector').popoutmenu({
    "structure":[
        {"href": "/sample1", "text": "Sample 1"},
        {"href": "/sample2", "text": "Sample 2"}
    ]
})
```
