(function() {
    'use strict';

    var app = {
        isLoading: true,
        basket: [],
        pizzas: [],
        spinner: document.querySelector('.spinner'),
        pizzasListContainer: document.querySelector('.pizza-list'),
        pizzasList: document.querySelector('.pizza-list > ul'),
        pizzaListItemTemplate: document.querySelector('.pizzaListItemTemplate')
    };

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

    app.updatePizzasList = function(pizzas) {
        for (var i = 0; i < pizzas.length; i++) {
            var pizza = pizzas[i];
            var item = app.pizzaListItemTemplate.cloneNode(true);
            item.classList.remove('pizzaListItemTemplate');
            item.querySelector('.pizza-price').textContent = pizza.price
                                                                    + ' PLN';
            item.querySelector('.pizza-name').textContent = pizza.name;
            app.pizzasList.appendChild(item);
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.pizzasListContainer.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    app.getPizzas();

    /*
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
                .register('/service-worker.js');
    }
    */
})();