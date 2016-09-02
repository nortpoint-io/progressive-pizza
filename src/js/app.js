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
        pizzaDialog: document.querySelector('dialog#pizza-dialog'),
        cartIcons: document.querySelectorAll('.cart-icon'),
        snackbar: document.querySelector('.mdl-snackbar'),
        cartDialog: document.querySelector('dialog#cart-dialog'),
        openCartButtons: document.querySelectorAll('.open-cart'),
        cartListItemTemplate: document.querySelector('.cartListItemTemplate')
    };

    if (!app.pizzaDialog.showModal) {
        dialogPolyfill.registerDialog(app.pizzaDialog);
    }

    app.pizzaDialog.querySelector('.close')
        .addEventListener('click', function() {
            app.closePizzaDialog();
        });

    if (!app.cartDialog.showModal) {
        dialogPolyfill.registerDialog(app.cartDialog);
    }

    app.cartDialog.querySelector('.close')
        .addEventListener('click', function() {
            app.cartDialog.close();
        });

    for (var i = 0; i < app.openCartButtons.length; i++) {
        app.openCartButtons[i].addEventListener('click', function(event) {
            event.preventDefault();
            app.showCartDialog();
        });
    }

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
            item.querySelector('.pizza-price').textContent
                                            = pizza.price.toFixed(2) + ' PLN';
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
        var item = app.pizzaDialog;
        item.querySelector('.pizza-price').textContent
                                            = pizza.price.toFixed(2) + ' PLN';
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

        app.pizzaDialog.showModal();
    };

    app.closePizzaDialog = function() {
        app.pizzaDialog.querySelector('.add-to-cart')
            .removeEventListener('click', app.dialogAddToCartHandler);
        delete app.dialogAddToCartHandler;
        app.pizzaDialog.close();
    };

    app.showCartDialog = function() {
        var cartList = app.cartDialog.querySelector('.cart-list');
        var oldItems = cartList.querySelectorAll('li');
        for (var i = 0; i < oldItems.length; i++) {
            cartList.removeChild(oldItems[i]);
        }

        for (i = 0; i < app.cart.length; i++) {
            var pizza = app.cart[i];
            var item = app.cartListItemTemplate.cloneNode(true);
            item.classList.remove('cartListItemTemplate');
            item.querySelector('.pizza-price').textContent
                                            = pizza.price.toFixed(2) + ' PLN';
            item.querySelector('.pizza-name').textContent = pizza.name;
            item.querySelector('.pizza-image')
                .setAttribute('src', './img/' + pizza.photo);

            cartList.appendChild(item);
        }

        var total = app.cart.reduce(function(a, b) {
            return a.price + b.price;
        });
        app.cartDialog.querySelector('.total-price').textContent
                                                = total.toFixed(2) + ' PLN';

        app.cartDialog.showModal();
    };

    app.updateCartIcon = function() {
        var count = app.cart.length;
        for (var i = 0; i < app.cartIcons.length; i++) {
            var cartIcon = app.cartIcons[i];
            cartIcon.setAttribute('data-badge', count);
            if (count) {
                cartIcon.classList.add('mdl-badge');
            } else {
                cartIcon.classList.remove('mdl-badge');
            }
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