/* global dialogPolyfill */

(function() {
    'use strict';

    var app = {
        isLoading: true,
        basket: [],
        pizzas: [],
        spinner: document.querySelector('.spinner'),
        pizzasListContainer: document.querySelector('.pizza-list'),
        pizzasList: document.querySelector('.pizza-list > ul'),
        pizzaListItemTemplate: document.querySelector('.pizzaListItemTemplate'),
        dialog: document.querySelector('dialog#pizza-dialog')
    };

    if (! app.dialog.showModal) {
        dialogPolyfill.registerDialog(app.dialog);
    }

    app.dialog.querySelector('.close').addEventListener('click', function() {
        app.dialog.close();
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

    var pizzaListItemEventListener = function(pizza) {
        return function() {
            app.showPizzaDialog(pizza);
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
                .addEventListener('click', pizzaListItemEventListener(pizza));
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

        var ingredients = '';
        for (var i = 0; i < pizza.ingredients.length; i++) {
            if (i > 0) {
                ingredients += ', ';
            }
            ingredients += pizza.ingredients[i];
        }
        item.querySelector('.pizza-ingredients').textContent = ingredients;

        app.dialog.showModal();
    };

    app.getPizzas();

    /*
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
                .register('/service-worker.js');
    }
    */
})();