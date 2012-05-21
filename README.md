#jQuery PickList#

jQuery PickList, or `jquery-picklist`, is a jQuery-based widget that turns a regular multiple option select box into a side-by-side pick list.

For detailed usage demos, visit: http://code.google.com/p/jquery-ui-picklist/wiki/Demos

##Features##

  * Fully customizable button & list labels and CSS class names
  * Support for items with rich HTML content
  * CTRL + click selects multiple items
  * SHIFT + click selects a range of items
  * Compatible with ordinary form submission
  * Works in all major browsers (IE, FF, Chrome, Opera, and Safari)
  * Many options for customization
  * **No longer requires jQuery UI!**
  
## Allow file access in chrome to run Jasmine tests ##
Start Chrome with --allow-file-access-from-files

##Example Usage##

###JavaScript###

	$(function()
	{
		$("#foobar").pickList();
	});

###HTML###

	<select id="foobar" name="foobar" multiple="multiple">
		<option value="1">Option 1</option>
		<option value="2" selected="selected">Option 2</option>
		<option value="3">Option 3</option>
		<option value="4" selected="selected">Option 4</option>
		<option value="5">Option 5</option>
	</select>
	
###JavaScript (Enable string values  with {useData: true})###

	$(function()
	{
		$("#languages").pickList({useData: true});
	});

###HTML###

	<select id="languages" name="languages" multiple="multiple">
		<option value="JavaScript" data-value="1">JavaScript</option>
		<option value="CoffeeScript" data-value="2" selected="selected">CoffeeScript</option>
		<option value="Groovy" data-value="3">Groovy</option>
		<option value="Python" data-value="4" selected="selected">Python</option>
		<option value="Java" data-value="5">Java</option>
	</select>

	
