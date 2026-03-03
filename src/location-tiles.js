import { Collapse } from "bootstrap";


document.addEventListener('DOMContentLoaded', () => {


    const tile = document.querySelector('.location-tiles');

    const items = document.querySelectorAll('.location-tiles');

    const description = document.querySelector('#tims-collapse');

    const confirmButton = document.querySelector('#confirm');
    const updateButton = document.querySelector('#update');


    const descriptionCollapse = new Collapse(description, {toggle: false});
    const updateCollapse = new Collapse(document.querySelector('#update-collapse'), {toggle: false});

    // items.forEach(item => {
    //     item.addEventListener('click', () => {
            
    //         if (container.classList.contains('btn')) {

    //             alert('Wait time confirmed! Thank you for your feedback.');
    //             console.log('Wait time confirmed! Thank you for your feedback.');
    //         }

    //         descriptionCollapse.toggle();
    //     });
    // });


    tile.addEventListener('click', () => {

        descriptionCollapse.toggle();

    });



    confirmButton.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('Wait time confirmed! Thank you for your feedback.');
        console.log('Wait time confirmed! Thank you for your feedback.');
    });

     // "Update Wait Time" button
    updateButton.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent the tile click from also firing
        // TODO: fill out logic
        updateCollapse.toggle();
        console.log('Update wait time clicked!');
    });

});