import { Collapse } from "bootstrap";


document.addEventListener('DOMContentLoaded', () => {


    const container = document.querySelector('.tile-container');

    const items = document.querySelectorAll('.location-tiles');

    const description = document.querySelector('#tims-collapse');

    const descriptionCollapse = new Collapse(description, {toggle: false});

    items.forEach(item => {
        item.addEventListener('click', () => {
            

            if (container.classList.contains('slide-left')) {
                container.style.transform = 'translateX(0)';
                container.classList.remove('slide-left');
            } else {
                container.style.transform = 'translateX(50px)';
                container.classList.add('slide-left');
            }

            descriptionCollapse.toggle();
        });
    });
});