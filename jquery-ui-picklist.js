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
	if($.widget == null)
	{
		// jQuery 1.4+
		if ( $.cleanData ) {
			var _cleanData = $.cleanData;
			$.cleanData = function( elems ) {
				for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
					try {
						$( elem ).triggerHandler( "remove" );
					// http://bugs.jquery.com/ticket/8235
					} catch( e ) {}
				}
				_cleanData( elems );
			};
		} else {
			var _remove = $.fn.remove;
			$.fn.remove = function( selector, keepData ) {
				return this.each(function() {
					if ( !keepData ) {
						if ( !selector || $.filter( selector, [ this ] ).length ) {
							$( "*", this ).add( [ this ] ).each(function() {
								try {
									$( this ).triggerHandler( "remove" );
								// http://bugs.jquery.com/ticket/8235
								} catch( e ) {}
							});
						}
					}
					return _remove.call( $(this), selector, keepData );
				});
			};
		}

		$.widget = function( name, base, prototype ) {
			var namespace = name.split( "." )[ 0 ],
				fullName;
			name = name.split( "." )[ 1 ];
			fullName = namespace + "-" + name;

			if ( !prototype ) {
				prototype = base;
				base = $.Widget;
			}

			// create selector for plugin
			$.expr[ ":" ][ fullName ] = function( elem ) {
				return !!$.data( elem, name );
			};

			$[ namespace ] = $[ namespace ] || {};
			$[ namespace ][ name ] = function( options, element ) {
				// allow instantiation without initializing for simple inheritance
				if ( arguments.length ) {
					this._createWidget( options, element );
				}
			};

			var basePrototype = new base();
			// we need to make the options hash a property directly on the new instance
			// otherwise we'll modify the options hash on the prototype that we're
			// inheriting from
//			$.each( basePrototype, function( key, val ) {
//				if ( $.isPlainObject(val) ) {
//					basePrototype[ key ] = $.extend( {}, val );
//				}
//			});
			basePrototype.options = $.extend( true, {}, basePrototype.options );
			$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
				namespace: namespace,
				widgetName: name,
				widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
				widgetBaseClass: fullName
			}, prototype );

			$.widget.bridge( name, $[ namespace ][ name ] );
		};

		$.widget.bridge = function( name, object ) {
			$.fn[ name ] = function( options ) {
				var isMethodCall = typeof options === "string",
					args = Array.prototype.slice.call( arguments, 1 ),
					returnValue = this;

				// allow multiple hashes to be passed on init
				options = !isMethodCall && args.length ?
					$.extend.apply( null, [ true, options ].concat(args) ) :
					options;

				// prevent calls to internal methods
				if ( isMethodCall && options.charAt( 0 ) === "_" ) {
					return returnValue;
				}

				if ( isMethodCall ) {
					this.each(function() {
						var instance = $.data( this, name ),
							methodValue = instance && $.isFunction( instance[options] ) ?
								instance[ options ].apply( instance, args ) :
								instance;
						// TODO: add this back in 1.9 and use $.error() (see #5972)
//						if ( !instance ) {
//							throw "cannot call methods on " + name + " prior to initialization; " +
//								"attempted to call method '" + options + "'";
//						}
//						if ( !$.isFunction( instance[options] ) ) {
//							throw "no such method '" + options + "' for " + name + " widget instance";
//						}
//						var methodValue = instance[ options ].apply( instance, args );
						if ( methodValue !== instance && methodValue !== undefined ) {
							returnValue = methodValue;
							return false;
						}
					});
				} else {
					this.each(function() {
						var instance = $.data( this, name );
						if ( instance ) {
							instance.option( options || {} )._init();
						} else {
							$.data( this, name, new object( options, this ) );
						}
					});
				}

				return returnValue;
			};
		};

		$.Widget = function( options, element ) {
			// allow instantiation without initializing for simple inheritance
			if ( arguments.length ) {
				this._createWidget( options, element );
			}
		};

		$.Widget.prototype = {
			widgetName: "widget",
			widgetEventPrefix: "",
			options: {
				disabled: false
			},
			_createWidget: function( options, element ) {
				// $.widget.bridge stores the plugin instance, but we do it anyway
				// so that it's stored even before the _create function runs
				$.data( element, this.widgetName, this );
				this.element = $( element );
				this.options = $.extend( true, {},
					this.options,
					this._getCreateOptions(),
					options );

				var self = this;
				this.element.bind( "remove." + this.widgetName, function() {
					self.destroy();
				});

				this._create();
				this._trigger( "create" );
				this._init();
			},
			_getCreateOptions: function() {
				return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
			},
			_create: function() {},
			_init: function() {},

			destroy: function() {
				this.element
					.unbind( "." + this.widgetName )
					.removeData( this.widgetName );
				this.widget()
					.unbind( "." + this.widgetName )
					.removeAttr( "aria-disabled" )
					.removeClass(
						this.widgetBaseClass + "-disabled " +
						"ui-state-disabled" );
			},

			widget: function() {
				return this.element;
			},

			option: function( key, value ) {
				var options = key;

				if ( arguments.length === 0 ) {
					// don't return a reference to the internal hash
					return $.extend( {}, this.options );
				}

				if  (typeof key === "string" ) {
					if ( value === undefined ) {
						return this.options[ key ];
					}
					options = {};
					options[ key ] = value;
				}

				this._setOptions( options );

				return this;
			},
			_setOptions: function( options ) {
				var self = this;
				$.each( options, function( key, value ) {
					self._setOption( key, value );
				});

				return this;
			},
			_setOption: function( key, value ) {
				this.options[ key ] = value;

				if ( key === "disabled" ) {
					this.widget()
						[ value ? "addClass" : "removeClass"](
							this.widgetBaseClass + "-disabled" + " " +
							"ui-state-disabled" )
						.attr( "aria-disabled", value );
				}

				return this;
			},

			enable: function() {
				return this._setOption( "disabled", false );
			},
			disable: function() {
				return this._setOption( "disabled", true );
			},

			_trigger: function( type, event, data ) {
				var prop, orig,
					callback = this.options[ type ];

				data = data || {};
				event = $.Event( event );
				event.type = ( type === this.widgetEventPrefix ?
					type :
					this.widgetEventPrefix + type ).toLowerCase();
				// the original event may come from any element
				// so we need to reset the target on the new event
				event.target = this.element[ 0 ];

				// copy original event properties over to the new event
				orig = event.originalEvent;
				if ( orig ) {
					for ( prop in orig ) {
						if ( !( prop in event ) ) {
							event[ prop ] = orig[ prop ];
						}
					}
				}

				this.element.trigger( event, data );

				return !( $.isFunction(callback) &&
					callback.call( this.element[0], event, data ) === false ||
					event.isDefaultPrevented() );
			}
		};
	}

/******************************************************************************/

	// Our actual widget code begins here.
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

			self.addAllButton = $("<button/>").click({pickList: self}, self._addAllHandler).html(self.options.addAllLabel).addClass(self.options.addAllClass);
			self.addButton = $("<button/>").click({pickList: self}, self._addHandler).html(self.options.addLabel).addClass(self.options.addClass);
			self.removeButton = $("<button/>").click({pickList: self}, self._removeHandler).html(self.options.removeLabel).addClass(self.options.removeClass);
			self.removeAllButton = $("<button/>").click({pickList: self}, self._removeAllHandler).html(self.options.removeAllLabel).addClass(self.options.removeAllClass);

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

			// Enable/disable the Add All button state.
			if(self.sourceList.children().length > 0)
			{
				self.addAllButton.removeAttr("disabled");
			}
			else
			{
				self.addAllButton.attr("disabled", "disabled");
			}

			// Enable/disable the Remove All button state.
			if(self.targetList.children().length > 0)
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
