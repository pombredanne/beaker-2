
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.

;(function () {

window.UserRootPasswordView = Backbone.View.extend({
    template: JST['user-root-password'],
    events: {
        'submit form': 'save',
    },
    initialize: function (options) {
        this.default_root_password = options.default_root_password;
        this.default_root_passwords = options.default_root_passwords;
        this.render();
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        var html = this.template(this.model.attributes) +
                JST['default-root-password']({
                    default_root_password: this.default_root_password,
                    default_root_passwords: this.default_root_passwords,
                });
        this.$el.html(html);
    },
    save: function (evt) {
        evt.preventDefault();
        var $form = this.$('form');
        $form.find('button').button('loading');
        $form.find('.alert-error').remove();
        var new_root_password = $form.find('[name=root_password]').val();
        this.model.save({root_password: new_root_password}, {patch: true, wait: true})
            .always(function () { $form.find('button').button('reset'); })
            .fail(function (xhr) {
                $form.append(
                    $('<div class="alert alert-error"/>')
                        .text(xhr.statusText + ': ' + xhr.responseText));
            });
    },
});

window.UserSSHPublicKeysView = Backbone.View.extend({
    template: JST['user-ssh-public-keys'],
    events: {
        'submit form.add': 'add',
    },
    initialize: function() {
        this.render();
        this.listenTo(this.model.get('ssh_public_keys'), 'add remove reset', this.render);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$('.ssh-public-keys-list').append(this.model.get('ssh_public_keys').map(
                function (item) { return new UserSSHPublicKeyListItem({model: item}).el; }));
    },
    add: function (evt) {
        evt.preventDefault();
        var $form = $(evt.currentTarget), $el = this.$el;
        $form.find('button').button('loading');
        this.$('.alert-error').remove();
        this.model.add_ssh_public_key(this.$('[name=key]').val())
            .always(function () { $form.find('button').button('reset'); })
            .fail(function (xhr) {
                $el.append($('<div class="alert alert-error"/>')
                        .text(xhr.statusText + ': ' + xhr.responseText));
            });
    },
});

var UserSSHPublicKeyListItem = Backbone.View.extend({
    tagName: 'li',
    template: JST['user-ssh-public-key-list-item'],
    events: {
        'click .remove': 'remove',
    },
    initialize: function() {
        this.render();
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
    },
    remove: function (evt) {
        var $el = this.$el;
        this.$('button').button('loading');
        this.model.destroy({wait: true})
            .always(function () { $el.find('button').button('reset'); })
            .fail(function (xhr) {
                // show it in a growl because we can't cram it inside the list item
                $.bootstrapGrowl('<h4>Failed to remove SSH public key</h4>' +
                        xhr.statusText + ': ' + xhr.responseText,
                        {type: 'error'});
            });
    },
});

window.UserSubmissionDelegatesView = Backbone.View.extend({
    template: JST['user-submission-delegates'],
    events: {
        'click button.remove': 'remove',
        'submit form.add': 'add',
    },
    initialize: function() {
        this.render();
        this.listenTo(this.model.get('submission_delegates'), 'add remove reset', this.render);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.$('[name=user_name]').beaker_typeahead('user-name');
        // Focus the username input, but only if it's visible. (We might be 
        // showing another tab right now.)
        this.$('[name=user_name]:visible').focus();
    },
    add: function (evt) {
        evt.preventDefault();
        var $form = $(evt.currentTarget), $el = this.$el;
        this.$('.alert-error').remove();
        var new_delegate = this.$('[name=user_name]').val();
        if (this.model.get('submission_delegates').find(
                function (u) { return u.get('user_name') == new_delegate; })) {
            // nothing to do
            this.$('[name=user_name]').typeahead('setQuery', '');
            return;
        }
        $form.find('button').button('loading');
        this.model.add_submission_delegate(this.$('[name=user_name]').val())
            .always(function () { $form.find('button').button('reset'); })
            .fail(function (xhr) {
                $el.append($('<div class="alert alert-error"/>')
                        .text(xhr.statusText + ': ' + xhr.responseText));
            });
    },
    remove: function (evt) {
        var $button = $(evt.currentTarget);
        $button.button('loading');
        this.model.remove_submission_delegate($button.data('username'))
            .always(function () { $button.button('reset'); })
            .fail(function (xhr) {
                // show it in a growl because we can't cram it inside the list item
                $.bootstrapGrowl('<h4>Failed to remove submission delegate</h4>' +
                        xhr.statusText + ': ' + xhr.responseText,
                        {type: 'error'});
            });
    },
});

})();