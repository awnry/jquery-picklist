describe("Pick List (Int)", function () {

    beforeEach(function () {
        loadFixtures('int_data.html');

        expect($('#languages')).toBeVisible();
        $('#languages').pickList({sortItems: false});
        expect($('#languages')).toBeHidden();
    });

    it("should populate source list", function () {

        var sourceListContainer = $('.pickList_sourceListContainer');
        expect(sourceListContainer).toExist();
        var sourceListLabel = sourceListContainer.children().first();
        expect(sourceListLabel.text()).toBe('Available');
        var sourceList = sourceListLabel.next();
        var options = sourceList.children();
        expect(options.size()).toBe(4);

        expect($(options.get(0)).text()).toBe('Java');
        expect($(options.get(0)).attr('value')).toBe(1);

        expect($(options.get(1)).text()).toBe('Groovy');
        expect($(options.get(1)).attr('value')).toBe(2);

        expect($(options.get(2)).text()).toBe('JavaScript');
        expect($(options.get(2)).attr('value')).toBe(3);

        expect($(options.get(3)).text()).toBe('CoffeeScript');
        expect($(options.get(3)).attr('value')).toBe(4);
    });

    it("should create empty target list", function () {
        var targetListContainer = $('.pickList_targetListContainer');
        var targetListLabel = targetListContainer.children().first();
        expect(targetListLabel.text()).toBe('Selected');
        var targetList = targetListLabel.next();
        expect(targetList).toBeEmpty();
    });

    it("should select an item from list", function () {
        var sourceList = $('.pickList_sourceListContainer > ul');
        var options = sourceList.children();
        expect(options.size()).toBe(4);
        $(options[0]).addClass("ui-selected");
        var addButton = $('.pickList_add');
        $(addButton).click();
        options = sourceList.children();
        expect(options.size()).toBe(3);

        var targetList = $('.pickList_targetListContainer > ul');
        expect(targetList.children().size()).toBe(1);

        expect($('#languages :selected').size()).toBe(1);
        expect($('#languages :selected').text()).toBe('Java');
    });

    it("should select all items from source list", function () {
        var sourceList = $('.pickList_sourceListContainer > ul');
        var options = sourceList.children();
        expect(options.size()).toBe(4);
        var addAllButton = $('.pickList_addAll');
        $(addAllButton).click();
        expect(sourceList).toBeEmpty();

        var targetList = $('.pickList_targetListContainer > ul');
        expect(targetList.children().size()).toBe(4);

        expect($('#languages :selected').size()).toBe(4);
    });

    it("should remove an item from target list", function () {
        var sourceList = $('.pickList_sourceListContainer > ul');
        var addAllButton = $('.pickList_addAll');
        $(addAllButton).click();
        expect(sourceList).toBeEmpty();

        var targetList = $('.pickList_targetListContainer > ul');
        expect(targetList.children().size()).toBe(4);

        expect($('#languages :selected').size()).toBe(4);

        var targetOptions = targetList.children();
        $(targetOptions[0]).addClass('ui-selected')
        var removeButton = $('.pickList_remove')
        removeButton.click();
        targetOptions = targetList.children();
        expect(targetOptions.size()).toBe(3);
        expect(sourceList.children().size()).toBe(1);
        expect($('#languages :selected').size()).toBe(3);
    });

    it("should remove all items from target list", function () {
            var sourceList = $('.pickList_sourceListContainer > ul');
            var addAllButton = $('.pickList_addAll');
            $(addAllButton).click();
            expect(sourceList).toBeEmpty();

            var targetList = $('.pickList_targetListContainer > ul');
            expect(targetList.children().size()).toBe(4);

            expect($('#languages :selected').size()).toBe(4);

            var removeAllButton = $('.pickList_removeAll')
            removeAllButton.click();
            expect(targetList).toBeEmpty();
            expect(sourceList.children().size()).toBe(4);
            expect($('#languages :selected').size()).toBe(0);



        });
});