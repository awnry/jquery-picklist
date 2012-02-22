/**
 * jQuery UI PickList Widget
 *
 * Copyright (c) 2012 Jonathon Freeman <jonathon@awnry.com>
 * Distributed under the terms of the MIT License.
 *
 * http://code.google.com/p/jquery-ui-picklist/
 */
(function($)
{


	$.widget("awnry.pickList",
	{
		options:
		{
			// Container classes
			mainClass:                  "pickList",
			listContainerClass:         "pickList_listContainer",
			sourceListContainerClass:   "pickList_sourceListContainer",
			controlsContainerClass:     "pickList_controlsContainer",
			targetListContainerClass:   "pickList_targetListContainer",
			listClass:                  "pickList_list",
			sourceListClass:            "pickList_sourceList",
			targetListClass:            "pickList_targetList",
			clearClass:                 "pickList_clear",

			// List item classes
			listItemClass:              "pickList_listItem",
			richListItemClass:          "pickList_richListItem",
			selectedListItemClass:      "pickList_selectedListItem",

			// Control classes
			addAllClass:                "pickList_addAll",
			addClass:                   "pickList_add",
			removeAllClass:             "pickList_removeAll",
			removeClass:                "pickList_remove",

			// Control labels
			addAllLabel:                "&gt;&gt;",
			addLabel:                   "&gt;",
			removeAllLabel:             "&lt;&lt;",
			removeLabel:                "&lt;",

			// List labels
			listLabelClass:             "pickList_listLabel",
			sourceListLabel:            "Available",
			sourceListLabelClass:       "pickList_sourceListLabel",
			targetListLabel:            "Selected",
			targetListLabelClass:       "pickList_targetListLabel",

			// Sorting
			sortItems:                  true,
			sortAttribute:              "label",

			// Rich content items
			richItems:                  []
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
					.addClass(self.options.sourceListContainerClass)
					.disableSelection();

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
					.addClass(self.options.targetListContainerClass)
					.disableSelection();

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
						.attr("label", text)
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

			$(self.options.richItems).each(function()
			{
				var list = this.selected ? self.targetList : self.sourceList;
				list.append( self._createRichItem(this) );
			});
		},

		_addItem: function(value)
		{
			var self = this;

			self.sourceList.children("[value='" + value + "']").each(function()
			{
				self.targetList.append( self._removeSelection($(this)) );
			});

			self.element.children("[value='" + value + "']").each(function()
			{
				$(this).attr("selected", "selected");
			});
		},

		_removeItem: function(value)
		{
			var self = this;

			self.targetList.children("[value='" + value + "']").each(function()
			{
				self.sourceList.append( self._removeSelection($(this)) );
			});

			self.element.children("[value='" + value + "']").each(function()
			{
				$(this).removeAttr("selected");
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

			self.sourceList.children(".ui-selected").each(function()
			{
				self._addItem( $(this).val() );
			});

			self._refresh();
		},

		_removeHandler: function(e)
		{
			var self = e.data.pickList;

			self.targetList.children(".ui-selected").each(function()
			{
				self._removeItem( $(this).val() );
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

			// Enable/disable the Add All and Remove All buttons.
			self.addAllButton.button( (self.sourceList.children().length > 0) ? "enable" : "disable" );
			self.removeAllButton.button( (self.targetList.children().length > 0) ? "enable" : "disable" );

			// Enable/disable the Add button state.
			if(self.sourceList.children(".ui-selected").length)
			{
				self.addButton.button("enable");
			}
			else
			{
				self.addButton.button("disable");
			}

			// Enable/disable the Remove button state.
			if(self.targetList.children(".ui-selected").length)
			{
				self.removeButton.button("enable");
			}
			else
			{
				self.removeButton.button("disable");
			}

			// Refresh the buttons.
			self.controls.children().each(function()
			{
				$(this).button("refresh");
			});

			// Sort the selection lists.
			if(self.options.sortItems)
			{
				self._sortItems(self.sourceList, self.options);
				self._sortItems(self.targetList, self.options);
			}
		},

		_sortItems: function(list, options)
		{
			var items = new Array();

			list.children().each(function()
			{
				items.push( $(this) );
			});

			items.sort(function(a, b)
			{
				if(a.attr(options.sortAttribute) > b.attr(options.sortAttribute))
				{
					return 1;
				}
				else if(a.attr(options.sortAttribute) == b.attr(options.sortAttribute))
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
					self.lastSelectedItem = $(this);
					self._addSelection( $(this) );
				}
			}
			else if(e.shiftKey)
			{
				var current = $(this).val();
				var last = self.lastSelectedItem.val();

				if($(this).index() < $(self.lastSelectedItem).index())
				{
					var temp = current;
					current = last;
					last = temp;
				}

				var pastStart = false;
				var beforeEnd = true;

				self._clearSelections( $(this).parent() );

				$(this).parent().children().each(function()
				{
					if($(this).val() == last)
					{
						pastStart = true;
					}

					if(pastStart && beforeEnd)
					{
						self._addSelection( $(this) );
					}

					if($(this).val() == current)
					{
						beforeEnd = false;
					}

				});
			}
			else
			{
				self.lastSelectedItem = $(this);
				self._clearSelections( $(this).parent() );
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
			var self = this;

			return listItem
					.addClass("ui-selected")
					.addClass("ui-state-highlight")
					.addClass(self.options.selectedListItemClass);
		},

		_removeSelection: function(listItem)
		{
			var self = this;

			return listItem
					.removeClass("ui-selected")
					.removeClass("ui-state-highlight")
					.removeClass(self.options.selectedListItemClass);
		},

		_clearSelections: function(list)
		{
			var self = this;

			list.children().each(function()
			{
				self._removeSelection( $(this) );
			});
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
		},

		insert: function(item)
		{
			var self = this;

			var list = item.selected ? self.targetList : self.sourceList;
			list.append( self._createRichItem(item) );

			self._refresh();
		},

		_createRichItem: function(item)
		{
			var self = this;

			var selectItem = $("<option/>").val(item.value).text(item.label);

			if(item.selected)
			{
				selectItem.attr("selected", "selected");
			}

			self.element.append( selectItem );

			return $("<li/>")
					.val(item.value)
					.attr("label", item.label)
					.addClass(self.options.listItemClass)
					.addClass(self.options.richListItemClass)
					.append(item.element);
		}
	});
}(jQuery));
