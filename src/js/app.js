/* global dialogPolyfill */

(function() {
    'use strict';

    var app = {
        isLoading: true,
        cart: [],
        spinner: document.querySelector('.spinner'),
        pizzasListContainer: document.querySelector('.pizza-list'),
        pizzasList: document.querySelector('.pizza-list > ul'),
        pizzaListItemTemplate: document.querySelector('.pizzaListItemTemplate'),
        dialog: document.querySelector('dialog#pizza-dialog'),
        cartIcon: document.querySelector('.cart-icon'),
        snackbar: document.querySelector('.mdl-snackbar')
    };

    if (! app.dialog.showModal) {
        dialogPolyfill.registerDialog(app.dialog);
    }

    app.dialog.querySelector('.close').addEventListener('click', function() {
        app.closePizzaDialog();
    });

    app.getPizzas = function() {
        var url = './api/pizzas.json';

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    app.updatePizzasList(response);
                }
            }
        };
        request.open('GET', url);
        request.send();
    };

    var pizzaListItemClickEventListener = function(pizza) {
        return function() {
            app.showPizzaDialog(pizza);
        };
    };

    var pizzaListItemAddToCartClickEventListener = function(pizza) {
        return function(event) {
            event.preventDefault();
            app.addToCart(pizza);
        };
    };

    app.updatePizzasList = function(pizzas) {
        for (var i = 0; i < pizzas.length; i++) {
            var pizza = pizzas[i];
            var item = app.pizzaListItemTemplate.cloneNode(true);
            item.classList.remove('pizzaListItemTemplate');
            item.querySelector('.pizza-price').textContent = pizza.price
                                                                    + ' PLN';
            item.querySelector('.pizza-name').textContent = pizza.name;
            item.querySelector('.pizza-image')
                .setAttribute('src', './img/' + pizza.photo);
            item.querySelector('.mdl-list__item-primary-content')
                .addEventListener('click',
                                pizzaListItemClickEventListener(pizza));
            item.querySelector('.add-to-cart')
                .addEventListener('click',
                            pizzaListItemAddToCartClickEventListener(pizza));
            app.pizzasList.appendChild(item);
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.pizzasListContainer.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    app.showPizzaDialog = function(pizza) {
        var item = app.dialog;
        item.querySelector('.pizza-price').textContent = pizza.price
                                                                    + ' PLN';
        item.querySelector('.pizza-name').textContent = pizza.name;
        item.querySelector('.pizza-image')
            .setAttribute('src', './img/' + pizza.photo);

        var ingredients = pizza.ingredients.join(', ');
        item.querySelector('.pizza-ingredients').textContent = ingredients;

        app.dialogAddToCartHandler = function(event) {
            event.preventDefault();

            app.closePizzaDialog();
            app.addToCart(pizza);
        };
        item.querySelector('.add-to-cart')
            .addEventListener('click', app.dialogAddToCartHandler);

        app.dialog.showModal();
    };

    app.closePizzaDialog = function() {
        app.dialog.querySelector('.add-to-cart')
            .removeEventListener('click', app.dialogAddToCartHandler);
        delete app.dialogAddToCartHandler;
        app.dialog.close();
    };

    app.updateCartIcon = function() {
        var count = app.cart.length;
        app.cartIcon.setAttribute('data-badge', count);
        if (count) {
            app.cartIcon.classList.add('mdl-badge');
        } else {
            app.cartIcon.classList.remove('mdl-badge');
        }
    };

    app.showSnackbar = function(data) {
        app.snackbar.MaterialSnackbar.showSnackbar(data);
    };

    app.addToCart = function(pizza) {
        app.cart.push(pizza);
        app.updateCartIcon();

        var handler = function() {
            var index = app.cart.indexOf(pizza);
            if (index >= 0) {
                app.cart.splice(index, 1);
                app.updateCartIcon();
            }
        };

        var data = {
            message: 'Dodano ' + pizza.name + ' do zamówienia',
            timeout: 2000,
            actionHandler: handler,
            actionText: 'Cofnij'
        };
        app.showSnackbar(data);
    };

    app.getPizzas();

    /*
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
                .register('/service-worker.js');
    }
    */
})();