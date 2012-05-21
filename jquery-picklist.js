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

			// Additional list items
			items:						[],

            // Allow string value for select options
            useData:                    false
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

			self._trigger("beforeBuild");

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

			self._trigger("afterBuild");
		},

		_buildSourceList: function()
		{
			var self = this;

			var container = $("<div/>")
					.addClass(self.options.listContainerClass)
					.addClass(self.options.sourceListContainerClass)
					.css({
						"-moz-user-select": "none",
						"-webkit-user-select": "none",
						"user-select": "none",
						"-ms-user-select": "none"
					})
					.each(function()
					{
						this.onselectstart = function() { return false; };
					});

			var label = $("<div/>")
					.text(self.options.sourceListLabel)
					.addClass(self.options.listLabelClass)
					.addClass(self.options.sourceListLabelClass);

			self.sourceList = $("<ul/>")
					.addClass(self.options.listClass)
					.addClass(self.options.sourceListClass)
					.delegate("li", "click", { pickList: self }, self._changeHandler);

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
					.css({
						"-moz-user-select": "none",
						"-webkit-user-select": "none",
						"user-select": "none",
						"-ms-user-select": "none"
					})
					.each(function()
					{
						this.onselectstart = function() { return false; };
					});

			var label = $("<div/>")
					.text(self.options.targetListLabel)
					.addClass(self.options.listLabelClass)
					.addClass(self.options.targetListLabelClass);

			self.targetList = $("<ul/>")
					.addClass(self.options.listClass)
					.addClass(self.options.targetListClass)
					.delegate("li", "click", { pickList: self }, self._changeHandler);

			container
					.append(label)
					.append(self.targetList);

			return container;
		},

		_buildControls: function()
		{
			var self = this;

			self.controls = $("<div/>").addClass(self.options.controlsContainerClass);

			self.addAllButton = $("<button type='button'/>").click({pickList: self}, self._addAllHandler).html(self.options.addAllLabel).addClass(self.options.addAllClass);
			self.addButton = $("<button type='button'/>").click({pickList: self}, self._addHandler).html(self.options.addLabel).addClass(self.options.addClass);
			self.removeButton = $("<button type='button'/>").click({pickList: self}, self._removeHandler).html(self.options.removeLabel).addClass(self.options.removeClass);
			self.removeAllButton = $("<button type='button'/>").click({pickList: self}, self._removeAllHandler).html(self.options.removeAllLabel).addClass(self.options.removeAllClass);

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

			self._trigger("beforePopulate");

			self.element.children().each(function()
			{
				var text = $(this).text();
				var copy = $("<li/>")
						.text(text)
						.val($(this).val())
						.attr("label", text)
						.addClass(self.options.listItemClass);

                if (self.options.useData) {
                    $(copy).val($(this).attr('data-value'));
                }


				if($(this).attr("selected") == "selected")
				{
					self.targetList.append( copy );
				}
				else
				{
					self.sourceList.append( copy );
				}
			});

			self.insertItems(self.options.items);

			self._trigger("afterPopulate");
		},

		_addItem: function(item)
		{
			var self = this;

			self.targetList.append( self._removeSelection(item) );

            self.element.children("[value='" + item.val() + "']").each(function()
            {
                $(this).attr("selected", "selected");
            });
		},

		_removeItem: function(item)
		{
			var self = this;

			self.sourceList.append( self._removeSelection(item) );

            self.element.children("[value='" + item.val() + "']").each(function()
            {
                $(this).removeAttr("selected");
            });
		},

		_addAllHandler: function(e)
		{
			var self = e.data.pickList;

			self._trigger("beforeAddAll");

            self.sourceList.children().each(function () {
                self._addSelectedItem($(this).val());
            });

            var items = self.sourceList.children();
			self.targetList.append( self._removeSelections(items) );

			self._refresh();

			self._trigger("afterAddAll");
		},

		_addHandler: function(e)
		{
			var self = e.data.pickList;

			self._trigger("beforeAdd");

            self.sourceList.children(".ui-selected").each(function () {
                self._addSelectedItem($(this).val());
            });

            var items = self.sourceList.children(".ui-selected");
			self.targetList.append( self._removeSelections(items) );

			self._refresh();

			self._trigger("afterAdd");
		},

		_removeHandler: function(e)
		{
			var self = e.data.pickList;

			self._trigger("beforeRemove");

            self.targetList.children(".ui-selected").each(function () {
                self._removeSelectedItem($(this).val());
            });

            var items = self.targetList.children(".ui-selected");
			self.sourceList.append( self._removeSelections(items) );

			self._refresh();

			self._trigger("afterRemove");
		},

		_removeAllHandler: function(e)
		{
			var self = e.data.pickList;

			self._trigger("beforeRemoveAll");

            self.targetList.children().each(function () {
               self._removeSelectedItem($(this).val());
            });

			var items = self.targetList.children();
			self.sourceList.append( self._removeSelections(items) );

			self._refresh();

			self._trigger("afterRemoveAll");
		},

		_refresh: function()
		{
			var self = this;

			self._trigger("beforeRefresh");

			self._refreshControls();

			// Sort the selection lists.
			if(self.options.sortItems)
			{
				self._sortItems(self.sourceList, self.options);
				self._sortItems(self.targetList, self.options);
			}

			self._trigger("afterRefresh");
		},

		_refreshControls: function()
		{
			var self = this;

			self._trigger("beforeRefreshControls");

			// Enable/disable the Add All button state.
			if(self.sourceList.children().length)
			{
				self.addAllButton.removeAttr("disabled");
			}
			else
			{
				self.addAllButton.attr("disabled", "disabled");
			}

			// Enable/disable the Remove All button state.
			if(self.targetList.children().length)
			{
				self.removeAllButton.removeAttr("disabled");
			}
			else
			{
				self.removeAllButton.attr("disabled", "disabled");
			}

			// Enable/disable the Add button state.
			if(self.sourceList.children(".ui-selected").length)
			{
				self.addButton.removeAttr("disabled");
			}
			else
			{
				self.addButton.attr("disabled", "disabled");
			}

			// Enable/disable the Remove button state.
			if(self.targetList.children(".ui-selected").length)
			{
				self.removeButton.removeAttr("disabled");
			}
			else
			{
				self.removeButton.attr("disabled", "disabled");
			}

			self._trigger("afterRefreshControls");
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

			self._refreshControls();
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

		_removeSelections: function(listItems)
		{
			var self = this;

			listItems.each(function()
			{
				$(this)
						.removeClass("ui-selected")
						.removeClass("ui-state-highlight")
						.removeClass(self.options.selectedListItemClass);
			});

			return listItems;
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
			var self = this;

			self._trigger("onDestroy");

			self.pickList.remove();
			self.element.show();

			$.Widget.prototype.destroy.call(self);
		},

		insert: function(item)
		{
			var self = this;

			var list = item.selected ? self.targetList : self.sourceList;
			var selectItem = self._createSelectItem(item);
			var listItem = (item.element == undefined) ? self._createRegularItem(item) : self._createRichItem(item);

			self.element.append(selectItem);
			list.append(listItem);

			self._refresh();
		},

		insertItems: function(items)
		{
			var self = this;

			var selectItems = [];
			var sourceItems = [];
			var targetItems = [];

			$(items).each(function()
			{
				var selectItem = self._createSelectItem(this);
				var listItem = (this.element == undefined) ? self._createRegularItem(this) : self._createRichItem(this);

				selectItems.push(selectItem);

				if(this.selected)
				{
					targetItems.push(listItem);
				}
				else
				{
					sourceItems.push(listItem);
				}
			});

			self.element.append(selectItems.join("\n"));
			self.sourceList.append(sourceItems.join("\n"));
			self.targetList.append(targetItems.join("\n"));
		},

		_createSelectItem: function(item)
		{
			var selected = item.selected ? " selected='selected'" : "";
			return "<option value='" + item.value + "'" + selected + ">" + item.label + "</option>";
		},

		_createRegularItem: function(item)
		{
			var self = this;
			return "<li value='" + item.value + "' label='" + item.label + "' class='" + self.options.listItemClass + "'>" + item.label + "</li>";
		},

		_createRichItem: function(item)
		{
			var self = this;

			var richItemHtml = item.element.clone().wrap("<div>").parent().html();
			item.element.hide();

			return "<li value='" + item.value + "' label='" + item.label + "' class='" + self.options.listItemClass + " " + self.options.richListItemClass + "'>" + richItemHtml + "</li>";
		},

        _addSelectedItem: function(value)
        {
            var self = this;
            if (self.options.useData) {
                self.element.children("[data-value='" + value + "']").each(function () {
                    $(this).attr("selected", "selected");
                });
            } else {
                self.element.children("[value='" + value + "']").each(function () {
                    $(this).attr("selected", "selected");
                });
            }
        },

        _removeSelectedItem: function(value)
        {
            var self = this;
            if (self.options.useData) {
                self.element.children("[data-value='" + value + "']").each(function () {
                    $(this).removeAttr("selected");
                });
            } else {
                self.element.children("[value='" + value + "']").each(function () {
                    $(this).removeAttr("selected");
                });
            }
        }
	});
}(jQuery));
