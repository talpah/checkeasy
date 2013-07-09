checkeasy
=========

Iterate through a table's rows and zoom in on each row.
You can define actions which consist of a keyboard shortcut and a callback. 
Javascript implementation is modeled after PHP's Iterator interface.

Requirements
---
- JQuery

Basic usage
---
These need to be loaded first
```html
    <link rel="stylesheet" type="text/css" href="css/check-easy.css" media="all"/>
    <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.shortcuts.js"></script>
    <script type="text/javascript" src="js/check-easy.js"></script>
```

Then, assuming you defined a well-formed table in your page:

```html
<table id="myDataTable">
    <thead>
    <tr>
        <td>Column name #1</td>
        <td>Column name #2</td>
        <td>Column name #3</td>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>data 1</td>
        <td>data 2</td>
        <td>data 3</td>
    </tr>
    <tr>
        <td>data a</td>
        <td>data b</td>
        <td>data c</td>
    </tr>
    <tr>
        <td>data I</td>
        <td>data II</td>
        <td>data III</td>
    </tr>
    </tbody>
</table>
```

You can now initialize the zoomer:

```javascript
        var checkEasy = null;
        $(document).ready(function () {
            checkEasy = new CheckEasy('myDataTable', {
                "Close": {
                    key   : "Esc",
                    action: function () {
                        checkEasy.unzoom();
                    }
                },
                "Next" : {
                    key   : "n",
                    action: function () {
                        checkEasy.zoomNext();
                    }
                },
                "Prev" : {
                    key   : "p",
                    action: function () {
                        checkEasy.zoomPrev();
                    }

                }
            });
        });
```

API 
---

todo
