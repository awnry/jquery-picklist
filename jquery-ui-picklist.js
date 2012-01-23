/**
 * jQuery UI PickList Widget
 * 
 * Copyright (c) 2012 Awnry Software
 * Distributed under the terms of the MIT License.
 * 
 * http://www.awnry.com/
 */
(function($)
{
	$.widget("awnry.pickList",
	{
		options:
		{ 
			// Container classes
			mainClass:					"pickList",
			listContainerClass:			"pickList_listContainer",
			sourceListContainerClass:	"pickList_sourceListContainer",
			controlsContainerClass:		"pickList_controlsContainer",
			targetListContainerClass:	"pickList_targetListContainer",
			listClass:					"pickList_list",
			sourceListClass:			"pickList_sourceList",
			targetListClass:			"pickList_targetList",
			clearClass:					"pickList_clear",

			// List item classes
			listItemClass:				"pickList_listItem",
			selectedListItemClass:		"pickList_selectedListItem",

			// Control classes
			addAllClass:				"pickList_addAll",
			addClass:					"pickList_add",
			removeAllClass:				"pickList_removeAll",
			removeClass:				"pickList_remove",

			// Control labels
			addAllLabel:				"&gt;&gt;",
			addLabel:					"&gt;",
			removeAllLabel:				"&lt;&lt;",
			removeLabel:				"&lt;",

			// List labels
			listLabelClass:				"pickList_listLabel",
			sourceListLabel:			"Available",
			sourceListLabelClass:		"pickList_sourceListLabel",
			targetListLabel:			"Selected",
			targetListLabelClass:		"pickList_targetListLabel",

			// Behavior
			sortItems:					true
		},

		_create: function()
		{
			var self = this;
			self._buildPickList();
			self._refresh();
		},

		_buildPickList: function()
		{
			var self = this;

			self.pickList = $("<div/>")
					.hide()
					.addClass(self.options.mainClass)
					.insertAfter(self.element)
					.append(self._buildSourceList())
					.append(self._buildControls())
					.append(self._buildTargetList())
					.append( $("<div/>").addClass(self.options.clearClass) );

			self._populateLists();

			self.element.hide();
			self.pickList.show();
		},

		_buildSourceList: function()
		{
			var self = this;

			var container = $("<div/>")
					.addClass(self.options.listContainerClass)
					.addClass(self.options.sourceListContainerClass);

			var label = $("<div/>")
					.text(self.options.sourceListLabel)
					.addClass(self.options.listLabelClass)
					.addClass(self.options.sourceListLabelClass);

			self.sourceList = $("<ul/>")
					.addClass(self.options.listClass)
					.addClass(self.options.sourceListClass)
					.delegate("li", "click", {pickList: self}, self._changeHandler);

			container
					.append(label)
					.append(self.sourceList);

			return container;
		},

		_buildTargetList: function()
		{
			var self = this;

			var container = $("<div/>")
					.addClass(self.options.listContainerClass)
					.addClass(self.options.targetListContainerClass);

			var label = $("<div/>")
					.text(self.options.targetListLabel)
					.addClass(self.options.listLabelClass)
					.addClass(self.options.targetListLabelClass);

			self.targetList = $("<ul/>")
					.addClass(self.options.listClass)
					.addClass(self.options.targetListClass)
					.delegate("li", "click", {pickList: self}, self._changeHandler);

			container
					.append(label)
					.append(self.targetList);

			return container;
		},

		_buildControls: function()
		{
			var self = this;

			self.controls = $("<div/>").addClass(self.options.controlsContainerClass);

			self.addAllButton = $("<button/>").button().click({pickList: self}, self._addAllHandler).html(self.options.addAllLabel).addClass(self.options.addAllClass);
			self.addButton = $("<button/>").button().click({pickList: self}, self._addHandler).html(self.options.addLabel).addClass(self.options.addClass);
			self.removeButton = $("<button/>").button().click({pickList: self}, self._removeHandler).html(self.options.removeLabel).addClass(self.options.removeClass);
			self.removeAllButton = $("<button/>").button().click({pickList: self}, self._removeAllHandler).html(self.options.removeAllLabel).addClass(self.options.removeAllClass);

			self.controls
					.append(self.addAllButton)
					.append(self.addButton)
					.append(self.removeButton)
					.append(self.removeAllButton);

			return self.controls;
		},

		_populateLists: function()
		{
			var self = this;

			self.element.children().each(function()
			{
				var text = $(this).text();
				var copy = $("<li/>")
						.text(text)
						.val($(this).val())
						.addClass(self.options.listItemClass);

				if($(this).attr("selected") == "selected")
				{
					self.targetList.append( copy );
				}
				else
				{
					self.sourceList.append( copy );
				}
			});
		},

		_addItem: function(value)
		{
			var self = this;

			self.sourceList.children().each(function()
			{
				if($(this).val() == value)
				{
					self.targetList.append( self._removeSelection($(this)) );
				}
			});

			self.element.children().each(function()
			{
				if($(this).val() == value)
				{
					$(this).attr("selected", "selected");
				}
			});
		},

		_removeItem: function(value)
		{
			var self = this;

			self.targetList.children().each(function()
			{
				if($(this).val() == value)
				{
					self.sourceList.append( self._removeSelection($(this)) );
				}
			});

			self.element.children().each(function()
			{
				if($(this).val() == value)
				{
					$(this).removeAttr("selected");
				}
			});
		},

		_addAllHandler: function(e)
		{
			var self = e.data.pickList;

			self.sourceList.children().each(function()
			{
				self._addItem( $(this).val() );
			});

			self._refresh();
		},

		_addHandler: function(e)
		{
			var self = e.data.pickList;

			self.sourceList.children().each(function()
			{
				if(self._isSelected( $(this) ))
				{
					self._addItem( $(this).val() );
				}
			});

			self._refresh();
		},

		_removeHandler: function(e)
		{
			var self = e.data.pickList;

			self.targetList.children().each(function()
			{
				if(self._isSelected( $(this) ))
				{
					self._removeItem( $(this).val() );
				}
			});

			self._refresh();
		},

		_removeAllHandler: function(e)
		{
			var self = e.data.pickList;

			self.targetList.children().each(function()
			{
				self._removeItem( $(this).val() );
			});

			self._refresh();
		},

		_refresh: function()
		{
			var self = this;

			// Refresh the states of the Add All and Remove All buttons.
			self.addAllButton.button( (self.sourceList.children().length > 0) ? "enable" : "disable" );
			self.removeAllButton.button( (self.targetList.children().length > 0) ? "enable" : "disable" );

			// Refresh the Add button state.
			var sourceSelected = false;
			self.sourceList.children().each(function()
			{
				if(self._isSelected( $(this) ))
				{
					sourceSelected = true;
				}
			});
			self.addButton.button( sourceSelected ? "enable" : "disable" );

			// Refresh the Remove button state.
			var targetSelected = false;
			self.targetList.children().each(function()
			{
				if(self._isSelected( $(this) ))
				{
					targetSelected = true;
				}
			});
			self.removeButton.button( targetSelected ? "enable" : "disable" );

			// Refresh the buttons.
			self.controls.children().each(function()
			{
				$(this).button("refresh");
			});

			// Sort the selection lists.
			if(self.options.sortItems)
			{
				self._sortItems(self.sourceList);
				self._sortItems(self.targetList);
			}
		},

		_sortItems: function(list)
		{
			var items = new Array();

			list.children().each(function()
			{
				items.push( $(this) );
			});

			items.sort(function(a, b)
			{
				if(a.text() > b.text())
				{
					return 1;
				}
				else if(a.text() == b.text())
				{
					return 0;
				}
				else
				{
					return -1;
				}
			});

			list.empty();

			for(var i = 0; i < items.length; i++)
			{
				list.append(items[i]);
			}
		},

		_changeHandler: function(e)
		{
			var self = e.data.pickList;

			if(e.ctrlKey)
			{
				if(self._isSelected( $(this) ))
				{
					self._removeSelection( $(this) );
				}
				else
				{
					self._addSelection( $(this) );
				}
			}
			else
			{
				$(this).parent().children().each(function()
				{
					self._removeSelection( $(this) );
				});

				self._addSelection( $(this) );
			}

			self._refresh();
		},

		_isSelected: function(listItem)
		{
			return listItem.hasClass("ui-selected");
		},

		_addSelection: function(listItem)
		{
			return listItem
					.addClass("ui-selected")
					.addClass("ui-state-highlight")
					.addClass(this.options.selectedListItemClass);
		},

		_removeSelection: function(listItem)
		{
			return listItem
					.removeClass("ui-selected")
					.removeClass("ui-state-highlight")
					.removeClass(this.options.selectedListItemClass);
		},

		_setOption: function(key, value)
		{
			switch(key)
			{
				case "clear":
				{
					break;
				}
			}

			$.Widget.prototype._setOption.apply(this, arguments);
		},

		destroy: function()
		{
			$.Widget.prototype.destroy.call(this);
		}
	});
}(jQuery));